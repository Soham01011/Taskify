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
import { useWorkflows } from '@/src/hooks/useWorkflows';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { styles } from "@/assets/styles/create-workflow-form.styles";

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

