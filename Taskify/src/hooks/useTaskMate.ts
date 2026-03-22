import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import {
    useLLM,
    SMOLLM2_1_360M_QUANTIZED,
    ResourceFetcher,
    Message,
} from 'react-native-executorch';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { taskApi } from '../api/tasks';
import { ideaApi } from '../api/ideas';
import { groupApi } from '../api/groups';
import { fetchTasks, selectUnifiedTasks } from '../store/slices/taskSlice';
import { fetchIdeas, addIdea, updateIdea } from '../store/slices/ideaSlice';
import { fetchGroups, addGroup } from '../store/slices/groupSlice';
import { useDeviceCapability } from '../utils/usedevicecapability';
import { MATE_MODELS } from '../constants/mateModels';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export type AgentStatus = 'initializing' | 'ready' | 'error' | string;

type KnownIntent =
    | 'get_tasks' | 'create_task'
    | 'get_ideas' | 'create_idea' | 'get_specific_idea'
    | 'add_idea_note' | 'delete_idea_note'
    | 'create_group' | 'get_groups' | 'get_specific_group'
    | 'get_specific_group_tasks' | 'create_group_task'
    | 'chat';

// ─── Date helpers ─────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const tomorrowDate = (now: Date) => { const d = new Date(now); d.setDate(d.getDate() + 1); return d; };

// ─── Pipeline result types ────────────────────────────────────────────────────

interface PipelineResult {
    intent: KnownIntent;
    args: Record<string, any>;
    needs_llm: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRIAGE ROUTER — Two-Mode Output Architecture
// ═══════════════════════════════════════════════════════════════════════════════
//
// Architecture:
//
//   Fast path  → deterministic JS regex router (0ms, covers ~80% of cases)
//   Triage path → instruction-tuned small model (Qwen 0.5B / Hammer 0.5B)
//                 when regex is ambiguous or returns chat intent
//
// The small model outputs ONE of two structured modes per message:
//
//   DIRECT  — fire the tool + write its own short reply (big LLM never loads)
//   HANDOFF — signal that big LLM is needed (big LLM writes the final reply)
//
// Multi-turn handling: the last assistant message is injected into the
// small model's context so it can resolve references like "Sure schedule it"
// without the big LLM needing to be involved again.
//
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// PURE-LLM ROUTER — all intent + arg extraction done by the small model
// ═══════════════════════════════════════════════════════════════════════════════
//
// Architecture (single-step, no regex fast path):
//
//   ALL inputs → 0.5B instruction-tuned model (Qwen 2.5 0.5B / Qwen 3 0.6B)
//
//     DIRECT  → small model executes the tool AND writes its own reply.
//               Big LLM never wakes up. Fast, private, offline.
//
//     HANDOFF → small model signals reasoning is needed.
//               Big LLM (local Qwen / Gemini cloud) writes the final reply.
//
// Multi-turn: last assistant message is injected as context so the small model
// can resolve confirmations like "Sure schedule it" without hallucinating.
//
// Dates: today + tomorrow are provided in the system prompt so the model never
// has to compute them. The model outputs ISO 8601 dates directly in ARGS.
//
// ═══════════════════════════════════════════════════════════════════════════════



// ─── Two-mode router prompt ───────────────────────────────────────────────────
// Designed for instruction-tuned 0.5B–1.7B models (Qwen 2.5, Qwen 3, Hammer).
// Uses KEY: VALUE format — trivially parseable, and small models complete it
// reliably because each line is an independent completion task.
//
// Two output modes:
//   DIRECT  — model fires the tool AND writes a short friendly reply itself
//   HANDOFF — model signals the big LLM should handle reasoning/explanation
//
// The last assistant message is injected as prior context so the model can
// resolve multi-turn references like "Sure schedule it" without hallucinating.

const ROUTER_SYSTEM_PROMPT = `You are a task management routing assistant. Your job:
1. Understand what the user wants
2. Choose the right tool (or none)
3. Decide if you can reply directly or need to hand off to a larger model

Available tools:
- create_task: {title, dueDate?, description?} — dueDate in ISO 8601
- get_tasks: {dueDate?} — omit for all tasks
- create_idea: {title}
- get_ideas: {}
- get_specific_idea: {title}
- add_idea_note: {title, content}
- delete_idea_note: {title, noteContent?}
- create_group: {name, members?}
- get_groups: {}
- get_specific_group: {name}
- get_specific_group_tasks: {name}
- create_group_task: {groupName, assigneeUsername, title, dueDate?}
- none: no tool needed

Rules:
- ANY message with a clear action verb (add, create, schedule, remind, delete, show, list, get) → HANDOFF: false, fire the tool and write REPLY yourself
- Even mid-conversation, if the user says "add a task" or "schedule X" → DIRECT, never HANDOFF
- Reasoning, advice, planning analysis, or vague open-ended questions with no clear tool → HANDOFF: true
- If previous assistant said something and user confirms or amends → resolve from context, act DIRECT
- If unsure → HANDOFF: true (safe)

Examples:
  User: "add gardening task for tomorrow 4pm" → TOOL: create_task, HANDOFF: false
  User: "show my tasks" → TOOL: get_tasks, HANDOFF: false
  User: "can you help me plan my week?" → TOOL: get_tasks, HANDOFF: true
  User: "ok great schedule it" (after assistant proposed a task) → TOOL: create_task, HANDOFF: false

Output (EXACTLY this structure, one field per line):
TOOL: <tool_name or none>
ARGS: <json object>
HANDOFF: <true or false>
REPLY: <short friendly reply — only if HANDOFF is false, omit if HANDOFF is true>`;

const buildTwoModeRouterPrompt = (
    userInput: string,
    lastAssistantMsg: string | null,
    todayISO: string,
    tomorrowISO: string,
    contextHint: string,
): Message[] => [
    {
        role: 'system',
        content: `${ROUTER_SYSTEM_PROMPT}\n\nToday: ${todayISO}\nTomorrow: ${tomorrowISO}\nContext: ${contextHint}`,
    },
    // Inject last assistant message for multi-turn context resolution.
    // Model sees what was suggested and can resolve "Sure, do it" correctly.
    ...(lastAssistantMsg
        ? [{ role: 'assistant' as const, content: lastAssistantMsg.slice(0, 400) }]
        : []),
    {
        role: 'user' as const,
        content: userInput,
    },
];

interface TwoModeOutput {
    tool: KnownIntent | 'none';
    args: Record<string, any>;
    handoff: boolean;
    reply: string | null;
}

const parseTwoModeOutput = (raw: string): TwoModeOutput => {
    const clean = raw
        .replace(/<\|im_start\|>[\s\S]*/g, '')
        .replace(/<\|im_end\|>[\s\S]*/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();

    const get = (key: string): string | null => {
        const match = clean.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
        return match?.[1]?.trim() ?? null;
    };

    const toolRaw = (get('TOOL') ?? 'none').toLowerCase().replace(/[^a-z_]/g, '');
    const argsRaw = get('ARGS') ?? '{}';
    const handoffRaw = (get('HANDOFF') ?? 'true').toLowerCase();
    const reply = get('REPLY');

    let args: Record<string, any> = {};
    try {
        args = JSON.parse(argsRaw);
    } catch {
        // Fallback: extract key="value" pairs if JSON is malformed
        const kvPairs = argsRaw.match(/(\w+)\s*[:=]\s*"([^"]*)"/g) ?? [];
        kvPairs.forEach(pair => {
            const m = pair.match(/(\w+)\s*[:=]\s*"([^"]*)"/);
            if (m) args[m[1]] = m[2];
        });
    }

