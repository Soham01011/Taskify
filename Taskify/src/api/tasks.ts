import client from './client';

export interface Subtask {
    _id?: string;
    title: string;
    completed: boolean;
    dueDate?: string;
}

export interface Task {
    _id: string;
    userId: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    subtasks: Subtask[];
    alarm_type?: 'push' | 'alarm';
    alarm_reminder_time?: string;
    recurrence?: {
        frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'six-months' | 'annually';
        daysOfWeek?: number[];
        dayOfMonth?: number;
        lastWeekend?: boolean;
        timeOfDay?: string;
    };
    created_at: string;
    updated_at: string;
    groupId?: string;
    groupName?: string;
}

export interface FetchTasksParams {
    pageNumber?: number;
    pageSize?: number;
    created_at?: string;
}

export interface PaginatedTasksResponse {
    tasks: Task[];
    pagination: {
        totalTasks: number;
        currentPage: number;
        pageSize: number;
        totalPages: number;
    };
}

export interface WeeklyEvaluationResponse {
    week: string;
    evaluation_window: {
        from: string;
        to: string;
    };
    summary: {
        total_tasks: number;
        completed: number;
        incomplete: number;
        overdue: number;
        on_time: number;
        completion_rate_percent: number;
        recurring_tasks: number;
        one_off_tasks: number;
    };
    subtasks: {
        total: number;
        completed: number;
        completion_rate_percent: number;
    };
    daily_breakdown: Record<string, { due: number; completed: number }>;
    insights: {
        most_productive_day: string | null;
        most_productive_day_completions: number;
    };
}

export interface WeeklyEvaluationLockedResponse {
    error: string;
    message: string;
    week: string;
    next_available_after: string;
}

export const taskApi = {
    getAll: (params?: FetchTasksParams) => client.get<Task[] | PaginatedTasksResponse>('/tasks/', { params }),


    create: (data: {
        title: string;
        description?: string;
        dueDate?: string;
        subtasks?: { title: string; dueDate?: string }[];
        alarm_type?: 'push' | 'alarm';
        alarm_reminder_time?: string;
        created_at?: Date;
        updated_at?: Date;
        recurrence?: {
            frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'six-months' | 'annually';
            daysOfWeek?: number[];
            dayOfMonth?: number;
            lastWeekend?: boolean;
            timeOfDay?: string;
        };
    }) =>
        client.post<Task>('/tasks/', data),

    update: (id: string, data: Partial<Task>) =>
        client.put<Task>(`/tasks/${id}/`, data),

    complete: (id: string) =>
        client.patch<Task>(`/tasks/${id}/complete/`),

    addSubtask: (id: string, data: { title: string; dueDate?: string }) =>
        client.post<Task>(`/tasks/${id}/subtasks/`, data),

    updateSubtask: (taskId: string, subtaskId: string, data: Partial<Subtask>) =>
        client.put<Task>(`/tasks/${taskId}/subtasks/${subtaskId}/`, data),

    delete: (id: string) =>
        client.delete(`/tasks/${id}/`),

    deleteSubtask: (taskId: string, subtaskId: string) =>
        client.delete<Task>(`/tasks/${taskId}/subtasks/${subtaskId}/`),

    /**
     * Fetches the weekly evaluation report for the previous completed calendar week (Mon–Sun UTC).
     *
     * The device's local time is read and converted to a UTC ISO 8601 string via
     * `new Date().toISOString()` — JavaScript's Date always serialises to UTC, so no
     * manual timezone conversion is required.
     *
     * Returns 200 with the report on the first call for a given past week, or 423
     * (Locked) if the report has already been viewed.
     */
    getWeeklyEvaluation: () => {
        // `new Date()` captures the device's current local moment; `.toISOString()`
        // converts it to a UTC ISO 8601 string (e.g. "2026-09-10T14:00:00.000Z").
        const clientTime = new Date().toISOString();
        return client.get<WeeklyEvaluationResponse>('/tasks/weekly-evaluation', {
            params: { clientTime },
        });
    },
};

