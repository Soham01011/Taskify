import { LLMTool } from 'react-native-executorch';

export const MATE_TOOLS: LLMTool[] = [
    {
        name: 'createTask',
        description: 'Registers a task. Use for direct "Add" commands even if they have dates/times. Avoid ONLY if there is "if" logic.',
        parameters: {
            type: 'dict',
            properties: {
                title: { type: 'string', description: 'Primary task objective (Required)' },
                description: { type: 'string', description: 'Detailed context (Optional)' },
                dueDate: { type: 'string', description: 'YYYY-MM-DD' },
                dueTime: { type: 'string', description: 'HH:mm' }
            },
            required: ['title', 'dueDate', 'dueTime']
        }
    },
    {
        name: 'listTasks',
        description: 'Fetch and display pending tasks.',
        parameters: {
            type: 'dict',
            properties: {}
        }
    },
    {
        name: 'listIdeas',
        description: 'Fetch and display ideas.',
        parameters: {
            type: 'dict',
            properties: {}
        }
    },
    {
        name: 'createIdea',
        description: 'Save a new idea, thought, or open-ended note. DO NOT use for tasks with deadlines.',
        parameters: {
            type: 'dict',
            properties: {
                title: { type: 'string', description: 'The main idea or note title (Required)' },
                description: { type: 'string', description: 'Additional context or details (Optional)' }
            },
            required: ['title']
        }
    },
    {
        name: 'runChatReasoning',
        description: 'MANDATORY for any request involving "if", "when", availability checks, or complex planning.',
        parameters: {
            type: 'dict',
            properties: {}
        }
    }
];
