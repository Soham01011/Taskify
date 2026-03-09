import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ideaApi, Idea, FetchIdeasParams, PaginatedIdeasResponse } from '../../api/ideas';
import { logout, removeAccount } from './authSlice';

interface IdeaState {
    ideas: Idea[];
    pagination: PaginatedIdeasResponse['pagination'] | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: IdeaState = {
    ideas: [],
    pagination: null,
    isLoading: false,
    error: null,
};

export const fetchIdeas = createAsyncThunk(
    'ideas/fetchAll',
    async (params?: FetchIdeasParams) => {
        const response = await ideaApi.getAll(params);
        return { data: response.data, params };
    }
);

const ideaSlice = createSlice({
    name: 'ideas',
    initialState,
    reducers: {
        clearIdeas: (state) => {
            state.ideas = [];
            state.pagination = null;
        },
        addIdea: (state, action: PayloadAction<Idea>) => {
            // Prepend so newest shows first
            state.ideas = [action.payload, ...state.ideas];
        },
        updateIdea: (state, action: PayloadAction<Idea>) => {
            const index = state.ideas.findIndex(i => i._id === action.payload._id);
            if (index !== -1) {
                state.ideas[index] = action.payload;
            }
        },
        removeIdea: (state, action: PayloadAction<string>) => {
            state.ideas = state.ideas.filter(i => i._id !== action.payload);
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchIdeas.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchIdeas.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, params } = action.payload;

                let incomingIdeas: Idea[] = [];
                let incomingPagination = null;

                if (Array.isArray(data)) {
                    incomingIdeas = data;
                } else {
                    incomingIdeas = data.ideas;
                    incomingPagination = data.pagination;
                }

                if (params?.created_at) {
                    // Sync mode: Append only new ideas
                    const currentIds = new Set(state.ideas.map(i => i._id));
                    const newIdeas = incomingIdeas.filter(i => !currentIds.has(i._id));
                    state.ideas = [...newIdeas, ...state.ideas]; // prepend new
                    state.pagination = incomingPagination;
                } else if (params?.pageNumber && params.pageNumber > 1) {
                    // Infinite scroll: Append new page
                    const currentIds = new Set(state.ideas.map(i => i._id));
                    const newIdeas = incomingIdeas.filter(i => !currentIds.has(i._id));
                    state.ideas = [...state.ideas, ...newIdeas];
                    state.pagination = incomingPagination;
                } else {
                    // Full replacement
                    state.ideas = incomingIdeas;
                    state.pagination = incomingPagination;
                }
            })
            .addCase(fetchIdeas.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch ideas';
            })
            .addCase(logout, (state) => {
                state.ideas = [];
                state.pagination = null;
                state.error = null;
            })
            .addCase(removeAccount, (state) => {
                state.ideas = [];
                state.pagination = null;
                state.error = null;
            });
    },
});

export const { clearIdeas, addIdea, updateIdea, removeIdea } = ideaSlice.actions;
export default ideaSlice.reducer;
