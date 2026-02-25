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

export const fetchGroups = createAsyncThunk('groups/fetchAll', async (userId: string) => {
    const response = await groupApi.getGroups(userId);
    return response.data;
});

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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.isLoading = false;
                state.groups = action.payload;
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

export const { clearGroups, addGroup } = groupSlice.actions;
export default groupSlice.reducer;
