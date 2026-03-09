import client from './client';

export interface ThreadEntry {
    _id: string;
    content: string;
    created_at: string;
}

export interface Idea {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    thread: ThreadEntry[] | null;
    syncSent: boolean;
    created_at: string;
    updated_at: string;
}

export interface FetchIdeasParams {
    pageNumber?: number;
    pageSize?: number;
    created_at?: string;
}

export interface PaginatedIdeasResponse {
    ideas: Idea[];
    pagination: {
        totalIdeas: number;
        currentPage: number;
        pageSize: number;
        totalPages: number;
    };
}

export const ideaApi = {
    getAll: (params?: FetchIdeasParams) =>
        client.get<Idea[] | PaginatedIdeasResponse>('/ideas', { params }),

    getOne: (id: string) =>
        client.get<Idea>(`/ideas/${id}`),

    create: (data: { title: string; description?: string }) =>
        client.post<Idea>('/ideas', data),

    update: (id: string, data: { title?: string; description?: string }) =>
        client.put<Idea>(`/ideas/${id}`, data),

    delete: (id: string) =>
        client.delete<{ message: string }>(`/ideas/${id}`),

    // Thread entry endpoints
    addThreadEntry: (id: string, content: string) =>
        client.post<Idea>(`/ideas/${id}/thread`, { content }),

    editThreadEntry: (id: string, entryId: string, content: string) =>
        client.put<Idea>(`/ideas/${id}/thread/${entryId}`, { content }),

    deleteThreadEntry: (id: string, entryId: string) =>
        client.delete<Idea>(`/ideas/${id}/thread/${entryId}`),
};
