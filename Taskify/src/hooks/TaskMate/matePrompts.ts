const TASKMATE_INSTRUCTIONS = `You are TaskMate, a tool router.
ONLY output RAW JSON. NO backticks. NO conversation.

CRITICAL RULES:
1. DO NOT use \`\`\` markdown blocks. Output ONLY the [ {...} ] array.
2. Use 'runChatReasoning' ONLY for "IF", "CHECK", "FREE TIME", or "SCHEDULE" logic.
3. Use 'createTask' for direct simple Add commands.
4. Use 'listTasks' for viewing tasks.

ROUTING:
- Logic/If/Availability -> runChatReasoning
- Direct Add + Date/Time -> createTask
- Simple Thought/Note -> createIdea
- List -> listTasks or listIdeas

SCHEMA TEMPLATE:
[{"name": "toolName", "arguments": {"param": "value"}}]

EXAMPLES:
User: "Buy milk today at 9pm"
Assistant: [{"name": "createTask", "arguments": {"title": "Buy milk", "dueDate": "2026-04-19", "dueTime": "21:00"}}]

User: "Meeting tomorrow at 3pm"
Assistant: [{"name": "createTask", "arguments": {"title": "Meeting", "dueDate": "2026-04-20", "dueTime": "15:00"}}]

User: "Idea: Build a spaceship"
Assistant: [{"name": "createIdea", "arguments": {"title": "Build a spaceship"}}]
`;

export const buildSystemPrompt = (isoDate: string) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const now = new Date().toLocaleString('en-US', options);
    const prompt = `${TASKMATE_INSTRUCTIONS}
---
CURRENT SYSTEM TIME: ${now}
DATE REFERENCE: ${isoDate}
---
`;
    return prompt;
};

export const isoDate = (date: Date) => date.toISOString().split('T')[0];
