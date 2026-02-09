import client from './client';

export interface VerifyResponse {

    valid: boolean;
    error?: string;
    code?: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
}

export const authApi = {
    register: (username: string, password: string) =>
        client.post('/auth/register', { username, password }),

    login: (username: string, password: string) =>
        client.post('/auth/login', { username, password }),

    verify: (token: string) =>
        client.post<VerifyResponse>('/auth/verify', { token }),

    refresh: (refreshToken: string) =>
        client.post<RefreshResponse>('/auth/refresh', { refreshToken }),
};

