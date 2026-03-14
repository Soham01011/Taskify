import { LLMTool } from 'react-native-executorch';

/**
 * Tool Definitions for TaskMate Agentic AI
 */

export const TASK_TOOLS: LLMTool[] = [
    {
        name: 'get_tasks',
        description: 'Get all personal tasks for the user. Use this when the user asks about their schedule or pending tasks. Usually you do not need any parameters.',
        parameters: {
            type: 'object',
            properties: {
                created_after: { type: 'string', description: 'Optional ISO date string.' }
            }
        }
    },
    {
        name: 'create_task',
        description: 'Create a new personal task.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'The title of the task.' },
                description: { type: 'string', description: 'Detailed description.' },
                dueDate: { type: 'string', description: 'ISO date string.' },
                subtasks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string' }
                        }
                    }
                }
            },
            required: ['title']
        }
    },
    {
        name: 'update_task',
        description: 'Update an existing task.',
        parameters: {
            type: 'object',
            properties: {
                taskId: { type: 'string' },
                updates: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        completed: { type: 'boolean' },
                        dueDate: { type: 'string' }
                    }
                }
            },
            required: ['taskId', 'updates']
        }
    },
    {
        name: 'delete_task',
        description: 'Delete a task by ID.',
        parameters: {
            type: 'object',
            properties: {
                taskId: { type: 'string' }
            },
            required: ['taskId']
        }
    }
];

export const GROUP_TOOLS: LLMTool[] = [
    {
        name: 'get_groups',
        description: 'Get all groups the user is a member of.',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'get_group_members',
        description: 'Get members of a specific group.',
        parameters: {
            type: 'object',
            properties: {
                groupId: { type: 'string' }
            },
            required: ['groupId']
        }
    },
    {
        name: 'assign_group_task',
        description: 'Assign a task to a member of a group.',
        parameters: {
            type: 'object',
            properties: {
                groupId: { type: 'string' },
                userId: { type: 'string', description: 'ID of the member.' },
                username: { type: 'string', description: 'Username of the member.' },
                task: { type: 'string', description: 'Task description.' },
                duedate: { type: 'string', description: 'ISO date string.' }
            },
            required: ['groupId', 'userId', 'username', 'task', 'duedate']
        }
    }
];

export const IDEA_TOOLS: LLMTool[] = [
    {
        name: 'get_ideas',
        description: 'Get all captured ideas.',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'create_idea',
        description: 'Capture a new idea.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' }
            },
            required: ['title']
        }
    }
];

export const ALL_TOOLS = [...TASK_TOOLS, ...GROUP_TOOLS, ...IDEA_TOOLS];
