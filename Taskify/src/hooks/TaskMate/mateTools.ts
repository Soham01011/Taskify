import { LLMTool } from 'react-native-executorch';

export const MATE_TOOLS: LLMTool[] = [
    {
        name: 'createTask',
        description: 'Registers a simple task. DO NOT use if the user request has "if", "when", or requires checking conflicts.',
        parameters: {
            type: 'dict',
            properties: {
                title: { type: 'string', description: 'Primary task objective (Required)' },
                description: { type: 'string', description: 'Detailed context (Optional)' },
                subtasks: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of sub-steps (Optional)'
                },
                recurrence: {
                    type: 'dict',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['none', 'daily', 'weekly', 'monthly_date', 'monthly_weekend'],
                            description: 'Frequency of the task.'
                        },
                        dayOfWeek: { type: 'string', description: 'Required for weekly (e.g. Monday)' },
                        dayOfMonth: { type: 'number', description: 'Required for monthly_date (1-31)' },
                        weekendOfMonth: { type: 'boolean', description: 'Required for monthly_weekend (true/false)' },
                        time: { type: 'string', description: 'HH:mm format' }
                    },
                    description: 'Recurrence pattern of the task (Required). For monthly either dayOfWeek or dayOfMonth or weekendOfMonth should be present.'
                },
                dueDate: { type: 'string', description: 'YYYY-MM-DD' },
                dueTime: { type: 'string', description: 'HH:mm' }
            },
            required: ['title', 'recurrence', 'dueDate', 'dueTime']
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
        name: 'runChatReasoning',
        description: 'MANDATORY for any request involving "if", "when", availability checks, or complex planning.',
        parameters: {
            type: 'dict',
            properties: {}
        }
    }
];
