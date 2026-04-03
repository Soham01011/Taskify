// ─── Hammer PLAN Prompt ───────────────────────────────────────────────────────
// Ultra-minimal. Hammer's ONLY job is to pick a tool. No CURRENT STATE, no noise.
// Small models fail when the system prompt is long - every token counts.
const buildPlanPrompt = (today: string, tomorrow: string) =>
    `Call the correct tool. Today=${today}, Tomorrow=${tomorrow}.\n- To see/check/fetch schedule: call fetchTasks.\n- To add/create/schedule task: call createTask.\nOutput ONLY the tool JSON.`;

// ─── Qwen SUM Prompt ─────────────────────────────────────────────────────────
// Qwen gets data context + the schedule. It does reasoning, not tool calling.
const buildSumPrompt = (today: string, tomorrow: string, context: string, evidence: string) =>
    `You are a helpful task assistant. Answer the user's question using ONLY the data below.\nToday: ${today} | Tomorrow: ${tomorrow}\n\nSchedule:\n${context}\n\nTool Result:\n${evidence}`;

export const buildStagePrompt = (
    stage: 'PLAN' | 'SUM',
    today: string,
    tomorrow: string,
    context: string = "None",
    evidence?: string
): string => {
    if (stage === 'PLAN') {
        return buildPlanPrompt(today, tomorrow).replace(/[^\x00-\x7F]/g, " ");
    }
    return buildSumPrompt(today, tomorrow, context, evidence || "").replace(/[^\x00-\x7F]/g, " ");
};

export const isoDate = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const pad = (n: number) => String(n).padStart(2, '0');
