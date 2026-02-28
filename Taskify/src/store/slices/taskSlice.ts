import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi, Task, FetchTasksParams, PaginatedTasksResponse } from '../../api/tasks';
import { logout, removeAccount } from './authSlice';


interface TaskState {
    tasks: Task[];
    pagination: PaginatedTasksResponse['pagination'] | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    pagination: null,
    isLoading: false,
    error: null,
};

export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    async (params?: FetchTasksParams) => {
        const response = await taskApi.getAll(params);
        return { data: response.data, params };
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearTasks: (state) => {
            state.tasks = [];
            state.pagination = null;
        },
        removeTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(t => t._id !== action.payload);
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, params } = action.payload;

                let incomingTasks: Task[] = [];
                let incomingPagination = null;

                if (Array.isArray(data)) {
                    incomingTasks = data;
                } else {
                    incomingTasks = data.tasks;
                    incomingPagination = data.pagination;
                }

                if (params?.created_at) {
                    // Sync mode: Append only new tasks
                    const currentIds = new Set(state.tasks.map(t => t._id));
                    const newTasks = incomingTasks.filter(t => !currentIds.has(t._id));
                    state.tasks = [...state.tasks, ...newTasks];
                    state.pagination = incomingPagination;
                } else if (params?.pageNumber && params.pageNumber > 1) {
                    // Infinite scroll mode: Append new page
                    const currentIds = new Set(state.tasks.map(t => t._id));
                    const newTasks = incomingTasks.filter(t => !currentIds.has(t._id));
                    state.tasks = [...state.tasks, ...newTasks];
                    state.pagination = incomingPagination;
                } else {
                    // Full replacement mode
                    state.tasks = incomingTasks;
                    state.pagination = incomingPagination;
                }
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch tasks';
            })
            // Listen to auth actions for automatic cleanup
            .addCase(logout, (state) => {
                state.tasks = [];
                state.pagination = null;
                state.error = null;
            })
            .addCase(removeAccount, (state) => {
                state.tasks = [];
                state.pagination = null;
                state.error = null;
            });
    },
});


export const { clearTasks, removeTask, updateTask } = taskSlice.actions;

export default taskSlice.reducer;
