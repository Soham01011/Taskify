import client from './client';

export interface GroupMember {
    userId: string;
    username: string;
}

export interface GroupTask {
    _id: string;
    userId: string;
    username: string;
    task: string;
    duedate: string;
    completed: boolean;
    subtasks?: { _id?: string; title: string; completed: boolean }[];
}

export interface Group {
    _id: string;
    name: string;
    description: string;
    adminId: string;
    members: any[]; // Array of User IDs or Objects with _id and username
    tasks: GroupTask[];
}

export const groupApi = {
    getGroups: (userId: string) => client.get<Group[]>(`/groups?userId=${userId}`),

    create: (data: { name: string; description: string; members: string[] }) =>
        client.post<Group>('/groups', data),

    getDetails: (id: string) =>
        client.get<Group>(`/groups/${id}`),

    assignTask: (id: string, data: { userId: string; username: string; task: string; duedate: string; subtasks?: { title: string; completed: boolean }[] }) =>
        client.post<Group>(`/groups/${id}/tasks`, data),

    updateTask: (groupId: string, taskId: string, data: Partial<GroupTask>) =>
        client.put<Group>(`/groups/${groupId}/tasks/${taskId}`, data),

    updateSubtask: (groupId: string, taskId: string, subtaskId: string, data: { completed: boolean }) =>
        client.put<Group>(`/groups/${groupId}/tasks/${taskId}/subtasks/${subtaskId}`, data),



    addMember: (groupId: string, userId: string) =>
        client.post<Group>(`/groups/${groupId}/members`, { userId }),

    removeMember: (groupId: string, userId: string) =>
        client.delete<Group>(`/groups/${groupId}/members/${userId}`),

    getMembers: (groupId: string) =>
        client.get<string[]>(`/groups/${groupId}/members`),

    delete: (groupId: string) =>
        client.delete<{ message: string }>(`/groups/${groupId}`),
};
