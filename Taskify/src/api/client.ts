import * as Sentry from '@sentry/react-native';
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

            if (currentUser) {
                if (currentUser.apiEndpoint) {
                    config.baseURL = currentUser.apiEndpoint;
                }
                if (currentUser.accessToken) {
                    config.headers.Authorization = `Bearer ${currentUser.accessToken}`;
                }
            }
            console.log(`[API:REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            return config;
        },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const errorData = error.response?.data;
        const status = error.response?.status;

        // Log 400-level errors to Sentry before handling auth errors
        if (status && status >= 400 && status < 500) {
            Sentry.withScope((scope) => {
                scope.setLevel('warning');
                scope.setTag('api_url', originalRequest?.url);
                scope.setTag('status_code', status);

                scope.setContext('API Request', {
                    method: originalRequest?.method?.toUpperCase(),
                    url: originalRequest?.url,
                    baseURL: originalRequest?.baseURL,
                    headers: originalRequest?.headers,
                    data: typeof originalRequest?.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest?.data,
                });

                scope.setContext('API Response', {
                    status: status,
                    data: errorData,
                    headers: error.response?.headers,
                });

                Sentry.captureMessage(`API Error ${status}: ${originalRequest?.url || 'unknown endpoint'}`, 'warning');
            });
        }

        // Check if it's an authentication error (401)
        const isAuthError = status === 401;
        // Check for specific "Token expired" indicators from the backend docs
        const isTokenExpired = errorData?.code === 'TOKEN_EXPIRED' ||
            errorData?.error === 'Token expired' ||
            (isAuthError && !errorData); // Fallback for empty 401s

        if (isAuthError && isTokenExpired && !originalRequest._retry && store) {
            originalRequest._retry = true;

            const state = store.getState();
            const currentUserId = state.auth.currentUserId;
            const currentUser = state.auth.users.find((u: User) => u.id === currentUserId);

            if (currentUser?.refreshToken) {
                try {
                    console.log("Access token expired. Attempting to refresh...");
                    const baseURL = currentUser.apiEndpoint || API_URL;
                    // Using axios directly to avoid interceptor recursion
                    const response = await axios.post(`${baseURL}/auth/refresh`, {
                        refreshToken: currentUser.refreshToken,
                    });

                    const { accessToken, refreshToken, userId } = response.data;
                    console.log("Tokens refreshed successfully.");

                    store.dispatch(updateTokens({
                        userId: userId || currentUser.id,
                        accessToken,
                        refreshToken: refreshToken || currentUser.refreshToken // Server might provide same or new refresh token
                    }));

                    // Update header and retry original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return client(originalRequest);
                } catch (refreshError: any) {
                    // If refresh fails, it means the refresh token is also expired or invalid
                    console.log("Both tokens expired or invalid. Logging out user...");
                    store.dispatch(logout());
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token found, nothing to do but logout
                store.dispatch(logout());
            }
        }

        return Promise.reject(error);
    }
);



export default client;

