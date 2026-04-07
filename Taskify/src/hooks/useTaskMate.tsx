import { useState, useEffect, useRef } from 'react';
import { Message, useLLM } from 'react-native-executorch';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { taskApi } from '../api/tasks';
import { fetchTasks, selectUnifiedTasks } from '../store/slices/taskSlice';
import { useDeviceCapability } from '../utils/usedevicecapability';
import { MATE_MODELS } from '../constants/mateModels';
import { ChatMessage, AgentStatus } from './TaskMate/types';
import { MATE_TOOLS } from './TaskMate/mateTools';
import { buildStagePrompt, isoDate } from './TaskMate/matePrompts';
import { updateUserPreferences } from '../store/slices/authSlice';
import { HAMMER2_1_0_5B_QUANTIZED, QWEN3_0_6B_QUANTIZED } from 'react-native-executorch';

const ROUTER_MODEL = HAMMER2_1_0_5B_QUANTIZED;
const SUMMARY_MODEL = QWEN3_0_6B_QUANTIZED;

export const useTaskMate = (selectedModelId: string | null, setSelectedModelId: (id: string | null) => void) => {
    const dispatch = useDispatch<AppDispatch>();
    const capability = useDeviceCapability();
    const { dualModelEnabled } = useSelector((s: RootState) => s.mateConfig);
    const { currentUserId } = useSelector((s: RootState) => s.auth);
    const unifiedTasks = useSelector(selectUnifiedTasks);

    // --- Core State (Handles) ---
    const [activeRouterModel, setActiveRouterModel] = useState<any>(ROUTER_MODEL);
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('initializing');
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    const iterationCount = useRef(0);
    const lastUserText = useRef<string>("");
    const missionPlan = useRef<any[]>([]); 
    const missionEvidence = useRef<string>("");

    const routerLlm = useLLM({ model: activeRouterModel || ROUTER_MODEL, preventLoad: false });
    const reasonerLlm = useLLM({ model: SUMMARY_MODEL, preventLoad: !dualModelEnabled });
    const routerRef = useRef(routerLlm); useEffect(() => { routerRef.current = routerLlm; }, [routerLlm]);
    const reasonerRef = useRef(reasonerLlm); useEffect(() => { reasonerRef.current = reasonerLlm; }, [reasonerLlm]);

    // ─── Real-Time Status Engine ──────────────────────────────────────────
    useEffect(() => {
        const isRtrReady = routerLlm.isReady;
        const isReasReady = dualModelEnabled ? reasonerLlm.isReady : true;
        const rtrProgress = routerLlm.downloadProgress;
        const reasProgress = reasonerLlm.downloadProgress;

        if (routerLlm.isGenerating || reasonerLlm.isGenerating) {
            setAgentStatus('🤖 Thinking...');
        } else if (!isRtrReady && rtrProgress < 1) {
            setAgentStatus(`Downloading Scout... ${Math.round(rtrProgress * 100)}%`);
        } else if (!isRtrReady) {
            setAgentStatus('Initializing Scout...');
        } else if (dualModelEnabled && !isReasReady && reasProgress < 1) {
            setAgentStatus(`Downloading Turbo... ${Math.round(reasProgress * 100)}%`);
        } else if (dualModelEnabled && !isReasReady) {
            setAgentStatus('Waking up Turbo...');
        } else {
            setAgentStatus('ready');
        }
    }, [
        routerLlm.isReady, 
        reasonerLlm.isReady, 
        routerLlm.downloadProgress, 
        reasonerLlm.downloadProgress, 
        dualModelEnabled, 
        selectedModelId,
        routerLlm.isGenerating,
        reasonerLlm.isGenerating
    ]);

    // ─── Recursive Orchestrator ────────────────────────────────────────────────
    async function reconcile() {
        try {
            // 0. WARM-UP GUARD: Wait for native handle to stabilize
            if (!routerRef.current.isReady) {
                console.log("[KERNEL] Brain is cold. Waiting for warm-up...");
                setAgentStatus('Waking up...');
                let bootWait = 0;
                while (!routerRef.current.isReady && bootWait < 100) {
                    await new Promise(r => setTimeout(r, 100));
                    bootWait++;
                }
            }

            while (iterationCount.current < 12) {
                iterationCount.current += 1;

                // 1. GENERATE PLAN (Brain-Led)
                if (missionPlan.current.length === 0) {
                    console.log("[KERNEL] Planning Mission...");
                    const sys = buildStagePrompt('PLAN', isoDate(new Date()));
                    const chat = [{ role: 'system', content: sys }, { role: 'user', content: lastUserText.current }];
                    
                    let output = "";
                    if (dualModelEnabled) {
                        while (!reasonerRef.current.isReady) await new Promise(r => setTimeout(r, 100));
                        output = await (reasonerRef.current as any).generate(chat, []);
                    } else {
                        await safeChangeModel(SUMMARY_MODEL);
                        output = await (routerRef.current as any).generate(chat, []);
                    }
                    
                    try {
                        const json = output.replace(/```(?:json)?|```/g, '').trim();
                        missionPlan.current = JSON.parse(json);
                        console.log("[KERNEL] Mission Locked:", missionPlan.current);
                    } catch { missionPlan.current = [{"action": "final", "goal": "Error in planning"}]; }
                }

                // 2. EXECUTE NEXT STEP
                const step = missionPlan.current.shift();
                if (!step || step.action === 'final') break; 
                console.log("[KERNEL] Executing:", step.action);

                if (step.action === 'listTasks' || step.action === 'createTask') {
                    // Tool Use (Scout-Led)
                    const toolSys = buildStagePrompt('TOOL', isoDate(new Date()));
                    const toolChat = [{ role: 'system', content: toolSys }, { role: 'user', content: `Extract ${step.action} for: ${JSON.stringify(step.params)}` }];
                    
                    let toolJson = "";
                    if (dualModelEnabled) {
                        toolJson = await (routerRef.current as any).generate(toolChat, []);
                    } else {
                        await safeChangeModel(ROUTER_MODEL);
                        toolJson = await (routerRef.current as any).generate(toolChat, []);
                    }

                    const parsed = parseTools(toolJson);
                    if (parsed.length > 0) {
                        const result = await executeTool(parsed[0].name, parsed[0].arguments);
                        missionEvidence.current += `\n[ACTION:${step.action}] ${result}`;
                    }
                } 
                else if (step.action === 'evaluate') {
                    // Reasoning turn (Brain-Led)
                    const sys = buildStagePrompt('SOLVE', isoDate(new Date()), step.goal, missionEvidence.current);
                    const chat = [{ role: 'system', content: sys }, { role: 'user', content: lastUserText.current }];
                    
                    let resp = "";
                    if (dualModelEnabled) {
                        resp = await (reasonerRef.current as any).generate(chat, []);
                    } else {
                        await safeChangeModel(SUMMARY_MODEL);
                        resp = await (routerRef.current as any).generate(chat, []);
                    }
                    missionEvidence.current += `\n[REASON] Decision: ${resp}`;
                    
                    // Branching: If Conflict, stop and explain
                    if (resp.includes('CLARIFY') || resp.includes('CONFLICT')) break;
                }
            }

            // 3. FINAL SUMMARY
            console.log("[KERNEL] Finalizing Mission...");
            const finalSys = buildStagePrompt('SUM', isoDate(new Date()), "", missionEvidence.current);
            const finalChat = [{ role: 'system', content: finalSys }, { role: 'user', content: lastUserText.current }];
            
            let finalOutput = "";
            if (dualModelEnabled) finalOutput = await (reasonerRef.current as any).generate(finalChat, []);
            else {
                await safeChangeModel(SUMMARY_MODEL);
                finalOutput = await (routerRef.current as any).generate(finalChat, []);
            }
            
            setHistory(prev => [...prev, { role: 'assistant', content: finalOutput }]);

        } catch (e) {
            console.error("[KERNEL:FATAL]", e);
            setHistory(prev => [...prev, { role: 'assistant', content: "⚠️ Mission failed. Please try again." }]);
        } finally {
            iterationCount.current = 0; missionPlan.current = []; missionEvidence.current = ""; setAgentStatus('ready');
            if (!dualModelEnabled) setActiveRouterModel(ROUTER_MODEL); // Reset to Scout
        }
    }

    // ─── Swap & Core ───────────────────────────────────────────────────────────
    const safeChangeModel = async (config: any) => {
        if (dualModelEnabled || activeRouterModel === config) return;
        try {
            (routerRef.current as any).interrupt?.();
            setActiveRouterModel(null);
            await new Promise(r => setTimeout(r, 400));
            if (routerRef.current.isReady) await (routerRef.current as any).delete?.().catch(()=>{});
        } catch {}
        setActiveRouterModel(config);
        while (!routerRef.current.isReady) await new Promise(r => setTimeout(r, 100));
    };

    function parseTools(text: string) { try { const match = text.replace(/```(?:json)?|```/g, '').trim().match(/\[\s*{\s*"name"[\s\S]*?\}\s*\]/); return match ? JSON.parse(match[0]) : []; } catch { return []; } }
    async function executeTool(intent: string, args: Record<string, any>) {
        const date = args.date || args.dueDate || isoDate(new Date());
        try {
            if (intent === 'createTask') {
                const time = args.dueTime || "09:00";
                const d = new Date(`${date}T${time}:00`);
                await taskApi.create({ title: args.title, dueDate: d.toISOString(), recurrence: { frequency: 'none' } });
                await dispatch(fetchTasks());
                return `SUCCESS: Created ${args.title} for ${date}`;
            } else {
                await dispatch(fetchTasks({ created_at: date }));
                const tasks = unifiedTasks.filter(t => !t.completed && t.dueDate?.startsWith(date));
                if (tasks.length === 0) return `EMPTY: No tasks for ${date}`;
                return `LIST: ` + tasks.map(t => `${t.title} (${t.dueDate?.split('T')[1].substring(0,5)})`).join(', ');
            }
        } catch (e: any) { return `ERROR: ${e.message}`; }
    }

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        
        // Instant Feedback
        setInput('');
        setHistory(prev => [...prev, { role: 'user', content: text }]);
        lastUserText.current = text;
        setAgentStatus('thinking');
        
        await reconcile();
    };

    const handleSelectModel = async (id: string | null) => { if (id) { setSelectedModelId(id); if (currentUserId) dispatch(updateUserPreferences({ userId: currentUserId, preferences: { selectedModelId: id } })); return true; } return false; };
    const handleInterrupt = () => { (routerRef.current as any).interrupt?.(); (reasonerRef.current as any).interrupt?.(); setAgentStatus('ready'); };
    useEffect(() => { const uiMsgs = history.map((m, i) => ({ id: `msg-${i}`, role: m.role as 'user' | 'assistant', content: (m.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim(), timestamp: Date.now() })).filter(m => m.content); setMessages(uiMsgs); }, [history]);

    return { llm: routerLlm, messages, input, setInput, handleSend, handleSelectModel, handleInterrupt, agentStatus, capability };
};