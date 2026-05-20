import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { GenieAnimation } from '@/src/components/GenieAnimation';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { useWorkflows } from '@/src/hooks/useWorkflows';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

export const CreateWorkflowForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
    const { colors } = useAppTheme();
    const { createWorkflow } = useWorkflows();
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PERSONAL' | 'GROUP'>('PERSONAL');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim() || !currentUserId) return;
        setLoading(true);
        try {
            await createWorkflow({
                name,
                description,
                type,
                owner_id: currentUserId,
                created_by: currentUserId,
            });
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GenieAnimation>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                    style={[styles.titleInput, { color: colors.text }]}
                    placeholder="Workflow name"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />
                <TextInput
                    style={[styles.descriptionInput, { color: colors.text }]}
                    placeholder="Description (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.typeBtn,
                            { borderColor: colors.border },
                            type === 'PERSONAL' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                        ]}
                        onPress={() => setType('PERSONAL')}
                    >
                        <Text style={[{ color: colors.text }, type === 'PERSONAL' && { color: colors.primary, fontWeight: '700' }]}>Personal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeBtn,
                            { borderColor: colors.border },
                            type === 'GROUP' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                        ]}
                        onPress={() => setType('GROUP')}
                    >
                        <Text style={[{ color: colors.text }, type === 'GROUP' && { color: colors.primary, fontWeight: '700' }]}>Group</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }, (!name.trim() || loading) && { opacity: 0.5 }]}
                        onPress={handleCreate}
                        disabled={!name.trim() || loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Workflow</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </GenieAnimation>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        margin: SPACING.md,
    },
    titleInput: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    descriptionInput: {
        fontSize: 16,
        minHeight: 60,
        textAlignVertical: 'top',
        marginBottom: SPACING.md,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    typeBtn: {
        flex: 1,
        padding: SPACING.sm,
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    cancelBtn: {
        paddingVertical: SPACING.sm,
    },
    addBtn: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.lg,
    },
});
