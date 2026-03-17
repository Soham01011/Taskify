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
import { fetchTasks } from '../store/slices/taskSlice';
import { useDeviceCapability } from '../utils/usedevicecapability';
import { MATE_MODELS } from '../constants/mateModels';

export interface ChatMessage {
    id: string; 
    role: 'user' | 'assistant' | 'system'; 
    content: string; 
    timestamp: number;
}

export type AgentStatus = 'initializing' | 'ready' | 'analyzing' | 'executing' | 'fetching' | 'switching' | 'loading' | 'thinking' | 'api_calling' | 'error' | string;

type Intent = 'create_task' | 'create_group_task' | 'create_idea' | 'get_tasks' | 'get_groups' | 'get_ideas' | 'chat';

// ─── Extraction logic (Existing) ───────────────────────────────────────────
function parseDueDate(text: string): { iso?: string, dateStr?: string } {
    const now = new Date(); const t = text.toLowerCase();
    const timeMatch = t.match(/(?:at|for|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    let h = 9, min = 0, hasTime = false;
    if (timeMatch) {
        hasTime = true; h = parseInt(timeMatch[1], 10);
        min = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const mer = timeMatch[3]?.toLowerCase();
        if (mer === 'pm' && h < 12) h += 12; if (mer === 'am' && h === 12) h = 0;
    }
    if (t.includes('tomorrow')) {
        const d = new Date(now); d.setDate(d.getDate() + 1);
        return { iso: new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, min).toISOString(), dateStr: 'tomorrow' };
    }
    if (hasTime) return { iso: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min).toISOString(), dateStr: timeMatch![0] };
    return {};
}