    // Never handoff for pure action intents even if model says true
    const alwaysDirect: string[] = [
        'create_task', 'create_idea', 'create_group', 'create_group_task',
        'add_idea_note', 'delete_idea_note', 'get_ideas', 'get_groups',
        'get_specific_idea', 'get_specific_group', 'get_specific_group_tasks',
    ];
    const effectiveHandoff = alwaysDirect.includes(toolRaw)
        ? false
        : handoffRaw !== 'false';

    console.log(`[TRIAGE] tool:${toolRaw} handoff:${effectiveHandoff} reply:"${reply?.slice(0, 60) ?? 'none'}"`);
    return {
        tool: toolRaw as KnownIntent | 'none',
        args,
        handoff: effectiveHandoff,
        reply: reply && reply.length > 0 ? reply : null,
    };
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export const useTaskMate = (selectedModelId: string, setSelectedModelId: (id: string) => void) => {
    const dispatch = useDispatch<AppDispatch>();

    const [agentStatus, setAgentStatus] = useState<AgentStatus>('initializing');
    const [activeModel, setActiveModel] = useState<any>(null);
    const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
    const [input, setInput] = useState('');

    // Sliding window: ONLY real user messages + final assistant responses.
    // SmolLM pipeline steps, tool results, and raw data NEVER appear here.
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const { contextWindowSize } = useSelector((s: RootState) => s.mateConfig);
    const { currentUserId, users } = useSelector((s: RootState) => s.auth);
    const currentUser = users.find(u => u.id === currentUserId);
    const token = currentUser?.accessToken;

    const { groups } = useSelector((s: RootState) => s.groups);
    const { ideas } = useSelector((s: RootState) => s.ideas);
    const unifiedTasks = useSelector(selectUnifiedTasks);
    const capability = useDeviceCapability();

    const [phase, setPhase] = useState<'routing' | 'switching' | 'loading' | 'reasoning' | 'api'>('routing');
    const [modelConfig, setModelConfig] = useState<any>(SMOLLM2_1_360M_QUANTIZED);
    const pendingReasoningRef = useRef<Message[] | null>(null);

    // Busy guard: each generateSafe call holds this true for the duration +
    // 150ms settle. Prevents back-to-back calls crashing LLMController.
    const llmBusyRef = useRef(false);
    const SETTLE_MS = 150;

    const llm = useLLM({
        model: modelConfig,
        preventLoad: phase === 'switching' || phase === 'api',
    });

    // ─── generateSafe ─────────────────────────────────────────────────────────

    const generateSafe = useCallback(async (msgs: Message[], label = 'LLM'): Promise<string> => {
        if (llmBusyRef.current) {
            console.warn(`[${label}] busy — waiting`);
            // Wait up to 2s for the previous call to settle
            await new Promise<void>(resolve => {
                const interval = setInterval(() => {
                    if (!llmBusyRef.current) { clearInterval(interval); resolve(); }
                }, 50);
                setTimeout(() => { clearInterval(interval); resolve(); }, 2000);
            });
        }
        llmBusyRef.current = true;
        try {
            const result = (await llm.generate(msgs)) ?? '';
            console.log(`[${label}] raw: "${result.slice(0, 100).replace(/\n/g, '↵')}"`);
            return result;
        } finally {
            await new Promise(r => setTimeout(r, SETTLE_MS));
            llmBusyRef.current = false;
        }
    }, [llm]);

    // ─── Context hint ─────────────────────────────────────────────────────────

    const buildContextHint = (): string => {
        const ideaTitles = ideas.slice(0, 5).map(i => i.title).join(', ');
        const groupNames = groups.map(g => g.name).join(', ');
        return `Ideas:[${ideaTitles || 'none'}] Groups:[${groupNames || 'none'}]`;
    };

    // ─── Small model pipeline (pure LLM routing) ──────────────────────────────
    // Every user message goes to the 0.5B instruction-tuned model.
    // No regex. No fast-path. The model decides intent, args, and whether to
    // hand off to the big LLM — all in a single inference pass.
    //
    // Fallback: if the small model fails (OOM, timeout, malformed output),
    // we default to HANDOFF=true so the big LLM handles it gracefully.

    const runSmolPipeline = async (
        userInput: string,
        todayISO: string,
        tomorrowISO: string,
        lastAssistantMsg: string | null,
    ): Promise<PipelineResult & { smallModelReply: string | null }> => {
        setAgentStatus('🤖 Thinking...');
        try {
            const prompt = buildTwoModeRouterPrompt(
                userInput, lastAssistantMsg, todayISO, tomorrowISO, buildContextHint()
            );
            const raw = await generateSafe(prompt, 'ROUTER');
            const parsed = parseTwoModeOutput(raw);

            const intent = parsed.tool !== 'none' ? parsed.tool as KnownIntent : 'chat';
            console.log(`[PIPELINE] intent:${intent} handoff:${parsed.handoff} args:${JSON.stringify(parsed.args)}`);

            return {
                intent,
                args: parsed.args,
                needs_llm: parsed.handoff || intent === 'chat',
                smallModelReply: parsed.reply,
            };
        } catch (e) {
            // Small model failed — safe fallback to big LLM
            console.error('[ROUTER] small model error, falling back to HANDOFF:', e);
            return { intent: 'chat', args: {}, needs_llm: true, smallModelReply: null };
        }
    };

    // ─── Reasoning backend ────────────────────────────────────────────────────

    const resolveReasoningBackend = (): 'api' | 'local' | 'none' => {
        if (selectedModelId === 'gemini_api') return 'api';
        const allModels = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        const meta = allModels.find(m => m.id === selectedModelId);
        if (meta?.isApi) return 'api';
        if (activeModel) return 'local';
        return 'none';
    };

    // ─── Model switching effect ───────────────────────────────────────────────
    //
    // Model loading strategy:
    //   1. Session start → SmolLM loads (router model)
    //   2. First HANDOFF → SmolLM unloads, reasoning model loads
    //   3. After reasoning → STAY on reasoning model (no reload of SmolLM)
    //      The reasoning model is capable enough to also run the router prompt.
    //      This eliminates 2 model swaps per HANDOFF turn.
    //   4. Only reload SmolLM if no reasoning model is active (activeModel = null)

    useEffect(() => {
        if (phase === 'switching' && !llm.isReady) {
            if (pendingReasoningRef.current) {
                // Need to load reasoning model
                const nextModel = activeModel ?? SMOLLM2_1_360M_QUANTIZED;
                console.log(`[MODEL-SWITCH] loading: ${activeModel ? 'reasoning' : 'SmolLM (no reasoning model set)'}`);
                const timer = setTimeout(() => { setModelConfig(nextModel); setPhase('loading'); }, 1000);
                return () => clearTimeout(timer);
            } else {
                // Reasoning done — stay on current model, return to routing
                // Do NOT reload SmolLM. The currently warm model handles routing too.
                console.log(`[MODEL-SWITCH] reasoning done → staying on current model, returning to routing`);
                setPhase('routing');
            }
        }
        if (phase === 'loading' && llm.isReady) {
            if (pendingReasoningRef.current) {
                console.log('[LOCAL-LLM] Ready → generating');
                setPhase('reasoning');
                setAgentStatus('🧠 Reasoning...');
                llm.generate(pendingReasoningRef.current)
                    .then(res => {
                        const text = res?.trim() ?? '';
                        console.log(`[LOCAL-LLM] ${text.length} chars: "${text.slice(0, 120)}"`);
                        if (text) appendFinalMessage(text);
                    })
                    .catch(e => { console.error('[LOCAL-LLM] Error:', e); setAgentStatus('error'); })
                    .finally(() => { pendingReasoningRef.current = null; setPhase('switching'); });
            } else {
                setPhase('routing'); setAgentStatus('ready');
            }
        }
    }, [phase, llm.isReady, activeModel]);

    useEffect(() => {
        if (phase === 'routing' && llm.isReady) setAgentStatus('ready');
        else if (llm.error) { console.error('[LLM]', llm.error); setAgentStatus('error'); }
        else if (phase === 'loading') setAgentStatus('⏳ Loading...');
        else if (phase === 'switching') setAgentStatus('🔄 Swapping...');
    }, [llm.isReady, phase, llm.error]);

    // ─── Message helpers ──────────────────────────────────────────────────────
    // Note: appendToolMessageTracked / appendFinalMessageTracked are defined
    // after lastAssistantMsgRef below handleSend. These base versions are used
    // by executeTool which runs before the tracked versions are needed.

    // Tool confirmations (✅ created, 📋 listed) — short, go into sliding window
    const appendToolMessage = (content: string) => {
        if (!content.trim()) return;
        lastAssistantMsgRef.current = content;
        setMessages(prev => [...prev, { id: 'tool-' + Date.now(), role: 'assistant', content, timestamp: Date.now() }]);
    };

    // Final LLM reasoning response — goes into sliding window
    const appendFinalMessage = (content: string) => {
        if (!content.trim()) return;
        lastAssistantMsgRef.current = content;
        setMessages(prev => [...prev, { id: 'ast-' + Date.now(), role: 'assistant', content, timestamp: Date.now() }]);
    };

    // ─── Build reasoning context ──────────────────────────────────────────────
    // dataContext = fetched data to inject (task list, etc.) — ephemeral, never
    // stored in sliding window. Only the LLM's final response goes in the window.

    const buildReasoningContext = (userQuestion: string, dataContext?: string): Message[] => {
        const now = new Date();
        const system: Message = {
            role: 'system',
            content: [
                `You are TaskMate, a personal productivity AI assistant for ${currentUser?.username || 'the user'}.`,
                `Current date and time: ${now.toLocaleString(undefined, { hour12: true, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,

                `Your responsibilities:`,
                `- Help plan, schedule, and prioritize the user's tasks and subtasks`,
                `- Analyze free time slots and suggest when to fit in activities (reading, exercise, breaks, etc.)`,
                `- Give productivity advice, weekly/daily planning, time estimates`,
                `- Answer general questions related to the user's schedule and goals`,
                `- Be warm, encouraging, and concise (2-4 sentences unless detail is asked for)`,
                `You have the user's task list in context. Always use it to give specific, personalized advice.`,
            ].join('\n'),
        };
        const history = messages
            .slice(-(contextWindowSize || 10))
            .map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));

