import { useReducer, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { groupApi } from '../api/groups';
import { addGroup } from '../store/slices/groupSlice';

export interface GroupFormState {
    name: string;
    description: string;
    members: string[];
    newMemberId: string;
    showMemberInput: boolean;
    loading: boolean;
    error: string;
}

type FormAction =
    | { type: 'SET_FIELD'; field: keyof GroupFormState; value: any }
    | { type: 'ADD_MEMBER' }
    | { type: 'REMOVE_MEMBER'; memberId: string }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string };

const initialState: GroupFormState = {
    name: '',
    description: '',
    members: [],
    newMemberId: '',
    showMemberInput: false,
    loading: false,
    error: '',
};

function formReducer(state: GroupFormState, action: FormAction): GroupFormState {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'ADD_MEMBER': {
            const newId = state.newMemberId.trim();
            if (newId && !state.members.includes(newId)) {
                return {
                    ...state,
                    members: [...state.members, newId],
                    newMemberId: '',
                    showMemberInput: false
                };
            }
            return { ...state, newMemberId: '', showMemberInput: false };
        }
        case 'REMOVE_MEMBER':
            return { ...state, members: state.members.filter(m => m !== action.memberId) };
        case 'SUBMIT_START':
            return { ...state, loading: true, error: '' };
        case 'SUBMIT_SUCCESS':
            return { ...initialState, loading: false };
        case 'SUBMIT_ERROR':
            return { ...state, loading: false, error: action.error };
        default: return state;
    }
}

export function useCreateGroup(onSuccess: () => void) {
    const dispatch = useDispatch<AppDispatch>();
    const [state, localDispatch] = useReducer(formReducer, initialState);

    const handleCreate = useCallback(async () => {
        if (!state.name.trim()) {
            localDispatch({ type: 'SET_FIELD', field: 'error', value: 'Group name is required' });
            return;
        }

        const finalMembers = [...state.members];
        const pendingMemberId = state.newMemberId.trim();
        if (pendingMemberId && !finalMembers.includes(pendingMemberId)) {
            finalMembers.push(pendingMemberId);
        }

        const groupData = {
            name: state.name.trim(),
            description: state.description.trim(),
            members: finalMembers.filter(m => m.trim() !== '')
        };

        localDispatch({ type: 'SUBMIT_START' });
        try {
            const response = await groupApi.create(groupData);
            if (response.data) {
                dispatch(addGroup(response.data));
            }
            localDispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to create group';
            localDispatch({ type: 'SUBMIT_ERROR', error: errorMsg });
        }
    }, [state, dispatch, onSuccess]);

    return {
        state,
        setField: (field: keyof GroupFormState, value: any) => localDispatch({ type: 'SET_FIELD', field, value }),
        addMember: () => localDispatch({ type: 'ADD_MEMBER' }),
        removeMember: (memberId: string) => localDispatch({ type: 'REMOVE_MEMBER', memberId }),
        handleCreate
    };
}
