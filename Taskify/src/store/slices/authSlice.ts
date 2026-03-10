import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    primaryColor?: string;
    notificationsEnabled: boolean;
    taskNotificationsEnabled: boolean;
    groupNotificationsEnabled: boolean;
}

export interface User {
    id: string;
    username: string;
    accessToken?: string; // Optional because session might expire
    refreshToken?: string;
    apiEndpoint?: string;
    preferences: UserPreferences;
}

interface AuthState {
    users: User[]; // Multiple accounts support
    currentUserId: string | null;
    globalPreferences: UserPreferences;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    users: [],
    currentUserId: null,
    globalPreferences: {
        theme: 'system',
        primaryColor: '#00AEEF',
        notificationsEnabled: true,
        taskNotificationsEnabled: true,
        groupNotificationsEnabled: true,
    },
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        loginSuccess: (state, action: PayloadAction<Omit<User, 'preferences'> & { preferences?: UserPreferences }>) => {
            const userData = action.payload;
            const existingUserIndex = state.users.findIndex(u => u.id === userData.id);

            const newUser: User = {
                ...userData,
                preferences: userData.preferences || state.globalPreferences
            };

            if (existingUserIndex !== -1) {
                state.users[existingUserIndex] = {
                    ...state.users[existingUserIndex],
                    ...newUser
                };
            } else {
                state.users.push(newUser);
            }
            state.currentUserId = newUser.id;
            state.error = null;
        },
        switchUser: (state, action: PayloadAction<string>) => {
            if (state.users.some(u => u.id === action.payload)) {
                state.currentUserId = action.payload;
            }
        },
        logout: (state) => {
            // "Logout" now just clears the currentUserId (session) 
            // but keeps the account in the device list for easy switching
            if (state.currentUserId) {
                const user = state.users.find(u => u.id === state.currentUserId);
                if (user) {
                    delete user.accessToken;
                    delete user.refreshToken;
                }
                state.currentUserId = null;
            }
        },
        removeAccount: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter(u => u.id !== action.payload);
            if (state.currentUserId === action.payload) {
                state.currentUserId = state.users.length > 0 ? state.users[0].id : null;
            }
        },
        updateTokens: (state, action: PayloadAction<{ userId: string, accessToken: string, refreshToken: string }>) => {
            const user = state.users.find(u => u.id === action.payload.userId);
            if (user) {
                user.accessToken = action.payload.accessToken;
                user.refreshToken = action.payload.refreshToken;
            }
        },
        updateUserPreferences: (state, action: PayloadAction<{ userId: string, preferences: Partial<UserPreferences> }>) => {
            const user = state.users.find(u => u.id === action.payload.userId);
            if (user) {
                user.preferences = { ...user.preferences, ...action.payload.preferences };
            }
        },
        updateGlobalPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
            state.globalPreferences = { ...state.globalPreferences, ...action.payload };
        }
    },
});

export const {
    setLoading,
    setError,
    loginSuccess,
    switchUser,
    logout,
    removeAccount,
    updateTokens,
    updateUserPreferences,
    updateGlobalPreferences
} = authSlice.actions;
export default authSlice.reducer;
