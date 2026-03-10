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
    register: (username: string, password: string, apiEndpoint?: string) =>
        client.post('/auth/register/', { username, password }, apiEndpoint ? { baseURL: apiEndpoint } : undefined),

    login: (username: string, password: string, apiEndpoint?: string) =>
        client.post('/auth/login/', { username, password }, apiEndpoint ? { baseURL: apiEndpoint } : undefined),

    verify: (token: string, apiEndpoint?: string) =>
        client.post<VerifyResponse>('/auth/verify/', { token }, apiEndpoint ? { baseURL: apiEndpoint } : undefined),

    refresh: (refreshToken: string, apiEndpoint?: string) =>
        client.post<RefreshResponse>('/auth/refresh/', { refreshToken }, apiEndpoint ? { baseURL: apiEndpoint } : undefined),

    updatePushToken: (token: string) =>
        client.patch('/users/me/push-token/', { pushToken: token }),
};