function extractTitle(text: string, dateStr?: string): string {
    let t = text.trim();
    if (dateStr) t = t.replace(new RegExp(dateStr, 'i'), '');
    const prefixes = [/^create\s+(a\s+)?task\s*/i, /^add\s+(a\s+)?task\s*/i, /^remind\s+me\s+to\s*/i, /^new\s+task\s*/i, /^capture\s+an?\s+idea\s*/i];
    for (const re of prefixes) t = t.replace(re, '');
    t = t.replace(/\s*(?:for|on|at|by|tomorrow|today).+$/i, '').trim();
    return t.charAt(0).toUpperCase() + t.slice(1, 60) || 'New Task';
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export const useTaskMate = (selectedModelId: string, setSelectedModelId: (id: string) => void) => {
    const dispatch = useDispatch<AppDispatch>();
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('initializing');
    const [activeModel, setActiveModel] = useState<any>(null);
    const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    // Redux Config
    const { useApiForReasoning, contextWindowSize } = useSelector((s: RootState) => s.mateConfig);
    const { currentUserId, users } = useSelector((s: RootState) => s.auth);
    const currentUser = users.find(u => u.id === currentUserId);
    const token = currentUser?.accessToken;
    
    // Device Capability
    const capability = useDeviceCapability();

    // Phase: routing (Smol), switching (unload), loading (load new), reasoning (generate), api (Gemini)
    const [phase, setPhase] = useState<'routing' | 'switching' | 'loading' | 'reasoning' | 'api'>('routing');
    const [modelConfig, setModelConfig] = useState<any>(SMOLLM2_1_360M_QUANTIZED);
    const pendingHistoryRef = useRef<Message[] | null>(null);

    const llm = useLLM({
        model: modelConfig,
        preventLoad: phase === 'switching' || phase === 'api' // Forces unload for switching or API calls
    });

    // Strategy: Sliding Window Context
    const getSlidingWindowContext = (newInput: string): Message[] => {
        const systemPrompt = `You are TaskMate, an AI agent helping ${currentUser?.username || 'the user'} with task management. Current local time: ${new Date().toLocaleString()}. Be helpful and concise.`;
        const history = messages
            .slice(-(contextWindowSize || 10))
            .map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
        
        return [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: newInput }
        ];
    };

    // API Call: Gemini Fallback
    const callGeminiAPI = async (context: Message[]) => {
        setPhase('api');
        setAgentStatus('thinking (api)');
        
        // Add placeholder message for assistant
        const assistantMsgId = 'ai-' + Date.now();
        setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '...', timestamp: Date.now() }]);

        try {
            // Reformat messages to what the API expects (sender -> role, text -> part.text)
            // But the user's provided API code expects { role: 'user', parts: [{ text: "..." }] }
            const apiContents = context.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const baseURL = currentUser?.apiEndpoint || 'http://192.168.1.50:3000/api';
            const response = await fetch(`${baseURL}/gemini/reason`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ contents: apiContents })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API call failed');
            }

            // The provided API streams, but here for simplicity with current UI, we'll collect or stream if possible.
            // Since useLLM handles its own state, let's just update the message content.
            const reader = response.body?.getReader();
            let fullText = '';
            
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = new TextDecoder().decode(value);
                    fullText += chunk;
                    setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m));
                }
            } else {
                const text = await response.text();
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: text } : m));
            }

            setAgentStatus('ready');
            setPhase('routing');
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: `⚠️ Error: ${error.message}` } : m));
            setAgentStatus('error');
            setPhase('routing');
        }
    };

    // Handle unload/load sequence to prevent OOM (Local Reasoning)
    useEffect(() => {
        if (phase === 'switching' && !llm.isReady) {
            const next = pendingHistoryRef.current ? activeModel : SMOLLM2_1_360M_QUANTIZED;
            const timer = setTimeout(() => {
                setModelConfig(next);
                setPhase('loading');
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (phase === 'loading' && llm.isReady) {
            if (pendingHistoryRef.current) {
                setPhase('reasoning');
                setAgentStatus('thinking');
                llm.generate(pendingHistoryRef.current)
                    .catch(e => { console.error(e); setAgentStatus('error'); })
                    .finally(() => {
                        pendingHistoryRef.current = null;
                        setPhase('switching'); // Unload and back to routing
                    });
            } else {
                setPhase('routing'); setAgentStatus('ready');
            }
        }
    }, [phase, llm.isReady, activeModel]);

    // Status Sync
    useEffect(() => {
        if (phase === 'routing' && llm.isReady) setAgentStatus('ready');
        else if (llm.error) setAgentStatus('error');
        else if (phase === 'loading') setAgentStatus('loading model...');
        else if (phase === 'switching') setAgentStatus('swapping models...');
    }, [llm.isReady, phase, llm.error]);

    // Local Message Sync
    useEffect(() => {
        if (!llm.response || phase !== 'reasoning') return;
        const text = llm.response.trim();
        if (!text) return;
        setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.id.startsWith('ai-gen-')) {
                next[next.length - 1] = { ...last, content: text };
            } else {
                next.push({ id: 'ai-gen-' + Date.now(), role: 'assistant', content: text, timestamp: Date.now() });
            }
            return next;
        });
    }, [llm.response, phase]);

    const handleSelectModel = (m: any) => {
        if (m.id === selectedModelId) return true;
        setSelectedModelId(m.id);
        setActiveModel(m.config || null);
        return true;
    };

    const handleDeleteModel = async (m: any) => {
        if (!m.config) {
            Alert.alert('Info', 'This model cannot be deleted (managed by system or API).');
            return;
        }
        Alert.alert('Delete', `Delete ${m.name}?`, [
            { text: 'Cancel' }, 
            { text: 'Delete', onPress: async () => {
                try {
                    const modelSource = m.config?.modelSource;
                    const isDownloaded = modelSource 
                        ? downloadedModels.some(dm => {
                            const downloadedName = dm.split('/').pop();
                            const modelName = modelSource.split('/').pop();
                            return downloadedName === modelName;
                        })
                        : false;

                    if (isDownloaded) {
                        await ResourceFetcher.deleteResources(modelSource);
                        await updateDownloadedModels();
                        if (selectedModelId === m.id) {
                            setActiveModel(null);
                            setModelConfig(SMOLLM2_1_360M_QUANTIZED);
                        }
                    } else {
                        Alert.alert('Info', 'This model is not downloaded or cannot be deleted.');
                    }
                } catch(e) {
                    console.error('Error deleting model:', e);
                    Alert.alert('Error', 'Failed to delete model.');
                }
            }}
        ]);
    };


    const updateDownloadedModels = useCallback(async () => {
        try { setDownloadedModels(await ResourceFetcher.listDownloadedModels()); } catch(e) {}
    }, []);
    useEffect(() => { updateDownloadedModels(); }, [updateDownloadedModels]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || !llm.isReady || phase !== 'routing') return;
        
        const text = input.trim();
        setMessages(p => [...p, { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }]);
        setInput('');
        setAgentStatus('analyzing');

        const t = text.toLowerCase();
        let intent: Intent = 'chat';
        if (['task','add','remind'].some(k => t.includes(k))) intent = 'create_task';
        else if (['idea','note'].some(k => t.includes(k))) intent = 'create_idea';
        else if (['list','show','my tasks'].some(k => t.includes(k))) intent = 'get_tasks';

        // Local CRUD via SmolLM2 Agent logic
        if (intent === 'create_task' || intent === 'create_idea') {
            setAgentStatus('executing');
            try {
                const { iso, dateStr } = parseDueDate(text);
                const title = extractTitle(text, dateStr);
                if (intent === 'create_task') {
                    await taskApi.create({ title, description: '', dueDate: iso });
                    await dispatch(fetchTasks());
                    setMessages(p => [...p, { id: 'ai-'+Date.now(), role: 'assistant', timestamp: Date.now(), content: `✅ Task created: **${title}**${iso ? `\nDue: ${new Date(iso).toLocaleString()}` : ''}` }]);
                } else {
                    await ideaApi.create({ title, description: '' });
                    setMessages(p => [...p, { id: 'ai-'+Date.now(), role: 'assistant', timestamp: Date.now(), content: `💡 Idea saved: **${title}**` }]);
                }
            } catch (e: any) { setMessages(p => [...p, { id: 'ai-'+Date.now(), role: 'assistant', content: `⚠️ ${e.message}`, timestamp: Date.now() }]); }
            setAgentStatus('ready');
            return;
        }

        // Reasoning Logic (Hybrid)
        const context = getSlidingWindowContext(text);
        
        // Find model metadata to check if it's an API model
        const allModels = [...MATE_MODELS.REASONING, ...MATE_MODELS.VTT, ...MATE_MODELS.TTV, ...MATE_MODELS.OCR];
        const modelMetadata = allModels.find(m => m.id === selectedModelId);

        // Decide: Local or API?
        const isApiModel = selectedModelId === 'gemini_api' || modelMetadata?.isApi;

        const forceApi = useApiForReasoning || isApiModel;
        const hasLocalConfig = !!activeModel;

        if (forceApi || !hasLocalConfig) {
            // API Fallback
            await callGeminiAPI(context);
        } else {
            // Local Reasoning (Respect user choice even if RAM is low, but capability.reason already warns them)
            pendingHistoryRef.current = context;
            setPhase('switching'); 
        }

    }, [input, llm.isReady, phase, activeModel, messages, currentUser, dispatch, useApiForReasoning, capability, selectedModelId, contextWindowSize]);

    return {
        llm,
        routerReady: llm.isReady && phase === 'routing',
        mainLlmReady: (llm.isReady && phase === 'reasoning') || phase === 'api',
        isDownloading: !llm.isReady && llm.downloadProgress > 0 && llm.downloadProgress < 1,
        downloadProgress: llm.downloadProgress,
        phase, messages, input, setInput, handleSend, handleSelectModel, handleDeleteModel,
        downloadedModels, activeModel, agentStatus, capability
    };
};
