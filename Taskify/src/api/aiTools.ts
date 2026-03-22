import { LLMTool } from 'react-native-executorch';

/**
 * Tool Definitions for TaskMate Agentic AI
 * These are passed to SmolLM as structured context so it can make accurate
 * intent + parameter decisions for every user prompt.
 */

// ─── TASK TOOLS ──────────────────────────────────────────────────────────────

export const TASK_TOOLS: LLMTool[] = [
    {
        name: 'create_task',
        description: 'Create a new personal task for the user. Required: title. Optional: description, subtasks, dueDate (in ISO format built from year/month/date/hours/minutes relative to current time), recurrence.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Task title. Required.' },
                description: { type: 'string', description: 'Optional task description.' },
                dueDate: { type: 'string', description: 'ISO date string built from current time context. e.g. "2026-03-20T10:00:00"' },
                subtasks: {
                    type: 'array',
                    description: 'Optional array of subtask objects.',
                    items: {
                        type: 'object',
                        properties: { title: { type: 'string' } }
                    }
                },
                recurrence: {
                    type: 'object',
                    description: 'Optional recurrence config.',
                    properties: {
                        frequency: {
                            type: 'string',
                            description: 'One of: none, daily, weekly, monthly, six-months, annually.'
                        },
                        daysOfWeek: {
                            type: 'array',
                            items: { type: 'number' },
                            description: 'For weekly: day indices (0=Sun, 6=Sat).'
                        },
                        dayOfMonth: { type: 'number', description: 'For monthly: specific day of month.' },
                        lastWeekend: { type: 'boolean', description: 'For monthly on last weekend.' },
                        timeOfDay: { type: 'string', description: 'HH:MM time string.' }
                    }
                }
            },
            required: ['title']
        }
    },
    {
        name: 'get_tasks',
        description: 'List all personal tasks. If user asks for TODAY tasks, set dueDate to today midnight (00:01). If TOMORROW, increment date by 1. If LLM explanation is needed (user asks a question about tasks), set LLM_required to true.',
        parameters: {
            type: 'object',
            properties: {
                dueDate: {
                    type: 'string',
                    description: 'ISO date string filter. Set to today\'s date at 00:01 for today\'s tasks, tomorrow\'s for tomorrow. Omit for ALL tasks.'
                },
                completed: {
                    type: 'boolean',
                    description: 'Filter by completion status. true for completed, false for pending.'
                },
                LLM_required: {
                    type: 'boolean',
                    description: 'Set to true if user asked a question about tasks that needs reasoning/explanation (e.g. "which task is most urgent?"). False for simple listing.'
                }
            }
        }
    },
];

// ─── IDEA TOOLS ───────────────────────────────────────────────────────────────

export const IDEA_TOOLS: LLMTool[] = [
    {
        name: 'create_idea',
        description: 'Capture a new idea for the user.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Idea title. Required.' },
                description: { type: 'string', description: 'Optional idea description.' }
            },
            required: ['title']
        }
    },
    {
        name: 'get_ideas',
        description: 'List all of the user\'s saved ideas.',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'get_specific_idea',
        description: 'Get details and notes for one particular idea by its title or name.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'The title/name of the idea to look up.' }
            },
            required: ['title']
        }
    },
    {
        name: 'add_idea_note',
        description: 'Add a thread note/entry to an existing idea.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title of the idea to add the note to.' },
                content: { type: 'string', description: 'The note content to add.' }
            },
            required: ['title', 'content']
        }
    },
    {
        name: 'delete_idea_note',
        description: 'Delete a specific note/thread entry from an idea.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title of the idea.' },
                noteContent: { type: 'string', description: 'Content of the note to delete (to help identify it).' }
            },
            required: ['title']
        }
    }
];

// ─── GROUP TOOLS ──────────────────────────────────────────────────────────────

export const GROUP_TOOLS: LLMTool[] = [
    {
        name: 'create_group',
        description: 'Create a new group. Requires group name and member userIds. Description is optional. If member userIds are not provided, ask the user.',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Group name. Required.' },
                description: { type: 'string', description: 'Optional group description.' },
                members: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of user IDs of members. Required.'
                }
            },
            required: ['name', 'members']
        }
    },
    {
        name: 'get_groups',
        description: 'List all groups that the user is a member of.',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'get_specific_group',
        description: 'Get details of a particular group by its name.',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the group.' }
            },
            required: ['name']
        }
    },
    {
        name: 'get_specific_group_tasks',
        description: 'Get all tasks for a specific group by its name. Returns task name, due date, assignee, and completion status.',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The group name to fetch tasks for.' }
            },
            required: ['name']
        }
    },
    {
        name: 'create_group_task',
        description: 'Assign a new task to a group member. Requires group name and assignee (member name/userId). If group name or member is missing, ask the user. If user forgot group members, call get_specific_group first.',
        parameters: {
            type: 'object',
            properties: {
                groupName: { type: 'string', description: 'Name of the group. Required.' },
                assigneeUsername: { type: 'string', description: 'Username of the member to assign to. Required.' },
                assigneeUserId: { type: 'string', description: 'User ID of the assignee if known.' },
                title: { type: 'string', description: 'Task title/description. Required.' },
                description: { type: 'string', description: 'Optional task description.' },
                dueDate: { type: 'string', description: 'ISO date string for due date.' },
                subtasks: {
                    type: 'array',
                    items: { type: 'object', properties: { title: { type: 'string' } } },
                    description: 'Optional subtasks array.'
                },
                recurrence: {
                    type: 'object',
                    properties: {
                        frequency: { type: 'string', description: 'none, daily, weekly, monthly, six-months, annually' },
                        daysOfWeek: { type: 'array', items: { type: 'number' } },
                        dayOfMonth: { type: 'number' },
                        lastWeekend: { type: 'boolean' },
                        timeOfDay: { type: 'string' }
                    }
                }
            },
            required: ['groupName', 'assigneeUsername', 'title']
        }
    }
];

export const ALL_TOOLS: LLMTool[] = [...TASK_TOOLS, ...IDEA_TOOLS, ...GROUP_TOOLS];
