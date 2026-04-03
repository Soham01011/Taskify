import { useState, useEffect, useCallback, useRef } from 'react';
import { ResourceFetcher, Message, useLLM, DEFAULT_SYSTEM_PROMPT } from 'react-native-executorch';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { taskApi } from '../api/tasks';
import { groupApi } from '../api/groups';
import { fetchTasks, selectUnifiedTasks } from '../store/slices/taskSlice';
import { fetchGroups } from '../store/slices/groupSlice';
import { useDeviceCapability } from '../utils/usedevicecapability';
import { MATE_MODELS } from '../constants/mateModels';

// Modular TaskMate components
import { ChatMessage, AgentStatus } from './TaskMate/types';
import { MATE_TOOLS } from './TaskMate/mateTools';
import { buildStagePrompt, isoDate } from './TaskMate/matePrompts';
import { updateUserPreferences } from '../store/slices/authSlice';
import { HAMMER2_1_0_5B_QUANTIZED, QWEN3_0_6B_QUANTIZED } from 'react-native-executorch';

// Dual-Model Architecture:
// Hammer = Tool Router (JSON, fine-tuned for function-calling)
// Qwen 3 0.6B = Text Summarizer (natural language, not biased toward tool calls)
const ROUTER_MODEL = HAMMER2_1_0_5B_QUANTIZED;
const SUMMARY_MODEL = QWEN3_0_6B_QUANTIZED;

export type { ChatMessage, AgentStatus };

const rawLogChat = (chat: Message[]) => {
    chat.forEach((m, i) => {
        console.log(`[CHAT-${i}] ${m.role}: ${m.content}`);
    });
};

/**
 * useTaskMate Hook
 * Optimized Unified AI lifecycle using react-native-executorch Managed Mode.
 * Simplified "Flat" architecture avoiding component nesting logic.
 */
