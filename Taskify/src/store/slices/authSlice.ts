import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
}

interface AuthState {
    users: User[]; // Multiple accounts support
    currentUserId: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    users: [],
    currentUserId: null,
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
        loginSuccess: (state, action: PayloadAction<User>) => {
            const newUser = action.payload;
            const existingUserIndex = state.users.findIndex(u => u.id === newUser.id);

            if (existingUserIndex !== -1) {
                state.users[existingUserIndex] = newUser;
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
            if (state.currentUserId) {
                state.users = state.users.filter(u => u.id !== state.currentUserId);
                state.currentUserId = state.users.length > 0 ? state.users[0].id : null;
            }
        },
        updateTokens: (state, action: PayloadAction<{ userId: string, accessToken: string, refreshToken: string }>) => {
            const user = state.users.find(u => u.id === action.payload.userId);
            if (user) {
                user.accessToken = action.payload.accessToken;
                user.refreshToken = action.payload.refreshToken;
            }
        }
    },
});

export const { setLoading, setError, loginSuccess, switchUser, logout, updateTokens } = authSlice.actions;
export default authSlice.reducer;
