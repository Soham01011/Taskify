const TASKMATE_INSTRUCTIONS = `You are TaskMate, a tool router.
ONLY output JSON. NO conversation.

CRITICAL RULES:
1. ONLY CALL ONE TOOL. Calling two tools is a FATAL ERROR.
2. If user says "IF", "CHECK", "FREE TIME", or "SCHEDULE", you MUST ONLY CALL 'runChatReasoning'.
3. 'runChatReasoning' takes ZERO parameters: {"name": "runChatReasoning", "arguments": {}}
4. Use 'createTask' ONLY for simple "add X" commands.
5. Use 'listTasks' ONLY for listing.

ROUTING:
- Complex/IF/Check -> runChatReasoning
- Simple Add -> createTask
- List -> listTasks
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
