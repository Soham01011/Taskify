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
}

export const taskApi = {
    getAll: () => client.get<Task[]>('/tasks'),

    create: (data: { title: string; description?: string; dueDate?: string; subtasks?: { title: string; dueDate?: string }[] }) =>
        client.post<Task>('/tasks', data),

    update: (id: string, data: Partial<Task>) =>
        client.put<Task>(`/tasks/${id}`, data),

    complete: (id: string) =>
        client.patch<Task>(`/tasks/${id}/complete`),

    addSubtask: (id: string, data: { title: string; dueDate?: string }) =>
        client.post<Task>(`/tasks/${id}/subtasks`, data),

    updateSubtask: (taskId: string, subtaskId: string, data: Partial<Subtask>) =>
        client.put<Task>(`/tasks/${taskId}/subtasks/${subtaskId}`, data),
};
