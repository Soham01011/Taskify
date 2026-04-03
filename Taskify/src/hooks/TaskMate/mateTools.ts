import { LLMTool } from 'react-native-executorch';

export const MATE_TOOLS: LLMTool[] = [
    {
        name: 'createTask',
        description: 'Create a new task with optional subtasks and recurrence.',
        parameters: {
            type: 'dict',
            properties: {
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Detailed description' },
                subtasks: { type: 'array', items: { type: 'string' }, description: 'List of subtask titles' },
                dueDate: { type: 'string', description: 'ISO string including Year, Month, Date, Hour, Minute. E.g. 2026-03-27T16:00:00' },
                recurrence: {
                    type: 'dict',
                    properties: {
                        type: { type: 'string', enum: ['none', 'daily', 'weekly', 'monthly'] },
                        monthlyType: { type: 'string', enum: ['on_date', 'on_weekend'], description: 'if it is on_date, then take the user specified date for weekend no need to provide date' }
                    }
                }
            },
            required: ['title', 'dueDate', 'recurrence']
        }
    },
    {
        name: 'fetchTasks',
        description: 'Fetch and list tasks for a specific date (YYYY-MM-DD) or all pending tasks.',
        parameters: {
            type: 'dict',
            properties: {
                filterDate: { type: 'string', description: 'Date in YYYY-MM-DD' }
            }
        }
    },
    {
        name: 'provideSummary',
        description: 'Use ONLY after fetchTasks or createTask. Returns a text summary to the user.',
        parameters: {
            type: 'dict',
            properties: {
                text: { type: 'string', description: 'The message to show to the user.' }
            }
        }
    }
];
