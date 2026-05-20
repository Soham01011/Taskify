import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    ScrollView,
} from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { GenieAnimation } from '@/src/components/GenieAnimation';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { workflowsApi } from '@/src/api/workflows';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { taskApi, Task } from '@/src/api/tasks';
import { ideaApi, Idea } from '@/src/api/ideas';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export const CreateNodeModal = ({
    workflowId,
    onSuccess,
    onCancel,
    initialNode, // if provided, we are editing
}: {
    workflowId: string;
    onSuccess: () => void;
    onCancel: () => void;
    initialNode?: any;
}) => {
    const { colors } = useAppTheme();
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    
    const isEditing = !!initialNode;
    
    const [sourceType, setSourceType] = useState<'TASK' | 'IDEA'>(initialNode?.source_type || 'TASK');
    const [isExisting, setIsExisting] = useState(isEditing ? !!initialNode.source_id : false);
    
    const [title, setTitle] = useState(isEditing ? (initialNode.source_data?.title || '') : '');
    const [description, setDescription] = useState(isEditing ? (initialNode.source_data?.description || '') : '');
    const [dueDate, setDueDate] = useState<Date | null>(isEditing && initialNode.due_date ? new Date(initialNode.due_date) : null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    
    const [existingTasks, setExistingTasks] = useState<{_id: string, title: string}[]>([]);
    const [existingIdeas, setExistingIdeas] = useState<{_id: string, title: string}[]>([]);
    const [selectedExistingId, setSelectedExistingId] = useState<string | null>(initialNode?.source_id || null);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        if (isExisting && !isEditing) {
            setFetchingData(true);
            if (sourceType === 'TASK') {
                taskApi.getAll().then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data as any).tasks || [];
                    const flattened: any[] = [];
                    data.forEach((t: Task) => {
                        if (!t.completed) {
                            flattened.push({ _id: t._id, title: t.title });
                            if (t.subtasks && t.subtasks.length > 0) {
                                t.subtasks.forEach((st: any) => {
                                    if (!st.completed) {
                                        flattened.push({ _id: st._id || `${t._id}-${st.title}`, title: `↳ ${st.title} (Subtask of ${t.title})` });
                                    }
                                });
                            }
                        }
                    });
                    setExistingTasks(flattened);
                    setFetchingData(false);
                }).catch(() => setFetchingData(false));
            } else {
                ideaApi.getAll().then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data as any).ideas || [];
                    const flattened: any[] = [];
                    data.forEach((i: Idea) => {
                        flattened.push({ _id: i._id, title: i.title });
                        if (i.thread && i.thread.length > 0) {
                            i.thread.forEach((th: any, idx: number) => {
                                flattened.push({ _id: th._id || `${i._id}-th-${idx}`, title: `↳ Thread: ${th.content.substring(0, 20)}...` });
                            });
                        }
                    });
                    setExistingIdeas(flattened);
                    setFetchingData(false);
                }).catch(() => setFetchingData(false));
            }
        }
    }, [isExisting, sourceType]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const selectedTitle = sourceType === 'TASK' 
                ? existingTasks.find(t => t._id === selectedExistingId)?.title
                : existingIdeas.find(i => i._id === selectedExistingId)?.title;

            const nodeData = {
                source_type: sourceType,
                source_id: (isExisting ? selectedExistingId : undefined) as string | undefined,
                source_data: isExisting && selectedTitle ? { title: selectedTitle } : undefined,
                [sourceType === 'TASK' ? 'new_task_data' : 'new_idea_data']: isExisting ? undefined : {
                    title: title || `New ${sourceType === 'TASK' ? 'Task' : 'Idea'}`,
                    description,
                    userId: currentUserId,
                },
                due_date: dueDate ? dueDate.toISOString() : undefined,
                completion_rule: 'ALL' as const
            };

            if (isEditing) {
                await workflowsApi.updateNode(workflowId, initialNode._id, nodeData);
            } else {
                await workflowsApi.createNode(workflowId, {
                    ...nodeData,
                    position_x: Math.random() * 300,
                    position_y: Math.random() * 300,
                });
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;
        setLoading(true);
        try {
            await workflowsApi.deleteNode(workflowId, initialNode._id);
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
                <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit Node' : 'Add New Node'}</Text>
                
                <ScrollView style={{ maxHeight: 400 }}>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeBtn,
                                { borderColor: colors.border },
                                sourceType === 'TASK' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                            ]}
                            onPress={() => setSourceType('TASK')}
                        >
                            <Text style={[{ color: colors.text }, sourceType === 'TASK' && { color: colors.primary, fontWeight: '700' }]}>Task</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeBtn,
                                { borderColor: colors.border },
                                sourceType === 'IDEA' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                            ]}
                            onPress={() => setSourceType('IDEA')}
                        >
                            <Text style={[{ color: colors.text }, sourceType === 'IDEA' && { color: colors.primary, fontWeight: '700' }]}>Idea</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeBtn,
                                { borderColor: colors.border },
                                !isExisting && { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }
                            ]}
                            onPress={() => setIsExisting(false)}
                        >
                            <Text style={[{ color: colors.text }, !isExisting && { color: colors.secondary, fontWeight: '700' }]}>Create New</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeBtn,
                                { borderColor: colors.border },
                                isExisting && { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }
                            ]}
                            onPress={() => setIsExisting(true)}
                        >
                            <Text style={[{ color: colors.text }, isExisting && { color: colors.secondary, fontWeight: '700' }]}>Select Existing</Text>
                        </TouchableOpacity>
                    </View>

                    {!isExisting ? (
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter title..."
                                placeholderTextColor={colors.textSecondary}
                            />
                            
                            <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.md }]}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, height: 60, textAlignVertical: 'top' }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Enter description..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                            />
                        </View>
                    ) : (
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Select {sourceType}</Text>
                            {fetchingData ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                sourceType === 'TASK' ? (
                                    existingTasks.map(t => (
                                        <TouchableOpacity
                                            key={t._id}
                                            style={[styles.itemBtn, { borderColor: colors.border }, selectedExistingId === t._id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                            onPress={() => setSelectedExistingId(t._id)}
                                        >
                                            <Text style={{ color: colors.text }} numberOfLines={1}>{t.title}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    existingIdeas.map(i => (
                                        <TouchableOpacity
                                            key={i._id}
                                            style={[styles.itemBtn, { borderColor: colors.border }, selectedExistingId === i._id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                            onPress={() => setSelectedExistingId(i._id)}
                                        >
                                            <Text style={{ color: colors.text }} numberOfLines={1}>{i.title}</Text>
                                        </TouchableOpacity>
                                    ))
                                )
                            )}
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date</Text>
                        <TouchableOpacity style={[styles.dateBtn, { borderColor: colors.border }]} onPress={() => setDatePickerVisible(true)}>
                            <Text style={{ color: dueDate ? colors.text : colors.textSecondary }}>
                                {dueDate ? dueDate.toLocaleString() : 'Select Due Date (Optional)'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <View style={styles.actions}>
                    {isEditing && (
                        <TouchableOpacity style={[styles.cancelBtn, { marginRight: 'auto' }]} onPress={handleDelete}>
                            <Text style={{ color: colors.danger || '#EF4444' }}>Delete Node</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.5 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isEditing ? 'Save' : 'Add Node'}</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={(date) => {
                    setDueDate(date);
                    setDatePickerVisible(false);
                }}
                onCancel={() => setDatePickerVisible(false)}
            />
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    typeBtn: {
        flex: 1,
        padding: SPACING.sm,
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    formGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 14,
        marginBottom: SPACING.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
    },
    itemBtn: {
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.xs,
    },
    dateBtn: {
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.lg,
        marginTop: SPACING.md,
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
