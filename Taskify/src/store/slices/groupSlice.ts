import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { groupApi, Group } from '../../api/groups';
import { logout, removeAccount } from './authSlice';

interface GroupState {
    groups: Group[];
    currentGroup: Group | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: GroupState = {
    groups: [],
    currentGroup: null,
    isLoading: false,
    error: null,
};

export const fetchGroups = createAsyncThunk(
    'groups/fetchAll',
    async ({ userId, created_at }: { userId: string; created_at?: string }) => {
        const response = await groupApi.getGroups(userId, created_at);
        return { groups: response.data, created_at };
    }
);

export const fetchGroupDetails = createAsyncThunk('groups/fetchDetails', async (groupId: string) => {
    const response = await groupApi.getDetails(groupId);
    return response.data;
});

const groupSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        clearGroups: (state) => {
            state.groups = [];
            state.currentGroup = null;
        },
        addGroup: (state, action: PayloadAction<Group>) => {
            state.groups.push(action.payload);
        },
        updateGroupTask: (state, action: PayloadAction<{ groupId: string; task: any }>) => {
            const { groupId, task } = action.payload;
            const groupIndex = state.groups.findIndex(g => g._id === groupId);
            if (groupIndex !== -1) {
                // Map notification data to GroupTask structure if necessary
                const normalizedTask = {
                    ...task,
                    _id: task._id || task.taskId,
                    duedate: task.duedate || task.dueDate,
                    completed: task.completed || false
                };

                const taskIndex = state.groups[groupIndex].tasks.findIndex(t => t._id === normalizedTask._id);
                if (taskIndex !== -1) {
                    state.groups[groupIndex].tasks[taskIndex] = normalizedTask;
                } else {
                    state.groups[groupIndex].tasks.push(normalizedTask);
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.isLoading = false;
                const { groups: incomingGroups, created_at } = action.payload;

                if (created_at) {
                    // Sync mode: Append only new groups or update existing ones
                    const currentIds = new Set(state.groups.map(g => g._id));
                    const newGroups = incomingGroups.filter(g => !currentIds.has(g._id));
                    
                    // We might also want to update existing groups if they are returned
                    // but usually 'created_at' implies we only get things created AFTER that time.
                    state.groups = [...state.groups, ...newGroups];
                } else {
                    // Full replacement mode
                    state.groups = incomingGroups;
                }
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch groups';
            })
            .addCase(fetchGroupDetails.fulfilled, (state, action) => {
                state.currentGroup = action.payload;
            })
            // Listen to auth actions for automatic cleanup
            .addCase(logout, (state) => {
                state.groups = [];
                state.currentGroup = null;
                state.error = null;
            })
            .addCase(removeAccount, (state) => {
                state.groups = [];
                state.currentGroup = null;
                state.error = null;
            });
    },
});

export const { clearGroups, addGroup, updateGroupTask } = groupSlice.actions;
export default groupSlice.reducer;
