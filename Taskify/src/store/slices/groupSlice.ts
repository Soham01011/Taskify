import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { groupApi, Group } from '../../api/groups';

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
            });
    },
});

export const { clearGroups } = groupSlice.actions;
export default groupSlice.reducer;
