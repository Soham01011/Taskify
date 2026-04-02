const DATE_CONTEXT = (today: string, tomorrow: string) => `DATES:
- TODAY: ${today}
- TOMORROW: ${tomorrow}
- NEVER use dates from 2020.`;

const PLAN_PROMPT = `You are a Task Assistant in PLANNING mode.
Your ONLY goal is to call the correct tool for the user's request.

INTENT RULES:
- If user wants to see/fetch/list: call fetchTasks.
- If user wants to add/create: call createTask.
- STOP after one tool call.

Tool format: \`\`\`[{"name": "toolName", "arguments": {...}}]\`\`\``;

const SUMMARY_PROMPT = `You are a Task Assistant. 
You have FOUND the data requested. Your goal is to tell the user what you found in friendly, plain text.
- Be descriptive and helpful. 
- Use the data provided in the user prompt below.`;

export const buildStagePrompt = (stage: 'PLAN' | 'SUM', today: string, tomorrow: string, context: string = "None", evidence?: string) => {
    const stageInstr = stage === 'PLAN' ? PLAN_PROMPT : SUMMARY_PROMPT;
    const evidenceBlock = evidence ? `\nEVIDENCE (Already executed):\n${evidence}\n` : "";
    
    const raw = `${stageInstr}

${evidenceBlock}
CURRENT STATE:
${context}

${DATE_CONTEXT(today, tomorrow)}`;
    
    return raw.replace(/[^\x00-\x7F]/g, " ");
};

export const isoDate = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const pad = (n: number) => String(n).padStart(2, '0');
