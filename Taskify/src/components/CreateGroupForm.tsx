import React, { useState } from 'react';
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
import { fetchGroups } from '../store/slices/groupSlice';
import { AppDispatch, RootState } from '../store';
import { getStyles } from '@/assets/styles/CreateTaskForm.styles';

interface CreateGroupFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [members, setMembers] = useState<string[]>([]);
    const [newMemberId, setNewMemberId] = useState('');
    const [showMemberInput, setShowMemberInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Group name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const groupData = {
                name: name.trim(),
                description: description.trim(),
                members: members.filter(m => m.trim() !== '')
            };

            await groupApi.create(groupData);
            if (currentUserId) {
                dispatch(fetchGroups(currentUserId));
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const addMember = () => {
        if (newMemberId.trim()) {
            setMembers([...members, newMemberId.trim()]);
            setNewMemberId('');
            setShowMemberInput(false);
        }
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
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
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Description"
                            placeholderTextColor={colors.placeholder}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        {members.length > 0 && (
                            <View style={styles.subtaskContainer}>
                                {members.map((m, index) => (
                                    <View key={index} style={styles.subtaskItem}>
                                        <Users size={14} color={colors.textSecondary} />
                                        <Text style={styles.subtaskText}>{m}</Text>
                                        <TouchableOpacity onPress={() => removeMember(index)}>
                                            <X size={14} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {showMemberInput ? (
                            <View style={styles.subtaskInputRow}>
                                <TextInput
                                    style={styles.subtaskInput}
                                    placeholder="Add member (User ID)..."
                                    value={newMemberId}
                                    onChangeText={setNewMemberId}
                                    onSubmitEditing={addMember}
                                />
                                <TouchableOpacity onPress={addMember}>
                                    <Plus size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addSubtaskBtn}
                                onPress={() => setShowMemberInput(true)}
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
                                    (!name.trim() || loading) && styles.addButtonDisabled
                                ]}
                                onPress={handleCreate}
                                disabled={!name.trim() || loading}
                            >
                                <Text style={styles.addButtonText}>Create Group</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </GenieAnimation>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};
