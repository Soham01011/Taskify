// ─── Qwen PLANNER Prompt (The General) ────────────────────────────────────────
const buildPlanPrompt = (today: string, localTime: string) =>
    `You are TaskMate Planner. Today: ${today}.
Analyze the user's request and generate a MISSION PLAN (JSON Array) using these tools:
- listTasks({"date": "YYYY-MM-DD"})
- createTask({"title": "NAME", "dueDate": "YYYY-MM-DD", "dueTime": "HH:mm"})

Pattern: [{"action": "listTasks", "params": {"date": "${today}"}}, {"action": "evaluate", "goal": "Check 4 PM slot"}, {"action": "createTask", "params": {"title": "Gym", "dueDate": "${today}", "dueTime": "16:00"}}]
RULES:
1. Always FETCH before CREATING if looking for a free slot.
2. Output ONLY the JSON Array.`;

// ─── Hammer TOOL-CALLER Prompt (The Scout) ───────────────────────────────────
const buildToolPrompt = (today: string) =>
    `You are Tool Scout for ${today}.
Generate the JSON tool call based on input.
- listTasks: [{"name": "listTasks", "arguments": {"date": "YYYY-MM-DD"}}]
- createTask: [{"name": "createTask", "arguments": {"title": "NAME", "dueDate": "YYYY-MM-DD", "dueTime": "HH:mm"}}]
Output ONLY JSON.`;

// ─── Qwen STEP-SOLVER Prompt ─────────────────────────────────────────────────
const buildSolvePrompt = (goal: string, evidence: string) =>
    `You are TaskMate Solver. 
STEP GOAL: ${goal}
MISSION EVIDENCE: ${evidence}
Decide if the goal is met (Conflict vs Free). Use the 30-min buffer rule.
Output: PROCEED or CLARIFY (with reason).`;

// ─── Qwen SUMMARY Prompt ─────────────────────────────────────────────────────
const buildSumPrompt = (evidence: string) =>
    `Final Summary Turn. Friendly and clear.
Results: ${evidence}`;

export const buildStagePrompt = (
    stage: 'PLAN' | 'TOOL' | 'SOLVE' | 'SUM',
    today: string,
    goal: string = "",
    evidence: string = ""
): string => {
    if (stage === 'PLAN') return buildPlanPrompt(today, new Date().toLocaleTimeString()).replace(/[^\x00-\x7F]/g, " ");
    if (stage === 'TOOL') return buildToolPrompt(today).replace(/[^\x00-\x7F]/g, " ");
    if (stage === 'SOLVE') return buildSolvePrompt(goal, evidence).replace(/[^\x00-\x7F]/g, " ");
    return buildSumPrompt(evidence).replace(/[^\x00-\x7F]/g, " ");
};

export const isoDate = (d: Date) => d.toISOString().split('T')[0];
