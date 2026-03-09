import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { X, Plus, Users, Shield } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { GenieAnimation } from '../GenieAnimation';
import { getStyles } from '@/assets/styles/CreateTaskForm.styles';
import { useCreateGroup } from '@/src/hooks/useCreateGroup';

interface CreateGroupFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const { state, setField, addMember, removeMember, handleCreate } = useCreateGroup(onSuccess);

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
                            onChangeText={(val) => setField('name', val)}
                        />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Description"
                            placeholderTextColor={colors.placeholder}
                            value={state.description}
                            onChangeText={(val) => setField('description', val)}
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
                                    onChangeText={(val) => setField('newMemberId', val)}
                                    onSubmitEditing={addMember}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={addMember}>
                                    <Plus size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addSubtaskBtn}
                                onPress={() => setField('showMemberInput', true)}
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
