import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';

import { taskApi, Task, FetchTasksParams, PaginatedTasksResponse } from '../../api/tasks';
import { RootState } from '../index';
import { Group } from '../../api/groups';
import { logout, removeAccount } from './authSlice';


interface TaskState {
    tasks: Task[];
    pagination: PaginatedTasksResponse['pagination'] | null;
    isLoading: boolean;
    error: string | null;
    completingTaskIds: string[];
}

const initialState: TaskState = {
    tasks: [],
    pagination: null,
    isLoading: false,
    error: null,
    completingTaskIds: [],
};

export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    async (params?: FetchTasksParams) => {
        const response = await taskApi.getAll(params);
        return { data: response.data, params };
    }
);

export const completeTask = createAsyncThunk(
    'tasks/complete',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await taskApi.complete(id);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to complete task');
        }
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
        },
        addTasks: (state, action: PayloadAction<Task | Task[]>) => {
            const incoming = Array.isArray(action.payload) ? action.payload : [action.payload];
            const currentIds = new Set(state.tasks.map(t => t._id));
            const newTasks = incoming.filter(t => !currentIds.has(t._id));
            state.tasks = [...newTasks, ...state.tasks];
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
            // Handle Redux Persist rehydration to ensure runtime transient fields are properly initialized
            .addCase('persist/REHYDRATE', (state) => {
                state.completingTaskIds = [];
                state.isLoading = false;
            })
            // Complete task with non-blocking per-task loading tracking
            .addCase(completeTask.pending, (state, action) => {
                const id = action.meta.arg;
                if (!state.completingTaskIds) {
                    state.completingTaskIds = [];
                }
                if (!state.completingTaskIds.includes(id)) {
                    state.completingTaskIds.push(id);
                }
            })
            .addCase(completeTask.fulfilled, (state, action) => {
                const id = action.meta.arg;
                state.completingTaskIds = (state.completingTaskIds || []).filter(taskId => taskId !== id);
                if (action.payload?._id) {
                    const index = state.tasks.findIndex(t => t._id === action.payload._id);
                    if (index !== -1) {
                        state.tasks[index] = action.payload;
                    }
                }
            })
            .addCase(completeTask.rejected, (state, action) => {
                const id = action.meta.arg;
                state.completingTaskIds = (state.completingTaskIds || []).filter(taskId => taskId !== id);
                state.error = (action.payload as string) || action.error?.message || 'Failed to complete task';
            })
            // Listen to auth actions for automatic cleanup
            .addCase(logout, (state) => {
                state.tasks = [];
                state.pagination = null;
                state.error = null;
                state.completingTaskIds = [];
            })
            .addCase(removeAccount, (state) => {
                state.tasks = [];
                state.pagination = null;
                state.error = null;
                state.completingTaskIds = [];
            });
    },
});


export const { clearTasks, removeTask, updateTask, addTasks } = taskSlice.actions;

export const selectUnifiedTasks = createSelector(
    [(state: RootState) => state.tasks.tasks, (state: RootState) => state.auth.currentUserId, (state: RootState) => state.groups.groups],
    (personalTasks, currentUserId, groups) => {
        // Extract tasks assigned to the current user from all groups
        const groupTasks = groups.flatMap((group: Group) => 
            (group.tasks || [])
                .filter((task: any) => task.userId === currentUserId)
                .map((task: any) => ({
                    ...task,
                    groupId: group._id,
                    groupName: group.name,
                    // Map GroupTask fields to Task interface if they differ
                    title: task.task, // GroupTask uses 'task' for title
                    dueDate: task.duedate, // GroupTask uses 'duedate' (lowercase)
                }))
        );

        // Merge and return
        return [...personalTasks, ...groupTasks];
    }
);


export default taskSlice.reducer;
