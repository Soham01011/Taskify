import client from './client';

export const authApi = {
    register: (username: string, password: string) =>
        client.post('/auth/register', { username, password }),

    login: (username: string, password: string) =>
        client.post('/auth/login', { username, password }),

    verify: (token: string) =>
        client.post('/auth/verify', { token }),

    refresh: (refreshToken: string) =>
        client.post('/auth/refresh', { refreshToken }),
};
