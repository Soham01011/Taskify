import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { FileText, Calendar, Plus, Trash2, CheckSquare, Clock } from 'lucide-react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { taskApi } from '../api/tasks';
import { fetchTasks } from '../store/slices/taskSlice';
import { AppDispatch } from '../store';
import { DatePickerModal } from './ui/DatePickerModal';

interface Subtask {
    id: string;
    title: string;
    dueDate?: string;
}

interface CreateTaskFormProps {
    onSuccess: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();

    // Main Task State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mainDate, setMainDate] = useState<Date | null>(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [activePickingId, setActivePickingId] = useState<'main' | string | null>(null);

    // Subtasks State
    const [subtasks, setSubtasks] = useState<Subtask[]>([{ id: Date.now().toString(), title: '' }]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDateSelect = (date: Date) => {
        if (activePickingId === 'main') {
            setMainDate(date);
        } else if (activePickingId) {
            setSubtasks(prev => prev.map(st =>
                st.id === activePickingId ? { ...st, dueDate: date.toISOString() } : st
            ));
        }
        setIsPickerVisible(false);
    };

    const addSubtask = () => {
        setSubtasks(prev => [...prev, {
            id: Date.now().toString(),
            title: '',
            dueDate: mainDate?.toISOString()
        }]);
    };

    const updateSubtaskTitle = (id: string, text: string) => {
        setSubtasks(prev => {
            const updated = prev.map(st => st.id === id ? { ...st, title: text } : st);
            // Auto-add next field if this is the last one and it's being typed into
            const lastSt = updated[updated.length - 1];
            if (lastSt.id === id && text.length > 0) {
                return [...updated, { id: (Date.now() + 1).toString(), title: '', dueDate: mainDate?.toISOString() }];
            }
            return updated;
        });
    };

    const removeSubtask = (id: string) => {
        if (subtasks.length > 1) {
            setSubtasks(prev => prev.filter(st => st.id !== id));
        }
    };

    const handleCreate = async () => {
        if (!title) {
            setError('Title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Filter out empty subtasks
            const validSubtasks = subtasks
                .filter(st => st.title.trim().length > 0)
                .map(st => ({
                    title: st.title,
                    dueDate: st.dueDate || mainDate?.toISOString(),
                    completed: false
                }));

            await taskApi.create({
                title,
                description,
                dueDate: mainDate ? mainDate.toISOString() : undefined,
                subtasks: validSubtasks
            });

            dispatch(fetchTasks());
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return 'Set Date & Time';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.outerContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView
                style={styles.container}
                stickyHeaderIndices={[0]}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Task Section - Sticky */}
                <View style={styles.stickyHeader}>
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

                        <TouchableOpacity
                            style={styles.dateSelector}
                            onPress={() => {
                                setActivePickingId('main');
                                setIsPickerVisible(true);
                            }}
                        >
                            <Calendar size={18} color={COLORS.primary} />
                            <Text style={mainDate ? styles.dateTextActive : styles.dateText}>
                                {formatDate(mainDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Subtasks Section */}
                <View style={styles.subtasksContent}>
                    <Text style={styles.sectionTitle}>Subtasks</Text>
                    {subtasks.map((st, index) => (
                        <View key={st.id} style={styles.subtaskItem}>
                            <View style={styles.subtaskMain}>
                                <CheckSquare size={18} color={COLORS.textSecondary} style={styles.subtaskIcon} />
                                <Input
                                    placeholder={`Subtask ${index + 1}`}
                                    value={st.title}
                                    onChangeText={(text) => updateSubtaskTitle(st.id, text)}
                                    containerStyle={styles.subtaskInput}
                                    style={styles.subtaskInputText}
                                />
                                {subtasks.length > 1 && (
                                    <TouchableOpacity onPress={() => removeSubtask(st.id)} style={styles.removeBtn}>
                                        <Trash2 size={16} color={COLORS.danger} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {st.title.length > 0 && (
                                <TouchableOpacity
                                    style={styles.subtaskDate}
                                    onPress={() => {
                                        setActivePickingId(st.id);
                                        setIsPickerVisible(true);
                                    }}
                                >
                                    <Clock size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.subtaskDateText}>
                                        {formatDate(st.dueDate || mainDate)}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button
                    title="Create Task"
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.submitBtn}
                />
            </View>

            <DatePickerModal
                visible={isPickerVisible}
                onClose={() => setIsPickerVisible(false)}
                onSelect={handleDateSelect}
                initialDate={activePickingId === 'main' ? (mainDate || new Date()) :
                    new Date((subtasks.find(s => s.id === activePickingId)?.dueDate) || mainDate || Date.now())}
                title={activePickingId === 'main' ? 'Main Task Deadline' : 'Subtask Deadline'}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        height: '100%',
    },
    container: {
        flex: 1,
    },
    stickyHeader: {
        backgroundColor: COLORS.white,
        paddingBottom: SPACING.sm,
    },
    subtasksContent: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    section: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginTop: SPACING.sm,
    },
    textArea: {
        height: 80,
        alignItems: 'flex-start',
        paddingTop: SPACING.sm,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    dateText: {
        marginLeft: SPACING.sm,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    dateTextActive: {
        marginLeft: SPACING.sm,
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    subtaskItem: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    subtaskMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtaskIcon: {
        marginRight: SPACING.xs,
    },
    subtaskInput: {
        flex: 1,
        borderBottomWidth: 0,
        backgroundColor: 'transparent',
    },
    subtaskInputText: {
        fontSize: 14,
    },
    removeBtn: {
        padding: SPACING.xs,
    },
    subtaskDate: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 30,
        marginTop: -5,
        paddingBottom: 5,
    },
    subtaskDateText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    footer: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: SPACING.sm,
        fontSize: 12,
    },
    submitBtn: {
        height: 50,
    },
});