export const useTaskMate = (selectedModelId: string | null, setSelectedModelId: (id: string | null) => void) => {
    const dispatch = useDispatch<AppDispatch>();

    // ─── Local State ──────────────────────────────────────────────────────────
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('initializing');
    // Helper to find model meta from any section
    const findModelMeta = (id: string | null) => {
        if (!id) return null;
        const all = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        return all.find(m => m.id === id);
    };

    // ─── Local State ──────────────────────────────────────────────────────────
    const [activeModel, setActiveModel] = useState<any>(() => findModelMeta(selectedModelId)?.config || null);
    const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [history, setHistory] = useState<Message[]>([]);
    const iterationCount = useRef(0);
    const wasInterrupted = useRef(false);
    const lastToolCallFull = useRef<string>("");
    const lastUserText = useRef<string>("");
    const inSummaryTurn = useRef(false);
    // Pending summary context for dual-model handoff
    const pendingSummary = useRef<{ chat: Message[], originalModel: any } | null>(null);

    // Intent-Gated Tool Router: JavaScript classifies intent — no LLM needed
    const getToolsForIntent = (text: string) => {
        const lower = text.toLowerCase();
        const fetchKeywords = /\b(fetch|get|check|see|list|show|what|find|view|tell me|look up|which|when|free|schedule|available|busy)\b/;
        const createKeywords = /\b(add|create|make|new|set|schedule|remind|book|plan a|reserve)\b/;
        const fetchMatch = fetchKeywords.test(lower);
        const createMatch = createKeywords.test(lower);

        const fetchTool = MATE_TOOLS.find((t: any) => t.name === 'fetchTasks')!;
        const createTool = MATE_TOOLS.find((t: any) => t.name === 'createTask')!;
        const summaryTool = MATE_TOOLS.find((t: any) => t.name === 'provideSummary')!;

        // For create-only (no check needed), go straight to createTask
        if (createMatch && !fetchMatch) {
            console.log("[INTENT] Create-only intent. Restricting to [createTask, provideSummary].");
            return [createTool, summaryTool];
        }
        // All other cases (fetch-only, multi-step, or ambiguous) → ALWAYS fetch first.
        // Multi-step logic (e.g. 'check if free, then create') needs the data before deciding.
        // Qwen will handle the conditional reasoning in the summary turn.
        console.log("[INTENT] Fetch-first strategy. Restricting to [fetchTasks, provideSummary].");
        return [fetchTool, summaryTool];
    };

    // ─── Context & Redux ──────────────────────────────────────────────────────
    const { currentUserId, users } = useSelector((s: RootState) => s.auth);
    const currentUser = users.find(u => u.id === currentUserId);
    const token = currentUser?.accessToken;

    const { groups } = useSelector((s: RootState) => s.groups);
    const unifiedTasks = useSelector(selectUnifiedTasks);
    const capability = useDeviceCapability();

    // ─── LLM Hook Setup ───────────────────────────────────────────────────────

    // Config re-calculation
    useEffect(() => {
        if (!selectedModelId) {
            setActiveModel(null);
            return;
        }
        const allModels = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        const meta = allModels.find(m => m.id === selectedModelId);
        if (meta && JSON.stringify(activeModel) !== JSON.stringify(meta.config)) {
            setActiveModel(meta.config);
        }
    }, [selectedModelId]);

    // useLLM directly flattened into the hook
    // We provide a tiny fallback config (Hammer 0.5B) ONLY to satisfy the hook's 
    // initialization requirements before a user selects their preferred model.
    // preventLoad: true ensures that this fallback is NEVER actually loaded or downloaded.
    const llm = useLLM({
        model: activeModel || HAMMER2_1_0_5B_QUANTIZED,
        preventLoad: !selectedModelId
    });

    // ─── Managed Mode Configuration ───────────────────────────────────────────

    // Note: We've switched to Manual Generation mode to overcome native regex limitations
    // seen in Managed Mode with very small models.
    useEffect(() => {
        if (llm.isReady && activeModel) {
            // ManagedMode and .configure are avoided here in favor of manual generation logic.
        }
    }, [llm.isReady, activeModel]);

    // ─── Agent Status Bridge ──────────────────────────────────────────────────

    useEffect(() => {
        if (!selectedModelId) {
            setAgentStatus('initializing');
            return;
        }

        if (llm.isGenerating) {
            // Check message history for latest status if available
            setAgentStatus('🤖 Thinking...');
        } else if (!llm.isReady && llm.downloadProgress < 1) {
            setAgentStatus(`Downloading ${Math.round(llm.downloadProgress * 100)}%...`);
        } else if (!llm.isReady && llm.downloadProgress === 1) {
            setAgentStatus('Loading model...');
        } else if (llm.isReady) {
            setAgentStatus('ready');
        }
    }, [llm.isReady, llm.downloadProgress, llm.isGenerating, selectedModelId]);

    // ─── Message History Synchronization ─────────────────────────────────────

    // ─── Manual Generation Handler ──────────────────────────────────────────

    useEffect(() => {
        // When generation finishes, check the final response for tool calls
        if (!llm.isGenerating && llm.response && llm.isReady) {
            if (wasInterrupted.current) {
                wasInterrupted.current = false;
                return;
            }
            handleFinalResponse(llm.response, history);
        }
    }, [llm.isGenerating, llm.isReady]);

    // ─── Dual-Model: Qwen Ready Trigger ───────────────────────────────────────
    // When we swap to Qwen and it becomes ready, this fires the summary generation.
    // After Qwen finishes, we swap back to the original model (Hammer).
    useEffect(() => {
        if (!llm.isReady || !pendingSummary.current) return;

        const { chat, originalModel } = pendingSummary.current;
        console.log("[MATE] Qwen ready. Generating text summary (no tools)...");

        const run = async () => {
            await (llm as any).generate(chat, []); // Qwen gets zero tools
        };
        run();
    }, [llm.isReady]);

    useEffect(() => {
        // When Qwen finishes generating, capture the response, reset, and swap back.
        if (!inSummaryTurn.current || llm.isGenerating || !pendingSummary.current) return;
        if (!llm.response || llm.response.trim().length === 0) return;

        console.log("[MATE] Qwen summary done. Swapping back to Hammer...");
        // Strip <think>...</think> chain-of-thought blocks Qwen 3 emits
        const cleanedResponse = llm.response
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .trim();

        if (cleanedResponse.length > 0) {
            const finalMsg: Message = { role: 'assistant', content: cleanedResponse };
            setHistory(prev => [...prev, finalMsg]);
        }

        const restoreModel = pendingSummary.current.originalModel;
        pendingSummary.current = null;
        inSummaryTurn.current = false;
        iterationCount.current = 0;
        setAgentStatus('ready');
        setActiveModel(restoreModel); // Back to Hammer
    }, [llm.isGenerating, llm.response]);

    // Client-side date resolution - do NOT trust the small model to map 'tomorrow' → ISO date
    const resolveDateArgs = (toolName: string, args: Record<string, any>, userText: string) => {
        if (toolName !== 'fetchTasks' && toolName !== 'createTask') return args;
        
        // If model already provided a sane date, keep it
        const existingDate = args.filterDate || args.dueDate;
        if (existingDate && /^\d{4}-\d{2}-\d{2}/.test(existingDate)) return args;

        // Parse temporal keywords from the user's original text
        const lower = userText.toLowerCase();
        const now = new Date();
        let resolvedDate: string | null = null;

        if (/\btomorrow\b/.test(lower)) {
            const d = new Date(now); d.setDate(d.getDate() + 1);
            resolvedDate = isoDate(d);
        } else if (/\btoday\b|\bnow\b/.test(lower)) {
            resolvedDate = isoDate(now);
        } else if (/\byesterday\b/.test(lower)) {
            const d = new Date(now); d.setDate(d.getDate() - 1);
            resolvedDate = isoDate(d);
        } else if (/\bnext week\b/.test(lower)) {
            const d = new Date(now); d.setDate(d.getDate() + 7);
            resolvedDate = isoDate(d);
        }

        if (resolvedDate) {
            const field = toolName === 'fetchTasks' ? 'filterDate' : 'dueDate';
            console.log(`[DATE-RESOLVE] Injecting ${field}=${resolvedDate} from user text`);
            return { ...args, [field]: resolvedDate };
        }
        return args;
    };

    const getCurrentContext = () => {
        const today = isoDate(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomStr = isoDate(tomorrow);

        const tasksForContext = unifiedTasks
            .filter(t => !t.completed && (t.dueDate?.startsWith(today) || t.dueDate?.startsWith(tomStr) || !t.dueDate))
            .slice(0, 15);

        if (tasksForContext.length === 0) return "No pending tasks for today or tomorrow.";
        return tasksForContext.map(t => {
            const datePrefix = t.dueDate?.startsWith(tomStr) ? "[Tomorrow]" : "[Today]";
            return `- ${datePrefix} ⭕ ${t.title}${t.dueDate ? ` (due ${new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}`;
        }).join('\n');
    };

    const handleInterrupt = () => {
        wasInterrupted.current = true;
        setAgentStatus('ready');
        (llm as any).interrupt?.();
    };

    const handleFinalResponse = async (responseText: string, currentHistory: Message[]) => {
        const fullContent = responseText.trim();

        // Very robust parser: handles <tool_call>, markdown ``` blocks, and raw JSON
        let toolCalls: any[] = [];
        try {
            // Support both <tool_call> and raw JSON/Markdown blocks
            const tagMatch = fullContent.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
            let cleanedContent = tagMatch ? tagMatch[1] : fullContent;

            // Aggressively strip markdown backticks and common JSON formatting noise
            cleanedContent = cleanedContent.replace(/```(?:json)?|```/g, '').trim();

            if (tagMatch || (cleanedContent.startsWith('[') && (cleanedContent.endsWith(']') || cleanedContent.includes('}')))) {
                // Try to find the exact JSON array if it's buried in text
                const jsonMatch = cleanedContent.match(/\[\s*{\s*"name"[\s\S]*?\}\s*\]/);
                if (jsonMatch) {
                    toolCalls = JSON.parse(jsonMatch[0]);
                } else if (cleanedContent.startsWith('[') && cleanedContent.endsWith(']')) {
                    toolCalls = JSON.parse(cleanedContent);
                }
            }
        } catch (e: any) {
            console.log("[MATE-PARSE] No valid tools found or parsing failed.");
            console.log("[MATE-PARSE] Raw Model Response:", fullContent);
            console.log("[MATE-PARSE] Error details:", e.message);
        }

        if (toolCalls.length > 0 && iterationCount.current < 5) {
            iterationCount.current += 1;
            // We append the assistant's tool-call response to history first
            const assistantMsg: Message = { role: 'assistant', content: fullContent };
            const historyWithAssistant = [...currentHistory, assistantMsg];

            // Execute ONLY one tool to prevent recursion/looping
            const call = toolCalls[0];
            const cleanName = (call.name || '').replace(/\s+/g, '');

            // HARD STOP: If in summary turn and model STILL calls a tool, it's looping.
            if (inSummaryTurn.current) {
                console.log("[MATE] Summary-turn tool detected. Hard stopping loop.");
                inSummaryTurn.current = false;
                iterationCount.current = 0;
                setAgentStatus('ready');
                return;
            }

            const callStr = `${cleanName}:${JSON.stringify(call.arguments || {})}`;

            // Circuit Breaker: Stop redundant loops
            if (callStr === lastToolCallFull.current) {
                console.log("[MATE] Loop detected: Repeating same tool call. Stopping.");
                setAgentStatus('ready');
                return;
            }
            inSummaryTurn.current = false;
            lastToolCallFull.current = callStr;

            // Client-side Date Resolution: don't trust 500M model to resolve 'tomorrow' -> ISO date
            const resolvedArgs = resolveDateArgs(cleanName, call.arguments || {}, lastUserText.current);
            const result = await executeTool(cleanName, resolvedArgs);

            // SPECIAL CASE: provideSummary is a terminal state!
            if (cleanName === 'provideSummary') {
                iterationCount.current = 0;
                setAgentStatus('ready');
                const finalMsg: Message = { role: 'assistant', content: call.arguments?.text || result };
                setHistory([...currentHistory, finalMsg]);
                return;
            }

            const toolResultMsg: Message = {
                role: 'user',
                content: `[TOOL_RESULT]: ${result}\n\n(IMPORTANT: If this provides all the information requested, call "provideSummary" now.)`
            };
            setHistory([...historyWithAssistant, toolResultMsg]);

            // ────────────────────────────────────────────────────────────────────
            // DUAL-MODEL SWAP: Hammer → Qwen for summarization
            // Hammer loops when asked to summarize; Qwen speaks naturally.
            // ────────────────────────────────────────────────────────────────────
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const evidence = `You called [${cleanName}]. Result: ${result}`;
            const systemPrompt = buildStagePrompt('SUM', isoDate(new Date()), isoDate(tomorrow), getCurrentContext(), evidence);
            
            const summaryChat: Message[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `User asked: "${lastUserText.current}"\n\nSchedule data retrieved:\n${result}\n\nAnswer the user's question based on this data.` }
            ];
            console.log("[MATE] Swapping to Qwen for text summarization...");
            pendingSummary.current = { chat: summaryChat, originalModel: activeModel };
            inSummaryTurn.current = true;
            // Switch to Qwen — useLLM re-inits and the useEffect below will trigger
            setActiveModel(SUMMARY_MODEL);
        } else {
            iterationCount.current = 0;
            // Normal response, add to history - BUT avoid saving garbage/hallucinations
            const isGarbage = (fullContent.includes('[') || fullContent.includes('{') || fullContent.includes('<')) && toolCalls.length === 0;
            if (isGarbage || fullContent.length < 2) {
                console.log("[MATE] Filtered garbage/empty response:", fullContent);
                return;
            }
            const assistantMsg: Message = { role: 'assistant', content: fullContent };
            setHistory(prev => [...prev, assistantMsg]);
        }
    };

    useEffect(() => {
        // Sync our manual Message[] state to the UI ChatMessage[] state
        const sync = () => {
            const uiMsgs: ChatMessage[] = history
                .filter(m => {
                    if (m.role === 'system') return false;
                    // Hide messages that are ONLY tool calls (JSON/XML) from the UI
                    const content = m.content?.trim() || '';
                    if (m.role === 'assistant' && (content.includes('<tool_call>') || (content.startsWith('[') && content.endsWith(']')))) {
                        return false;
                    }
                    // Hide tool results (which we inject as 'user' role with prefix internally)
                    if (m.role === 'user' && (content.startsWith('[TOOL_RESULT]') || content.startsWith('📋') || content.startsWith('✅') || content.startsWith('⚠️'))) {
                        return false;
                    }
                    return true;
                })
                .map((m, i) => ({
                    id: `msg-${i}-${Date.now()}`,
                    role: m.role as 'user' | 'assistant',
                    content: (m.content || '').replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim(),
                    timestamp: Date.now()
                }))
                .filter(m => m.content.length > 0);
            setMessages(uiMsgs);
        };
        sync();
    }, [history]);

    const syncHistoryToUI = (history: Message[]) => {
        const displayHistory: ChatMessage[] = history
            .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
            .map((m, i) => {
                const rawContent = m.content || '';
                const cleanContent = rawContent.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();
                return {
                    id: `msg-${i}-${Date.now()}`,
                    role: m.role as 'user' | 'assistant',
                    content: cleanContent || (m.role === 'assistant' ? '...' : ''), // Fallback if entire message was think tags
                    timestamp: Date.now()
                };
            })
            .filter(m => m.content.length > 0);
        setMessages(displayHistory);
    };

    // ─── Tool Execution Logic ─────────────────────────────────────────────────

    const executeTool = async (intent: string, args: Record<string, any>) => {
        console.log(`[MANAGED] Call: ${intent}, Args: ${JSON.stringify(args)}`);
        setAgentStatus(`⚙️ executing tool: ${intent}...`);
        try {
            switch (intent) {
                case 'createTask': {
                    if (!args.title) return 'Error: Task title is required.';
                    try {
                        const res = await taskApi.create({
                            title: args.title, description: args.description,
                            dueDate: args.dueDate, subtasks: (args.subtasks || []).map((s: string) => ({ title: s })),
                            recurrence: args.recurrence
                        });
                        await dispatch(fetchTasks());
                        return `✅ Task "${res.data.title}" created.`;
                    } catch (e: any) {
                        return `⚠️ Creation failed: ${e.message}`;
                    }
                }
                case 'provideSummary': {
                    return args.text || "Message provided.";
                }
                case 'fetchTasks': {
                    const params: any = {};
                    if (args.filterDate) params.created_at = args.filterDate;
                    await dispatch(fetchTasks(params));
                    const pending = unifiedTasks.filter(t => !t.completed);
                    const filtered = args.filterDate ? pending.filter(t => t.dueDate?.startsWith(args.filterDate)) : pending;

                    if (filtered.length === 0) {
                        return args.filterDate ? `No tasks found for ${args.filterDate}.` : "No pending tasks found.";
                    }
                    const taskList = filtered.map((t, i) => {
                        const localTime = t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                        const timeStr = localTime ? ` (due ${localTime})` : '';
                        const taskStatus = t.completed ? 'completed' : 'pending';
                        let subInfo = '';
                        if (t.subtasks && t.subtasks.length > 0) {
                            subInfo = t.subtasks.map((s: any) => `\n   - ${s.completed ? '✅' : 'pending'} ${s.title}`).join('');
                        }
                        return `${i + 1}. ${taskStatus} **${t.title}**${timeStr}${subInfo}`;
                    }).join('\n');
                    return `📋 Found tasks:\n${taskList}`;
                }
                default: return `Unknown tool: ${intent}`;
            }
        } catch (e: any) {
            return `⚠️ Tool error: ${e.message}`;
        }
    };

    // ─── Public Interaction Handlers ──────────────────────────────────────────

    const handleSend = useCallback(async () => {
        if (!input.trim() || llm.isGenerating) return;

        const userText = input.trim();
        console.log(`[USER] ${userText}`);
        setInput('');

        if (!selectedModelId) {
            setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'assistant', content: "⚠️ Please select a model to start chat.", timestamp: Date.now() }]);
            return;
        }

        const meta = MATE_MODELS.REASONING.find(m => m.id === selectedModelId);
        const isApi = selectedModelId === 'gemini_api' || meta?.isApi;

        if (isApi) {
            setAgentStatus('🌐 Gemini...');
            // Immediate optimistic user message
            setMessages(prev => [...prev, { id: 'usr-' + Date.now(), role: 'user', content: userText, timestamp: Date.now() }]);
            try {
                const pending = unifiedTasks.filter(t => !t.completed);
                const dataContext = { tasks: pending.slice(0, 20), groups: groups.map(g => ({ name: g.name, id: g._id })) };
                const res = await fetch(`${currentUser?.apiEndpoint}/gemini/reason`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `Context: ${JSON.stringify(dataContext)}\n\nQuestion: ${userText}` }] }] }),
                });
                const text = await res.text();
                setMessages(prev => [...prev, { id: 'gem-' + Date.now(), role: 'assistant', content: text, timestamp: Date.now() }]);
            } catch (e) {
                setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: '⚠️ Gemini connection failed.', timestamp: Date.now() }]);
            } finally {
                setAgentStatus('ready');
            }
        } else {
            if (!llm.isReady) return;
            try {
                const userMsg: Message = { role: 'user', content: userText };
                // Clear planning state
                lastToolCallFull.current = "";
                lastUserText.current = userText;

                const updatedHistory = [...history, userMsg];

                // INITIAL PLANNING STAGE
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const systemPrompt = buildStagePrompt('PLAN', isoDate(new Date()), isoDate(tomorrow), getCurrentContext());

                const chat: Message[] = [
                    { role: 'system', content: systemPrompt },
                    ...updatedHistory.slice(-4) // Keep context small
                ];

                console.log("[MATE] Generation beginning with history length:", updatedHistory.length);
                rawLogChat(chat);
                // Intent-Gated Tool Routing: only give the model tools matching user's intent
                const allowedTools = getToolsForIntent(userText);
                inSummaryTurn.current = false;
                await (llm as any).generate(chat, allowedTools);
            } catch (e) {
                setAgentStatus('error');
            }
        }
    }, [input, llm, messages, currentUser, dispatch, unifiedTasks, groups, selectedModelId, token]);

    const handleSelectModel = async (id: string | null) => {
        // Force cleanup of old model before loading new one to save RAM
        try {
            if (llmRef.current?.isReady) {
                console.log("[MATE] Deleting old model from RAM for clean swap...");
                await (llmRef.current as any).delete?.();
            }
        } catch (e) {
            console.log("[MATE] Non-critical cleanup error:", e);
        }

        setHistory([]); // Clear chat history for the new model session

        if (!id) {
            setSelectedModelId(null);
            setActiveModel(null);
            if (currentUserId) {
                dispatch(updateUserPreferences({ userId: currentUserId, preferences: { selectedModelId: null } }));
            }
            return true;
        }
        const all = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        const meta = all.find(m => m.id === id);
        if (meta) {
            setSelectedModelId(id);
            setActiveModel(meta.config);
            if (currentUserId) {
                dispatch(updateUserPreferences({ userId: currentUserId, preferences: { selectedModelId: id } }));
            }
            return true;
        }
        return false;
    };

    const handleDeleteModel = async (id: string) => {
        const all = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        const meta = all.find(m => m.id === id);
        if (meta?.config?.modelSource) {
            await ResourceFetcher.deleteResources(meta.config.modelSource);
            setDownloadedModels(prev => prev.filter(mid => mid !== id));
        }
    };

    // Initial check for downloaded models
    useEffect(() => {
        const check = async () => {
            try {
                const downloadedUris = await ResourceFetcher.listDownloadedModels();
                const all = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
                const downloaded: string[] = [];
                for (const m of all) {
                    if (m.config?.modelSource) {
                        const isFound = downloadedUris.some((uri: string) => uri.includes(m.config.modelSource.split('/').pop() || '!!!'));
                        if (isFound) downloaded.push(m.id);
                    }
                }
                setDownloadedModels(downloaded);
            } catch (e) { }
        };
        check();
    }, []);

    // ─── Native Memory Disposal ──────────────────────────────────────────────
    // Unload the model from native memory when the component utilizing this hook 
    // is unmounted, ensuring no phantom RAM usage.
    const llmRef = useRef(llm);
    useEffect(() => { llmRef.current = llm; }, [llm]);

    useEffect(() => {
        return () => {
            if (llmRef.current.isReady) {
                console.log("[MATE] Unloading model from native RAM...");
                (llmRef.current as any).delete?.().catch(() => { });
            }
        };
    }, []); // Run ONLY once on unmount

    const displayMessages = [...messages];
    if (llm.isGenerating && llm.response) {
        // We strip any <think> tags from the streaming response for a cleaner UI
        const cleanedResponse = llm.response.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();
        if (cleanedResponse) {
            displayMessages.push({
                id: 'streaming-' + Date.now(),
                role: 'assistant',
                content: cleanedResponse,
                timestamp: Date.now()
            });
        }
    }

    return {
        llm,
        isReady: llm.isReady,
        isDownloading: !llm.isReady && llm.downloadProgress < 1 && !!selectedModelId,
        downloadProgress: llm.downloadProgress,
        messages: displayMessages,
        input,
        setInput,
        handleSend,
        handleSelectModel,
        handleDeleteModel,
        handleInterrupt,
        downloadedModels,
        activeModel,
        agentStatus,
        capability
    };
};