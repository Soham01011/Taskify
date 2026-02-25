import React, { useReducer } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Users, Shield } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { GenieAnimation } from './GenieAnimation';
import { groupApi } from '../api/groups';
import { addGroup } from '../store/slices/groupSlice';
import { AppDispatch, RootState } from '../store';
import { getStyles } from '@/assets/styles/CreateTaskForm.styles';

interface CreateGroupFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

interface FormState {
    name: string;
    description: string;
    members: string[];
    newMemberId: string;
    showMemberInput: boolean;
    loading: boolean;
    error: string;
}

type FormAction =
    | { type: 'SET_FIELD'; field: keyof FormState; value: any }
    | { type: 'ADD_MEMBER' }
    | { type: 'REMOVE_MEMBER'; memberId: string }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string };

const initialState: FormState = {
    name: '',
    description: '',
    members: [],
    newMemberId: '',
    showMemberInput: false,
    loading: false,
    error: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
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
            return {
                ...state,
                members: state.members.filter(m => m !== action.memberId)
            };
        case 'SUBMIT_START':
            return { ...state, loading: true, error: '' };
        case 'SUBMIT_SUCCESS':
            return { ...state, loading: false };
        case 'SUBMIT_ERROR':
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const reduxDispatch = useDispatch<AppDispatch>();
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const [state, dispatch] = useReducer(formReducer, initialState);

    const handleCreate = async () => {
        if (!state.name.trim()) {
            dispatch({ type: 'SET_FIELD', field: 'error', value: 'Group name is required' });
            return;
        }

        try {
            dispatch({ type: 'SUBMIT_START' });

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

            const response = await groupApi.create(groupData);
            console.log("actual group data:", JSON.stringify(groupData, null, 2), "Create group response:", JSON.stringify(response.data, null, 2));

            if (response.data) {
                reduxDispatch(addGroup(response.data));
            }

            dispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
            dispatch({
                type: 'SUBMIT_ERROR',
                error: err.response?.data?.message || 'Failed to create group'
            });
        }
    };

    const addMember = () => {
        dispatch({ type: 'ADD_MEMBER' });
    };

    const removeMember = (memberId: string) => {
        dispatch({ type: 'REMOVE_MEMBER', memberId });
    };

    return (
        <View style={styles.container}>
            <GenieAnimation>
                <View style={styles.card}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollArea}
                    >
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Group Name"
                            placeholderTextColor={colors.placeholder}
                            value={state.name}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'name', value: val })}
                        />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Description"
                            placeholderTextColor={colors.placeholder}
                            value={state.description}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'description', value: val })}
                            multiline
                        />

                        {state.members.length > 0 && (
                            <View style={styles.subtaskContainer}>
                                {state.members.map((m) => (
                                    <View key={m} style={styles.subtaskItem}>
                                        <Users size={14} color={colors.textSecondary} />
                                        <Text style={styles.subtaskText}>{m}</Text>
                                        <TouchableOpacity onPress={() => removeMember(m)}>
                                            <X size={14} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {state.showMemberInput ? (
                            <View style={styles.subtaskInputRow}>
                                <TextInput
                                    style={styles.subtaskInput}
                                    placeholder="Add member (User ID)..."
                                    value={state.newMemberId}
                                    onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'newMemberId', value: val })}
                                    onSubmitEditing={addMember}
                                />
                                <TouchableOpacity onPress={addMember}>
                                    <Plus size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addSubtaskBtn}
                                onPress={() => dispatch({ type: 'SET_FIELD', field: 'showMemberInput', value: true })}
                            >
                                <Plus size={14} color={colors.textSecondary} />
                                <Text style={styles.addSubtaskText}>Add member by User ID</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <View style={styles.divider} />

                    <View style={styles.bottomBar}>
                        <View style={styles.projectDropdown}>
                            <Shield size={14} color={colors.primary} />
                            <Text style={styles.projectText}>Group Creator</Text>
                        </View>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel || onSuccess}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    (!state.name.trim() || state.loading) && styles.addButtonDisabled
                                ]}
                                onPress={handleCreate}
                                disabled={!state.name.trim() || state.loading}
                            >
                                <Text style={styles.addButtonText}>Create Group</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </GenieAnimation>

            {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}
        </View>
    );
};
