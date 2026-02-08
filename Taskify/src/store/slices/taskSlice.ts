import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi, Task } from '../../api/tasks';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    isLoading: false,
    error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async () => {
    const response = await taskApi.getAll();
    return response.data;
});

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearTasks: (state) => {
            state.tasks = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch tasks';
            });
    },
});

export const { clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
