import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, useLLM, ToolCall } from 'react-native-executorch';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTasks, selectUnifiedTasks } from '../store/slices/taskSlice';
import { fetchIdeas } from '../store/slices/ideaSlice';
import { useDeviceCapability } from '../utils/usedevicecapability';
import { ChatMessage, AgentStatus } from './TaskMate/types';
import { buildSystemPrompt, isoDate } from './TaskMate/matePrompts';
import { MATE_MODELS } from '../constants/mateModels';
import { MATE_TOOLS } from './TaskMate/mateTools';
import { taskApi } from '../api/tasks';
import { ideaApi } from '../api/ideas';
import { mateApi } from '../api/mate';

export const useTaskMate = () => {
    const dispatch = useDispatch<AppDispatch>();
    const capability = useDeviceCapability();
    const { currentUserId } = useSelector((s: RootState) => s.auth);
    const unifiedTasks = useSelector(selectUnifiedTasks);

    // --- Core State ---
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('initializing');
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const currentPromptRef = useRef('');

    const llm = useLLM({
        model: MATE_MODELS.ACTIVE.config,
        preventLoad: false
    });

    // ─── Tool Execution Logic ──────────────────────────────────────────────
    const executeTool = useCallback(async (call: ToolCall): Promise<string | null> => {
        console.log(`[MATE:TOOL] ${call.toolName}`, call.arguments);

        try {
            switch (call.toolName) {
                case 'createTask': {
                    const args = call.arguments as any;
                    const fullDueDate = args.dueTime ? `${args.dueDate}T${args.dueTime}` : args.dueDate;
                    const dateObj = new Date(fullDueDate);
                    const utcDueDate = isNaN(dateObj.getTime()) ? fullDueDate : dateObj.toISOString();
                    
                    const response = await taskApi.create({
                        title: args.title,
                        description: args.description,
                        dueDate: utcDueDate,
                        alarm_type: 'push', // Default to push notification
                        alarm_reminder_time: utcDueDate, // Default reminder at due time
                        recurrence: {
                            frequency: 'none'
                        }
                    });
                    dispatch(fetchTasks());
                    const successMsg = `✅ Task created: ${args.title}`;
                    const toolResult = `SUCCESS: ${successMsg}`;
                    console.log("[MATE:TOOL_RESULT] createTask:", toolResult);
                    // Add to UI history immediately
                    setMessages(prev => [...prev, {
                        id: 'tool-' + Date.now(),
                        role: 'assistant',
                        content: successMsg,
                        timestamp: Date.now()
                    }]);
                    return `SUCCESS: ${successMsg}`;
                }

                case 'listTasks': {
                    console.log("[MATE:LIST] Fetching...");
                    const result = await dispatch(fetchTasks()).unwrap();
                    console.log("[MATE:LIST] Result payload keys:", Object.keys(result));

                    const data = result.data;
                    const tasks = (Array.isArray(data) ? data : (data as any)?.tasks) || [];
                    console.log("[MATE:LIST] Tasks found:", tasks.length);

                    const pending = tasks.filter((t: any) => !t.completed);
                    console.log("[MATE:LIST] Pending found:", pending.length);

                    if (pending.length === 0) {
                        return "NO PENDING TASKS FOUND.";
                    }

                    const listStr = pending.map((t: any) => `- ${t.title} (Due: ${new Date(t.dueDate).toLocaleTimeString()})`).join('\n');
                    const displayMsg = `📋 Pending Tasks:\n${listStr}`;

                    setMessages(prev => [...prev, {
                        id: 'tool-list-' + Date.now(),
                        role: 'assistant',
                        content: displayMsg,
                        timestamp: Date.now()
                    }]);

                    const resultStr = `SUCCEEDED: User can now see a list of ${pending.length} pending tasks.`;
                    console.log("[MATE:TOOL_RESULT] listTasks:", resultStr);
                    return resultStr;
                }

                case 'listIdeas': {
                    console.log("[MATE:LIST] Fetching ideas...")
                    const result = await dispatch(fetchIdeas()).unwrap();
                    const data = result.data;
                    const ideas = (Array.isArray(data) ? data : (data as any)?.ideas) || [];
                    
                    if (ideas.length === 0) {
                        return "NO IDEAS FOUND.";
                    }

                    const listStr = ideas.map((i: any) => `- ${i.title}`).join('\n');
                    const displayMsg = `💡 Your Ideas:\n${listStr}`;

                    setMessages(prev => [...prev, {
                        id: 'tool-list-ideas-' + Date.now(),
                        role: 'assistant',
                        content: displayMsg,
                        timestamp: Date.now()
                    }]);

                    return `SUCCEEDED: Listed ${ideas.length} ideas.`;
                }

                case 'createIdea': {
                    const args = call.arguments as any;
                    await ideaApi.create({
                        title: args.title,
                        description: args.description,
                    });
                    dispatch(fetchIdeas());
                    const successMsg = `💡 Idea saved: ${args.title}`;
                    
                    setMessages(prev => [...prev, {
                        id: 'tool-idea-' + Date.now(),
                        role: 'assistant',
                        content: successMsg,
                        timestamp: Date.now()
                    }]);
                    return `SUCCESS: ${successMsg}`;
                }

                case 'runChatReasoning': {
                    setAgentStatus('🧠 Deep Reasoning...');
                    const originalPrompt = currentPromptRef.current;
                    console.log("[MATE:REASON] Using original prompt:", originalPrompt);

                    try {
                        const response = await mateApi.runReasoning(originalPrompt);
                        const text = response.data;
                        const answerMatch = text.match(/Answer:\s*([\s\S]*?)(?:\[DONE\]|$)/);
                        const finalAnswer = answerMatch ? answerMatch[1].trim() : text;

                        dispatch(fetchTasks());

                        setMessages(prev => [...prev, {
                            id: 'reason-' + Date.now(),
                            role: 'assistant',
                            content: finalAnswer,
                            timestamp: Date.now()
                        }]);

                        return `REASONING COMPLETE: User has been notified.`;
                    } catch (err) {
                        console.error("[MATE:REASON_ERR]", err);
                        if ((err as any).response) {
                            console.error("[MATE:REASON_DATA]", (err as any).response.data);
                        }
                        return `ERROR: ${(err as any).message}`;
                    }
                }

                default:
                    return `Unknown tool: ${call.toolName}`;
            }
        } catch (error) {
            console.error(`[MATE:TOOLERR] ${call.toolName}`, error);
            return `FAILURE: ${(error as any).message}`;
        }
    }, [dispatch]);

    // ─── Native RAM Disposal ──────────────────────────────────────────────
    const llmRef = useRef(llm);
    useEffect(() => { llmRef.current = llm; }, [llm]);

    useEffect(() => {
        return () => {
            // Explicitly kill the session and purge memory on screen exit
            if (llmRef.current) {
                console.log("[MATE] 🧹 Unmount: Purging LLM session from RAM...");
                const target = llmRef.current as any;
                if (target.delete) {
                    target.delete().catch((e: any) => console.log("Delete failed:", e));
                } else if (target.interrupt) {
                    target.interrupt(); // Fallback to interrupt if delete isn't exposed
                }
            }
        };
    }, []);

    // ─── Status Engine ──────────────────────────────────────────────────────
    useEffect(() => {
        if (llm.isGenerating) {
            setAgentStatus('🤖 Thinking...');
        } else if (!llm.isReady && llm.downloadProgress < 1) {
            setAgentStatus(`Downloading Intelligence... ${Math.round(llm.downloadProgress * 100)}%`);
        } else if (!llm.isReady) {
            setAgentStatus('Waking up...');
        } else {
            setAgentStatus('ready');
        }
    }, [llm.isReady, llm.downloadProgress, llm.isGenerating]);

    // ─── Interaction Handlers ────────────────────────────────────────────────
    const handleSend = async () => {
        const text = input.trim();
        if (!text || !llm.isReady) return;

        console.log(`[MATE:USER_PROMPT] "${text}"`);
        currentPromptRef.current = text;
        setInput('');

        const newUserMsgId = 'user-' + Date.now();
        setMessages(prev => [...prev, {
            id: newUserMsgId,
            role: 'user',
            content: text,
            timestamp: Date.now()
        }]);

        try {
            const lowText = text.toLowerCase();
            const keywords = ['if', 'check', 'free', 'busy', 'schedule', 'planning', 'choice', 'decide', 'can i', 'should i'];
            const needsReasoning = keywords.some(k => lowText.includes(k));

            if (needsReasoning) {
                console.log("[MATE:ROUTING] Hard-routed to Reasoning via code logic");
                await executeTool({
                    toolName: 'runChatReasoning',
                    arguments: {}
                });
                return;
            }

            console.log("[MATE:GEN] Proceeding to Hammer for simple intent routing...");
            const systemPrompt = buildSystemPrompt(isoDate(new Date()));

            const chat: Message[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ];

            const response = await (llm as any).generate(chat);
            console.log("[MATE:RAW_HAMMER]", response);

            // --- Manual Tool Parsing ---
            const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                try {
                    const toolCalls = JSON.parse(jsonMatch[0]);
                    console.log("[MATE:PARSED_TOOLS]", toolCalls);

                    if (toolCalls.length > 0) {
                        // --- Priority Selection: Prefer Reasoning over Simple Tools ---
                        // If the model is confused and calls multiple tools, we MUST pick Reasoning
                        // because it handles complex conditional logic.
                        const reasoningCall = toolCalls.find((c: any) => c.name === 'runChatReasoning');
                        const finalCall = reasoningCall || toolCalls[0];

                        if (finalCall.name && finalCall.arguments) {
                            await executeTool({
                                toolName: finalCall.name,
                                arguments: finalCall.arguments
                            });
                        }
                    }
                } catch (parseErr) {
                    console.error("[MATE:PARSE_ERR]", parseErr);
                }
            } else {
                const cleaned = response.trim();
                if (cleaned && cleaned !== 'null') {
                    setMessages(prev => [...prev, {
                        id: 'assistant-' + Date.now(),
                        role: 'assistant',
                        content: cleaned,
                        timestamp: Date.now()
                    }]);
                }
            }
        } catch (e) {
            console.error("[MATE:GEN_FAIL]", e);
        } finally {
            // --- CRITICAL: Reset Native Session for 0.5B Stability ---
            try {
                if (llm.messageHistory.length > 0) {
                    console.log(`[MATE:CLEANUP] Clearing ${llm.messageHistory.length} messages from internal state...`);
                    // Removing messages from the hook's history helps keep the next generate call clean
                    // We delete from index 0 until empty
                    while (llm.messageHistory.length > 0) {
                        llm.deleteMessage(0);
                    }
                }
            } catch (cleanupErr) {
                console.log("[MATE:CLEANUP_ERR]", cleanupErr);
            }
        }
    };

    // Remove the automatic tool configurator as we now use manual generate
    useEffect(() => {
        // No longer using llm.configure for tools since we handle it manually via llm.generate
    }, [llm.isReady]);

    const handleInterrupt = () => {
        (llm as any).interrupt?.();
        setAgentStatus('ready');
    };

    // ─── UI Message Stream ──────────────────────────────────────────────────
    useEffect(() => {
        const uiMsgs = history.map((m, i) => ({
            id: `msg-${i}-${Date.now()}`,
            role: m.role as 'user' | 'assistant',
            content: (m.content || '').replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim(),
            timestamp: Date.now()
        })).filter(m => m.content);
        setMessages(uiMsgs);
    }, [history]);

    const displayMessages = [...messages];
    if (llm.isGenerating && llm.response) {
        const cleaned = llm.response.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();
        if (cleaned) {
            displayMessages.push({
                id: 'streaming-' + Date.now(),
                role: 'assistant',
                content: cleaned,
                timestamp: Date.now()
            });
        }
    }

    return {
        llm,
        messages: displayMessages,
        input,
        setInput,
        handleSend,
        handleInterrupt,
        agentStatus,
        capability,
        isReady: llm.isReady,
        isDownloading: !llm.isReady && llm.downloadProgress < 1 && llm.downloadProgress > 0,
        downloadProgress: llm.downloadProgress
    };
};