        // Inject fetched data into the question itself — not as a separate message
        const questionWithData = dataContext
            ? `${userQuestion}\n\n${dataContext}`
            : userQuestion;

        const full = [system, ...history, { role: 'user' as const, content: questionWithData }];

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`[REASONING-CTX] ${history.length} history msgs`);
        history.forEach((m, i) =>
            console.log(`  [${i}] ${m.role}: "${m.content.slice(0, 80)}${m.content.length > 80 ? '…' : ''}"`)
        );
        console.log(`[REASONING-CTX] QUESTION:\n${questionWithData.slice(0, 400)}${questionWithData.length > 400 ? '\n…(truncated)' : ''}`);
        console.log(`${'═'.repeat(60)}\n`);

        return full;
    };

    // ─── Route to reasoning backend ───────────────────────────────────────────

    const routeToReasoning = async (context: Message[]) => {
        const backend = resolveReasoningBackend();
        console.log(`[BACKEND] → ${backend}`);
        if (backend === 'api') await callGeminiAPI(context);
        else if (backend === 'local') { pendingReasoningRef.current = context; setPhase('switching'); }
        else { appendToolMessage('⚠️ No reasoning model selected. Pick one from the model selector.'); setAgentStatus('ready'); }
    };

    // ─── Gemini API ───────────────────────────────────────────────────────────

    const callGeminiAPI = async (context: Message[]) => {
        setPhase('api'); setAgentStatus('🌐 Gemini...');
        const msgId = 'ast-' + Date.now();
        setMessages(prev => [...prev, { id: msgId, role: 'assistant', content: '...', timestamp: Date.now() }]);
        try {
            const contents = context
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
            const res = await fetch(`${currentUser?.apiEndpoint}/gemini/reason`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ contents }),
            });
            if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
            const reader = res.body?.getReader();
            let text = '';
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    text += new TextDecoder().decode(value);
                    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: text } : m));
                }
            } else {
                text = await res.text();
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: text } : m));
            }
            setAgentStatus('ready'); setPhase('routing');
        } catch (e: any) {
            console.error('[GEMINI]', e);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: `⚠️ Gemini error: ${e.message}` } : m));
            setAgentStatus('error'); setPhase('routing');
        }
    };

    // ─── Tool executor ────────────────────────────────────────────────────────
    // Returns dataContext string when needs_llm=true, null otherwise.

    const executeTool = async (
        intent: KnownIntent,
        args: Record<string, any>,
        needsLLM: boolean,
    ): Promise<string | null> => {
        console.log(`[TOOL] ${intent}`, JSON.stringify(args));
        setAgentStatus(`⚙️ ${intent}...`);

        try {
            switch (intent) {

                case 'create_task': {
                    if (!args.title) { appendToolMessage('What should I name this task?'); return null; }
                    const res = await taskApi.create({
                        title: args.title, description: args.description,
                        dueDate: args.dueDate, subtasks: args.subtasks, recurrence: args.recurrence,
                    });
                    await dispatch(fetchTasks());
                    appendToolMessage(`✅ Task **"${res.data.title}"** created!${args.dueDate ? `\nDue: ${new Date(args.dueDate).toLocaleString()}` : ''}`);
                    return null;
                }

                case 'get_tasks': {
                    const params: any = {};
                    if (args.dueDate) params.created_at = args.dueDate;
                    await dispatch(fetchTasks(params));

                    // Re-read from store after dispatch
                    const pending = unifiedTasks.filter(t => !t.completed);
                    const filtered = args.dueDate
                        ? pending.filter(t => t.dueDate?.startsWith(args.dueDate.slice(0, 10)))
                        : pending;

                    if (filtered.length === 0) {
                        appendToolMessage("🎉 No pending tasks. You're all clear!");
                        return null;
                    }

                    // Format each task with its subtasks for rich LLM context
                    const formatTask = (t: any, idx: number, forLLM: boolean): string => {
                        // User sees short date only; LLM gets full ISO datetime for time-aware planning
                        const due = t.dueDate
                            ? forLLM
                                ? ` (due ${t.dueDate.replace('T', ' ').slice(0, 16)})`   // "2026-03-23 09:00"
                                : ` (due ${t.dueDate.slice(0, 10)})`                     // "2026-03-23"
                            : '';
                        const desc = t.description ? `\n   📝 ${t.description}` : '';
                        const subs: any[] = t.subtasks ?? [];
                        const subsFormatted = subs.length === 0 ? '' : forLLM
                            // LLM context: show full subtask detail (title + completion status)
                            ? '\n' + subs.map((s: any) =>
                                `   • [${s.completed ? '✓' : ' '}] ${s.title}`
                              ).join('\n')
                            // User display: compact inline done/total count
                            : ` [${subs.filter((s: any) => s.completed).length}/${subs.length} subtasks done]`;
                        return `${idx + 1}. **${t.title}**${due}${forLLM ? desc : ''}${subsFormatted}`;
                    };

                    if (!needsLLM) {
                        const taskList = filtered.slice(0, 15)
                            .map((t, i) => formatTask(t, i, false))
                            .join('\n');
                        appendToolMessage(`📋 **${filtered.length} task${filtered.length > 1 ? 's' : ''}**:\n${taskList}`);
                        return null;
                    }

                    // Return rich data context for LLM reasoning — includes subtasks + descriptions
                    const taskList = filtered.slice(0, 15)
                        .map((t, i) => formatTask(t, i, true))
                        .join('\n');
                    return `User's current pending tasks (${filtered.length} total):\n${taskList}`;
                }


                case 'create_idea': {
                    if (!args.title) { appendToolMessage('What should I name this idea?'); return null; }
                    const res = await ideaApi.create({ title: args.title, description: args.description });
                    dispatch(addIdea(res.data));
                    appendToolMessage(`💡 Idea **"${res.data.title}"** captured!`);
                    return null;
                }

                case 'get_ideas': {
                    await dispatch(fetchIdeas());
                    const count = ideas.length;
                    appendToolMessage(count === 0
                        ? 'No ideas yet.'
                        : `💡 **${count} idea${count > 1 ? 's' : ''}**:\n${ideas.slice(0, 10).map((i, idx) => `${idx + 1}. ${i.title}`).join('\n')}`
                    );
                    return null;
                }

                case 'get_specific_idea': {
                    const found = ideas.find(i => i.title.toLowerCase().includes((args.title ?? '').toLowerCase()));
                    if (!found) { appendToolMessage(`Couldn't find idea **"${args.title}"**. Try listing ideas.`); return null; }
                    const notes = (found.thread ?? []).map((n, i) => `  ${i + 1}. ${n.content}`).join('\n');
                    appendToolMessage(`💡 **${found.title}**\n${found.description ? `_${found.description}_\n` : ''}${notes ? `**Notes:**\n${notes}` : '_No notes yet._'}`);
                    return null;
                }

                case 'add_idea_note': {
                    const target = ideas.find(i => i.title.toLowerCase().includes((args.title ?? '').toLowerCase()));
                    if (!target) { appendToolMessage(`Couldn't find idea **"${args.title}"**.`); return null; }
                    const updated = await ideaApi.addThreadEntry(target._id, args.content);
                    dispatch(updateIdea(updated.data));
                    appendToolMessage(`📝 Note added to **"${target.title}"**.`);
                    return null;
                }

                case 'delete_idea_note': {
                    const target = ideas.find(i => i.title.toLowerCase().includes((args.title ?? '').toLowerCase()));
                    if (!target) { appendToolMessage(`Couldn't find idea **"${args.title}"**.`); return null; }
                    const noteToDelete = (target.thread ?? []).find(n =>
                        args.noteContent ? n.content.toLowerCase().includes(args.noteContent.toLowerCase()) : false
                    );
                    if (!noteToDelete) {
                        appendToolMessage(`Which note from **"${target.title}"** to delete?\n${(target.thread ?? []).map((n, i) => `${i + 1}. ${n.content}`).join('\n') || '_No notes._'}`);
                        return null;
                    }
                    const updated = await ideaApi.deleteThreadEntry(target._id, noteToDelete._id);
                    dispatch(updateIdea(updated.data));
                    appendToolMessage(`🗑️ Note deleted from **"${target.title}"**.`);
                    return null;
                }

                case 'create_group': {
                    if (!args.name) { appendToolMessage('What should I name this group?'); return null; }
                    if (!args.members?.length) { appendToolMessage(`What are the member IDs for **"${args.name}"**?`); return null; }
                    const res = await groupApi.create({ name: args.name, description: args.description ?? '', members: args.members });
                    dispatch(addGroup(res.data));
                    appendToolMessage(`👥 Group **"${res.data.name}"** created.`);
                    return null;
                }

                case 'get_groups': {
                    await dispatch(fetchGroups({ userId: currentUserId! }));
                    appendToolMessage(groups.length === 0
                        ? "Not in any groups yet."
                        : `👥 **${groups.length} group${groups.length > 1 ? 's' : ''}**:\n${groups.map((g, i) => `${i + 1}. **${g.name}** (${g.members?.length ?? 0} members)`).join('\n')}`
                    );
                    return null;
                }

                case 'get_specific_group': {
                    const found = groups.find(g => g.name.toLowerCase().includes((args.name ?? '').toLowerCase()));
                    if (!found) { appendToolMessage(`Couldn't find **"${args.name}"**. Try listing groups.`); return null; }
                    const memberList = (found.members ?? []).map((m: any, i: number) => `  ${i + 1}. ${m.username ?? m}`).join('\n');
                    appendToolMessage(`👥 **${found.name}**\n${found.description ? `_${found.description}_\n` : ''}**Members:**\n${memberList || '_None_'}\n**Tasks:** ${found.tasks?.length ?? 0}`);
                    return null;
                }

                case 'get_specific_group_tasks': {
                    const found = groups.find(g => g.name.toLowerCase().includes((args.name ?? '').toLowerCase()));
                    if (!found) { appendToolMessage(`Couldn't find **"${args.name}"**. Try listing groups.`); return null; }
                    const tl = found.tasks ?? [];
                    appendToolMessage(tl.length === 0
                        ? `No tasks in **${found.name}** yet.`
                        : `📋 **${found.name}**:\n${tl.map((t: any, i: number) => `${i + 1}. **${t.task}** — _${t.username}_ | ${t.duedate?.slice(0, 10) ?? 'no date'} | ${t.completed ? '✅' : '⏳'}`).join('\n')}`
                    );
                    return null;
                }

                case 'create_group_task': {
                    const missing = ['groupName', 'assigneeUsername', 'title'].filter(k => !args[k]);
                    if (missing.length) { appendToolMessage(`Please provide: **${missing.join(', ')}**.`); return null; }
                    const targetGroup = groups.find(g => g.name.toLowerCase().includes(args.groupName.toLowerCase()));
                    if (!targetGroup) { appendToolMessage(`Couldn't find group **"${args.groupName}"**.`); return null; }
                    let assigneeUserId = args.assigneeUserId;
                    if (!assigneeUserId) {
                        const member = (targetGroup.members ?? []).find((m: any) =>
                            (m.username ?? '').toLowerCase().includes(args.assigneeUsername.toLowerCase())
                        );
                        if (!member) {
                            appendToolMessage(`Couldn't find **"${args.assigneeUsername}"** in **${targetGroup.name}**.\nMembers: ${(targetGroup.members ?? []).map((m: any) => m.username ?? m).join(', ')}`);
                            return null;
                        }
                        assigneeUserId = member.userId ?? member._id ?? member;
                    }
                    await groupApi.assignTask(targetGroup._id, {
                        userId: assigneeUserId, username: args.assigneeUsername,
                        task: args.title, duedate: args.dueDate ?? new Date().toISOString(),
                        subtasks: args.subtasks, recurrence: args.recurrence,
                    });
                    await dispatch(fetchGroups({ userId: currentUserId! }));
                    appendToolMessage(`✅ **"${args.title}"** → **${args.assigneeUsername}** in **${targetGroup.name}**.`);
                    return null;
                }

                default:
                    return null;
            }
        } catch (e: any) {
            console.error(`[TOOL] ✗ ${intent}:`, e);
            appendToolMessage(`⚠️ Error: ${e.message}`);
            return null;
        }
    };

    // ─── Last assistant message ref ───────────────────────────────────────────
    // Injected into the triage router on every turn so it can resolve multi-turn
    // references ("Sure schedule it" → router sees what was proposed last turn).
    // Updated by both appendToolMessage and appendFinalMessage above.
    const lastAssistantMsgRef = useRef<string | null>(null);

    // ─── Main Send Handler ────────────────────────────────────────────────────

    const handleSend = useCallback(async () => {
        if (!input.trim() || !llm.isReady || phase !== 'routing') return;

        const userText = input.trim();
        const now = new Date();
        const todayISO = isoDate(now);
        const tomorrowISO = isoDate(tomorrowDate(now));

        // Capture last assistant message BEFORE adding user message to window
        const lastMsg = lastAssistantMsgRef.current;

        // User message → sliding window
        setMessages(prev => [...prev, {
            id: 'usr-' + Date.now(), role: 'user', content: userText, timestamp: Date.now(),
        }]);
        setInput('');

        console.log(`\n${'─'.repeat(60)}\n[USER] "${userText}"\n[CONTEXT] last_assistant:"${lastMsg?.slice(0, 80) ?? 'none'}"`);

        // ── Triage pipeline ───────────────────────────────────────────────────
        const { intent, args, needs_llm, smallModelReply } = await runSmolPipeline(
            userText, todayISO, tomorrowISO, lastMsg,
        );
        console.log(`\n[PIPELINE] complete → intent:${intent} needs_llm:${needs_llm} args:${JSON.stringify(args)}`);

        // ── chat / HANDOFF: small model decided big LLM is needed.
        // Always fetch tasks so the reasoning model has context — costs
        // nothing extra since we're already spinning up the big LLM.
        if (intent === 'chat') {
            setAgentStatus('⚙️ Preparing context...');
            await dispatch(fetchTasks());
            const pending = unifiedTasks.filter(tt => !tt.completed);
            const dataContext = pending.length === 0 ? undefined
                : `User's current pending tasks (${pending.length} total):
${  pending.slice(0, 15).map((tt, i) => {
                        const due = tt.dueDate
                            ? ` (due ${tt.dueDate.replace('T', ' ').slice(0, 16)})`
                            : '';
                        const desc = tt.description ? `\n   📝 ${tt.description}` : '';
                        const subs: any[] = (tt as any).subtasks ?? [];
                        const subsFormatted = subs.length === 0 ? ''
                            : '\n' + subs.map((s: any) => `   • [${s.completed ? '✓' : ' '}] ${s.title}`).join('\n');
                        return `${i + 1}. **${tt.title}**${due}${desc}${subsFormatted}`;
                    }).join('\n')
                }`;
            await routeToReasoning(buildReasoningContext(userText, dataContext));
            return;
        }



        // ── Execute tool ──────────────────────────────────────────────────────
        const dataContext = await executeTool(intent, args, needs_llm);

        // ── HANDOFF path: big LLM handles reasoning ───────────────────────────
        if (needs_llm) {
            await routeToReasoning(buildReasoningContext(userText, dataContext ?? undefined));
            return;
        }

        // ── DIRECT path: small model's reply is the final response ────────────
        // If the small model wrote a reply, use it. Otherwise fall back to the
        // tool's own confirmation message which was already appended.
        if (smallModelReply) {
            // Small model wrote a custom reply — append it as the final message
            appendFinalMessage(smallModelReply);
        }
        // (If smallModelReply is null, the tool's appendToolMessage already fired)

        setAgentStatus('ready');
        setPhase('routing');

    }, [input, llm, phase, activeModel, messages, currentUser, dispatch,
        capability, selectedModelId, contextWindowSize, unifiedTasks, groups, ideas,
        currentUserId, generateSafe]);

    // ─── Model Management ─────────────────────────────────────────────────────

    const handleSelectModel = (m: any) => {
        if (m.id === selectedModelId) return true;
        setSelectedModelId(m.id);
        const allModels = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        const fullMeta = allModels.find(model => model.id === m.id);
        const resolvedConfig = fullMeta?.config ?? m.config ?? null;
        console.log(`[MODEL-SELECT] "${m.id}" → ${resolvedConfig ? 'config found' : 'API model'}`);
        setActiveModel(resolvedConfig);
        return true;
    };

    const handleDeleteModel = async (m: any) => {
        if (!m.config) { Alert.alert('Info', 'This model cannot be deleted.'); return; }
        Alert.alert('Delete', `Delete ${m.name}?`, [
            { text: 'Cancel' },
            {
                text: 'Delete', onPress: async () => {
                    try {
                        const modelSource = m.config?.modelSource;
                        const isDownloaded = modelSource
                            ? downloadedModels.some(dm => dm.split('/').pop() === modelSource.split('/').pop())
                            : false;
                        if (isDownloaded) {
                            await ResourceFetcher.deleteResources(modelSource);
                            await updateDownloadedModels();
                            if (selectedModelId === m.id) {
                                // Reset back to SmolLM router
                                setActiveModel(null);
                                setModelConfig(SMOLLM2_1_360M_QUANTIZED);
                                // Force a reload by going through switching phase
                                pendingReasoningRef.current = null;
                                setPhase('switching');
                            }
                        } else {
                            Alert.alert('Info', 'Model not downloaded.');
                        }
                    } catch (e) {
                        console.error('[MODEL-DELETE]', e);
                        Alert.alert('Error', 'Failed to delete model.');
                    }
                }
            }
        ]);
    };

    const updateDownloadedModels = useCallback(async () => {
        try { setDownloadedModels(await ResourceFetcher.listDownloadedModels()); } catch { /* silent */ }
    }, []);

    useEffect(() => { updateDownloadedModels(); }, [updateDownloadedModels]);

    return {
        llm,
        routerReady: llm.isReady && phase === 'routing',
        mainLlmReady: (llm.isReady && phase === 'reasoning') || phase === 'api',
        isDownloading: !llm.isReady && llm.downloadProgress > 0 && llm.downloadProgress < 1,
        downloadProgress: llm.downloadProgress,
        phase, messages, input, setInput, handleSend, handleSelectModel, handleDeleteModel,
        downloadedModels, activeModel, agentStatus, capability,
    };
};