import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useLLM, QWEN2_5_1_5B_QUANTIZED, SMOLLM2_1_360M_QUANTIZED, ResourceFetcher, Message, ToolCall, LLMTool, parseToolCall } from 'react-native-executorch';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { ALL_TOOLS } from '../api/aiTools';
import { taskApi } from '../api/tasks';
import { groupApi } from '../api/groups';
import { ideaApi } from '../api/ideas';
import { fetchTasks, updateTask as updateTaskAction, removeTask as removeTaskAction } from '../store/slices/taskSlice';
import { fetchGroups, updateGroupTask as updateGroupTaskAction } from '../store/slices/groupSlice';
import { addIdea as addIdeaAction, fetchIdeas } from '../store/slices/ideaSlice';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export type AgentStatus = 'initializing' | 'ready' | 'working' | 'fetching' | 'processing' | 'error' | string;

export const useTaskMate = (selectedModelId: string, setSelectedModelId: (id: string) => void) => {
    const dispatch = useDispatch<AppDispatch>();
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('initializing');
    const [activeModel, setActiveModel] = useState<any>(null);
    const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    const { currentUserId, users } = useSelector((state: RootState) => state.auth);
    const tasks = useSelector((state: RootState) => state.tasks.tasks);
    const groups = useSelector((state: RootState) => state.groups.groups);
    const ideas = useSelector((state: RootState) => state.ideas.ideas);

    const currentUser = users.find(u => u.id === currentUserId);

    // Helper: convert UTC ISO string to local date-time string
    const utcToLocal = (isoString: string) => {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });
        } catch { return isoString; }
    };

    // Broken Time Helpers (Year, Month, Date, Hour, Minute)
    const getBrokenNow = () => {
        const d = new Date();
        return `${d.getFullYear()},${d.getMonth() + 1},${d.getDate()},${d.getHours()},${d.getMinutes()}`;
    };

    const utcToBrokenLocal = (isoString?: string) => {
        if (!isoString) return 'none';
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return 'none';
            return `${d.getFullYear()},${d.getMonth() + 1},${d.getDate()},${d.getHours()},${d.getMinutes()}`;
        } catch { return 'none'; }
    };

    const brokenLocalToUtc = (broken?: string) => {
        if (!broken || broken === 'none' || typeof broken !== 'string') return undefined;
        try {
            // Support formats like "2026,3,14,16,45"
            const parts = broken.split(',').map(Number);
            if (parts.length < 3) return undefined;
            const [y, m, d, h = 0, min = 0] = parts;
            const date = new Date(y, m - 1, d, h, min);
            return isNaN(date.getTime()) ? undefined : date.toISOString();
        } catch { return undefined; }
    };

    // Helper to minimize data sent to LLM (using broken local time)
    const trimTask = (t: any) => ({
        id: t._id,
        title: t.title,
        status: t.completed ? 'completed' : 'pending',
        due: utcToBrokenLocal(t.dueDate),
        subtasks: t.subtasks?.map((s: any) => ({ title: s.title, done: s.completed }))
    });

    // Tool Execution Callback
    const executeToolCallback = useCallback(async (call: ToolCall): Promise<string | null> => {
        const { toolName, arguments: args } = call;
        console.log(`[TaskMate Agent] Executing tool: ${toolName}`, args);
        setAgentStatus(`Agent: ${toolName.replace(/_/g, ' ')}...`);

        try {
            let result: any = null;
            switch (toolName) {
                case 'get_tasks':
                    // Return only pending tasks by default to save tokens and avoid hallucination
                    result = tasks.filter(t => !t.completed).map(trimTask);
                    if (result.length === 0) result = "No pending tasks found.";
                    break;
                
                case 'create_task': {
                    const res = await taskApi.create(args as any);
                    await dispatch(fetchTasks());
                    result = { success: true, task: trimTask(res.data) };
                    break;
                }

                case 'update_task': {
                    const { taskId, updates } = args as any;
                    const res = await taskApi.update(taskId, updates);
                    dispatch(updateTaskAction(res.data));
                    result = { success: true, task: trimTask(res.data) };
                    break;
                }

                case 'delete_task': {
                    const { taskId } = args as any;
                    await taskApi.delete(taskId);
                    dispatch(removeTaskAction(taskId));
                    result = { success: true };
                    break;
                }

                case 'get_groups':
                    result = groups.map(g => ({ id: g._id, name: g.name }));
                    break;

                case 'get_group_members': {
                    const { groupId } = args as any;
                    const group = groups.find(g => g._id === groupId);
                    result = group ? group.members.map((m: any) => ({ id: m.id, name: m.username })) : "Group not found";
                    break;
                }

                case 'assign_group_task': {
                    const groupArgs = args as any;
                    const res = await groupApi.assignTask(groupArgs.groupId, groupArgs);
                    dispatch(updateGroupTaskAction({ groupId: groupArgs.groupId, task: res.data.tasks[res.data.tasks.length - 1] }));
                    result = { success: true };
                    break;
                }


                case 'get_ideas':
                    result = ideas.map(i => ({ id: i._id, title: i.title }));
                    break;

                case 'create_idea': {
                    const res = await ideaApi.create(args as any);
                    dispatch(addIdeaAction(res.data));
                    result = { success: true, id: res.data._id };
                    break;
                }

                default:
                    result = `Tool ${toolName} not implemented.`;
            }
            const finalResult = typeof result === 'string' ? result : JSON.stringify(result);
            console.log(`[TaskMate Agent] Tool result (minimized):`, finalResult);
            return finalResult;
        } catch (err: any) {
            console.error(`[TaskMate Agent] Tool execution failed:`, err);
            return `Error: ${err.message}`;
        } finally {
            setAgentStatus('working');
        }
    }, [tasks, groups, ideas, dispatch, updateTaskAction, removeTaskAction, updateGroupTaskAction, addIdeaAction]);




    // Initialize Router LLM (SMOLLM2) for intent detection and JSON extraction
    const routerLLM = useLLM({
        model: SMOLLM2_1_360M_QUANTIZED
    });

    // Initialize Main LLM for reasoning and chat
    const llm = useLLM({
        model: activeModel || QWEN2_5_1_5B_QUANTIZED,
        preventLoad: !activeModel
    });

    useEffect(() => {
        if (llm.isReady) {
            const localTime = new Date().toLocaleString();
            llm.configure({
                chatConfig: {
                    systemPrompt: `You are TaskMate, an agentic AI assistant for the Taskify app. 
                    Current User: ${currentUser?.username || 'Unknown'} (ID: ${currentUserId})
                    Current Local Time: ${localTime}. 
                    All task/group/idea timestamps are stored in UTC. When displaying times to the user, convert them to their local time using the provided current time as a reference.
                    You can interact with user data using tools. If you need information (tasks, groups, members, ideas) to fulfill a request, call the appropriate tool. 
                    If information is missing (like an assignee for a group task), ask the user for clarification.
                    Be concise, professional, and helpful.`
                },
                toolsConfig: {
                    tools: ALL_TOOLS,
                    executeToolCallback: executeToolCallback,
                    displayToolCalls: false
                }
            });
            setAgentStatus('ready');
        } else if (llm.error) {
            setAgentStatus('error');
        } else {
            setAgentStatus('initializing');
        }
    }, [llm.isReady, llm.error, currentUserId, currentUser, tasks, groups, ideas, executeToolCallback, llm]);

    // Check for downloaded models
    const updateDownloadedModels = useCallback(async () => {
        try {
            const models = await ResourceFetcher.listDownloadedModels();
            setDownloadedModels(models);
        } catch (error) {
            console.error('Failed to list models:', error);
        }
    }, []);

    useEffect(() => {
        updateDownloadedModels();
    }, [updateDownloadedModels]);

    const handleSelectModel = (model: any) => {
        if (model.id === selectedModelId && activeModel) return true;
        setSelectedModelId(model.id);
        setActiveModel(model.config);
        return true;
    };

    const handleDeleteModel = async (model: any) => {
        return new Promise<boolean>((resolve) => {
            Alert.alert(
                'Delete Model',
                `Are you sure you want to delete ${model.name}?`,
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                    { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await ResourceFetcher.deleteResources(model.config.modelSource);
                                if (model.config.tokenizerSource) await ResourceFetcher.deleteResources(model.config.tokenizerSource);
                                if (model.config.tokenizerConfigSource) await ResourceFetcher.deleteResources(model.config.tokenizerConfigSource);
                                if (selectedModelId === model.id) setActiveModel(null);
                                await updateDownloadedModels();
                                resolve(true);
                            } catch { resolve(false); }
                        }
                    }
                ]
            );
        });
    };

    const handleSend = useCallback(async () => {
        const routerDownloading = !routerLLM.isReady && routerLLM.downloadProgress > 0 && routerLLM.downloadProgress < 1;
        if (!input.trim() || !routerLLM.isReady) {
            if (!routerLLM.isReady && !routerDownloading) {
                Alert.alert("Assistant", "The router model is not ready. Please wait a moment.");
            }
            return;
        }

        const userText = input.trim();
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAgentStatus('analyzing');

        try {
            // STEP 1: Intent Detection & Parameter Extraction with SMOLLM2
            const brokenNow = getBrokenNow();
            const routerSystemPrompt = `You are TaskMate Route Assistant. 
Identify intent and extract parameters into JSON.
Current Local Time (Y,M,D,H,Min): ${brokenNow}

INTENTS:
- create_task: user wants to create a new personal task.
- create_group_task: user wants to create a task for a group or assign to a member.
- create_idea: user wants to capture a new idea or note.
- get_tasks: user is asking about their tasks, schedule, or pending work.
- get_groups: user is asking about groups, teams, or members.
- get_ideas: user is asking about their ideas or saved notes.
- chat: general conversation or reasoning required.

JSON FORMAT:
{
  "intent": "string",
  "reasoning_required": boolean,
  "params": { 
     "title": "string", 
     "description": "string",
     "dueDate": "Y,M,D,H,M", (use local broken format for all dates)
     "groupId": "string",
     "userId": "string",
     "username": "string"
  },
  "search_query": "string" (keywords to fetch relevant data from the database)
}
Output ONLY valid JSON.`;

            console.log(`[TaskMate] Routing request: "${userText}"`);
            const routerResponse = await routerLLM.generate([
                { role: 'system', content: routerSystemPrompt },
                { role: 'user', content: userText }
            ]);

            let route: any = { intent: 'chat', reasoning_required: true };
            try {
                const jsonMatch = routerResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) route = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("[TaskMate] Router JSON parse failed, falling back to chat/reasoning.");
            }

            console.log(`[TaskMate] Route detected:`, route);

            // STEP 2: Execute Direct API if no reasoning is needed
            if (!route.reasoning_required && route.intent.startsWith('create')) {
                setAgentStatus('executing');
                try {
                    let successMessage = "";
                    if (route.intent === 'create_task') {
                        const dueDate = brokenLocalToUtc(route.params?.dueDate);
                        await taskApi.create({
                            title: route.params?.title || 'Untitled Task',
                            description: route.params?.description || '',
                            ...(dueDate ? { dueDate } : {})
                        });
                        await dispatch(fetchTasks());
                        successMessage = `I've created the task "${route.params?.title}" for you.`;
                    } else if (route.intent === 'create_group_task') {
                         const duedate = brokenLocalToUtc(route.params?.dueDate) || new Date().toISOString();
                         const res = await groupApi.assignTask(route.params?.groupId, {
                             userId: route.params?.userId,
                             username: route.params?.username,
                             task: route.params?.title || route.params?.task,
                             duedate
                         });
                         dispatch(updateGroupTaskAction({
                             groupId: route.params?.groupId,
                             task: res.data.tasks[res.data.tasks.length - 1]
                         }));
                         successMessage = `I've assigned the task to ${route.params?.username || 'the group'}.`;
                    } else if (route.intent === 'create_idea') {
                        const res = await ideaApi.create({
                            title: route.params?.title || 'New Idea',
                            description: route.params?.description || ''
                        });
                        dispatch(addIdeaAction(res.data));
                        successMessage = `I've saved your idea: ${route.params?.title}`;
                    }

                    if (successMessage) {
                        setMessages(prev => [...prev, {
                            id: 'ai-' + Date.now(),
                            role: 'assistant',
                            content: successMessage,
                            timestamp: Date.now()
                        }]);
                        setAgentStatus('ready');
                        return;
                    }
                } catch (apiErr) {
                    console.error("[TaskMate] Direct API call failed:", apiErr);
                    // Fallback to reasoning below
                }
            }

            // STEP 3: Reasoning Flow - Fetch Relevant Context
            setAgentStatus('fetching');
            let injectedContext = "";
            const query = (route.search_query || userText).toLowerCase();
            
            const needsTasks = route.intent === 'get_tasks' || query.includes('task') || query.includes('pending') || route.reasoning_required;
            const needsGroups = route.intent === 'get_groups' || query.includes('group') || query.includes('member');
            const needsIdeas = route.intent === 'get_ideas' || query.includes('idea');

            if (needsTasks) {
                const pending = tasks.filter(t => !t.completed).map(trimTask);
                if (pending.length > 0) injectedContext += `\nTasks (Local Y,M,D,H,Min): ${JSON.stringify(pending)}`;
            }
            if (needsGroups) {
                const groupData = groups.map(g => ({
                    id: g._id, name: g.name,
                    members: g.members?.map((m: any) => ({ id: m.userId || m._id, name: m.username }))
                }));
                if (groupData.length > 0) injectedContext += `\nGroups/Members: ${JSON.stringify(groupData)}`;
            }
            if (needsIdeas) {
                const ideaData = ideas.map(i => ({ id: i._id, title: i.title }));
                if (ideaData.length > 0) injectedContext += `\nIdeas/Notes: ${JSON.stringify(ideaData)}`;
            }

            setAgentStatus('thinking');
            const mainSystemPrompt = `You are TaskMate, a smart AI assistant for the Taskify app. 
Current User: ${currentUser?.username || 'User'}
Current Local Time: ${new Date().toLocaleString('en-IN')}
Available Context is in Local Broken Format (Year, Month, Day, Hour, Minute).
Provide clear, helpful responses based on the context data.`;

            const fullPrompt = injectedContext 
                ? `${userText}\n\n[CONTEXT DATA (Local Time)]:\n${injectedContext}`
                : userText;

            console.log(`[TaskMate] Sending reasoning request with context length: ${injectedContext.length}`);
            await llm.generate([
                { role: 'system', content: mainSystemPrompt },
                ...messages.slice(-8).map(m => ({ role: m.role as any, content: m.content })),
                { role: 'user', content: fullPrompt }
            ]);

        } catch (error) {
            console.error('[TaskMate] Generation process failed:', error);
            setAgentStatus('error');
        } finally {
            if (!llm.isGenerating && !routerLLM.isGenerating) setAgentStatus('ready');
        }
    }, [input, llm, routerLLM, messages, currentUser, tasks, groups, ideas, dispatch, updateGroupTaskAction, addIdeaAction]);




    useEffect(() => {
        if (llm.response) {
            // Suppress raw tool calls from UI
            const trimmed = llm.response.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('<tool_call>') || trimmed.includes('{"name":')) return;

            // Strip ACTION block — it's for the post-processor, not the user
            const cleanContent = llm.response.replace(/\nACTION:\{[\s\S]*?\}$/m, '').trim();
            if (!cleanContent) return;

            setMessages(prev => {
                const newMsgs = [...prev];
                const lastIndex = newMsgs.length - 1;
                if (lastIndex >= 0 && newMsgs[lastIndex].role === 'assistant') {
                    newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: cleanContent };
                } else {
                    newMsgs.push({
                        id: 'ai-' + Date.now(),
                        role: 'assistant',
                        content: cleanContent,
                        timestamp: Date.now()
                    });
                }
                return newMsgs;
            });
        }
    }, [llm.response]);


    useEffect(() => {
        if (!llm.isGenerating && agentStatus !== 'initializing' && agentStatus !== 'error' && agentStatus !== 'ready') {
            setAgentStatus('ready');
        }
    }, [llm.isGenerating, agentStatus]);

    const isDownloading = (!llm.isReady && llm.downloadProgress > 0 && llm.downloadProgress < 1) || (!routerLLM.isReady && routerLLM.downloadProgress > 0 && routerLLM.downloadProgress < 1);

    return {
        llm,
        messages,
        input,
        setInput,
        handleSend,
        handleSelectModel,
        handleDeleteModel,
        downloadedModels,
        isDownloading,
        activeModel,
        agentStatus
    };
};

