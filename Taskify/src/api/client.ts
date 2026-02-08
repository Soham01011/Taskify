import axios from 'axios';
import { User, logout, updateTokens } from '../store/slices/authSlice';


const API_URL = 'http://192.168.1.50:3000/api'; // From API docs

let store: any;

/**
 * Injects the Redux store to be used in interceptors
 * This prevents circular dependencies
 */
export const injectStore = (_store: any) => {
    store = _store;
};

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    (config) => {
        if (!store) return config;

        const state = store.getState();
        const currentUserId = state.auth.currentUserId;
        const currentUser = state.auth.users.find((u: User) => u.id === currentUserId);

        if (currentUser?.accessToken) {
            config.headers.Authorization = `Bearer ${currentUser.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log(error);
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && store) {
            originalRequest._retry = true;

            const state = store.getState();
            const currentUserId = state.auth.currentUserId;
            const currentUser = state.auth.users.find((u: User) => u.id === currentUserId);

            if (currentUser?.refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken: currentUser.refreshToken,
                    });

                    const { accessToken, refreshToken } = response.data;

                    store.dispatch(updateTokens({
                        userId: currentUser.id,
                        accessToken,
                        refreshToken
                    }));

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    store.dispatch(logout());
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default client;

