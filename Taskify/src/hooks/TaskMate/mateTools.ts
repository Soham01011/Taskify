import { LLMTool } from 'react-native-executorch';

export const MATE_TOOLS: LLMTool[] = [
    {
        name: 'createTask',
        description: 'Registers a new task in the system.',
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
        description: 'Fetch tasks for a specific timeline.',
        parameters: {
            type: 'dict',
            properties: {
                date: { type: 'string', description: 'YYYY-MM-DD (Calculated from current date)' },
                allTasks: { type: 'boolean', description: 'Set true to fetch the entire database' },
                llm_required: { type: 'boolean', description: 'True if the user response requires an explanation or summary.' }
            }
        }
    }
];
