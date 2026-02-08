import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { FileText, Calendar, Plus, Trash2 } from 'lucide-react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { taskApi } from '../api/tasks';
import { fetchTasks } from '../store/slices/taskSlice';
import { AppDispatch } from '../store';

interface CreateTaskFormProps {
    onSuccess: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!title) {
            setError('Title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await taskApi.create({
                title,
                description,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            });
            dispatch(fetchTasks());
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.label}>Task Title *</Text>
                <Input
                    placeholder="What needs to be done?"
                    value={title}
                    onChangeText={setTitle}
                    icon={<FileText size={18} color={COLORS.textSecondary} />}
                />

                <Text style={styles.label}>Description</Text>
                <Input
                    placeholder="Add details..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    style={styles.textArea}
                />

                <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                <Input
                    placeholder="2026-12-31"
                    value={dueDate}
                    onChangeText={setDueDate}
                    icon={<Calendar size={18} color={COLORS.textSecondary} />}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
                title="Create Task"
                onPress={handleCreate}
                loading={loading}
                style={styles.submitBtn}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
    },
    section: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    textArea: {
        height: 100,
        alignItems: 'flex-start',
        paddingTop: SPACING.sm,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    submitBtn: {
        marginVertical: SPACING.md,
    },
});
