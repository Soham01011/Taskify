import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    FlatList,
    Modal
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
    Calendar,
    Flag,
    Bell,
    MoreHorizontal,
    ChevronDown,
    X,
    Plus,
    Trash2,
    Clock,
    Circle
} from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { taskApi } from '../api/tasks';
import { fetchTasks } from '../store/slices/taskSlice';
import { AppDispatch } from '../store';

interface CreateTaskFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, onCancel }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(new Date());
    const [priority, setPriority] = useState<number>(4);
    const [alarmType, setAlarmType] = useState<'push' | 'alarm'>('push');
    const [alarmReminderTime, setAlarmReminderTime] = useState<Date | null>(null);
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [showSubtaskInput, setShowSubtaskInput] = useState(false);

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isReminderPickerVisible, setReminderPickerVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!title.trim()) {
            setError('Task title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const taskData = {
                title: title.trim(),
                description: description.trim(),
                dueDate: dueDate?.toISOString(),
                subtasks: subtasks.map(s => ({ title: s, completed: false })),
                alarm_type: alarmType,
                alarm_reminder_time: alarmReminderTime?.toISOString() || dueDate?.toISOString(),
                created_at: new Date(),
                updated_at: new Date()
            };

            await taskApi.create(taskData);
            dispatch(fetchTasks());
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const addSubtask = () => {
        if (newSubtaskTitle.trim()) {
            setSubtasks([...subtasks, newSubtaskTitle.trim()]);
            setNewSubtaskTitle('');
            setShowSubtaskInput(false);
        }
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const toggleAlarmType = () => {
        setAlarmType(prev => prev === 'push' ? 'alarm' : 'push');
    };

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirmDate = (date: Date) => {
        setDueDate(date);
        hideDatePicker();
    };

    const showReminderPicker = () => setReminderPickerVisibility(true);
    const hideReminderPicker = () => setReminderPickerVisibility(false);

    const handleConfirmReminder = (date: Date) => {
        setAlarmReminderTime(date);
        hideReminderPicker();
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollArea}
                >
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Task name"
                        placeholderTextColor="#A0A0A0"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Description"
                        placeholderTextColor="#C0C0C0"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    {/* Subtasks List */}
                    {subtasks.length > 0 && (
                        <View style={styles.subtaskContainer}>
                            {subtasks.map((st, index) => (
                                <View key={index} style={styles.subtaskItem}>
                                    <Circle size={14} color="#808080" />
                                    <Text style={styles.subtaskText}>{st}</Text>
                                    <TouchableOpacity onPress={() => removeSubtask(index)}>
                                        <X size={14} color="#808080" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {showSubtaskInput ? (
                        <View style={styles.subtaskInputRow}>
                            <TextInput
                                style={styles.subtaskInput}
                                placeholder="Add subtask..."
                                value={newSubtaskTitle}
                                onChangeText={setNewSubtaskTitle}
                                autoFocus
                                onSubmitEditing={addSubtask}
                            />
                            <TouchableOpacity onPress={addSubtask}>
                                <Plus size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addSubtaskBtn}
                            onPress={() => setShowSubtaskInput(true)}
                        >
                            <Plus size={14} color="#808080" />
                            <Text style={styles.addSubtaskText}>Add subtask</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.pill} onPress={showDatePicker}>
                        <Calendar size={14} color="#058527" />
                        <Text style={[styles.pillText, { color: '#058527' }]}>
                            {dueDate ? (dueDate.toDateString() === new Date().toDateString() ? 'Today' : dueDate.toLocaleDateString()) : 'No Date'}
                        </Text>
                        {dueDate && (
                            <TouchableOpacity onPress={() => setDueDate(null)}>
                                <X size={12} color="#058527" style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pill} onPress={toggleAlarmType}>
                        {alarmType === 'push' ? (
                            <Bell size={14} color="#808080" />
                        ) : (
                            <Clock size={14} color="#E67E22" />
                        )}
                        <Text style={[styles.pillText, alarmType === 'alarm' && { color: '#E67E22' }]}>
                            {alarmType === 'push' ? 'Push' : 'Alarm'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pill} onPress={showReminderPicker}>
                        <Bell size={14} color="#808080" />
                        <Text style={styles.pillText}>
                            {alarmReminderTime ? alarmReminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reminders'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                        <MoreHorizontal size={18} color="#808080" />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.projectDropdown}>
                        <View style={styles.inboxIcon}>
                            <View style={styles.trayIcon} />
                        </View>
                        <Text style={styles.projectText}>Inbox</Text>
                        <ChevronDown size={14} color="#505050" />
                    </TouchableOpacity>

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
                                (!title.trim() || loading) && styles.addButtonDisabled
                            ]}
                            onPress={handleCreate}
                            disabled={!title.trim() || loading}
                        >
                            <Text style={styles.addButtonText}>Add task</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
            />

            <DateTimePickerModal
                isVisible={isReminderPickerVisible}
                mode="datetime"
                onConfirm={handleConfirmReminder}
                onCancel={hideReminderPicker}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        width: '100%',
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    scrollArea: {
        maxHeight: 400,
    },
    titleInput: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        paddingVertical: SPACING.xs,
        marginBottom: 4,
    },
    descriptionInput: {
        fontSize: 14,
        color: '#666',
        paddingVertical: 4,
        minHeight: 40,
    },
    subtaskContainer: {
        marginVertical: SPACING.xs,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    subtaskText: {
        fontSize: 13,
        color: '#555',
        flex: 1,
    },
    subtaskInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    subtaskInput: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 2,
    },
    addSubtaskBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: 4,
    },
    addSubtaskText: {
        fontSize: 12,
        color: '#808080',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        gap: SPACING.xs,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'transparent',
    },
    pillText: {
        fontSize: 12,
        marginLeft: 4,
        color: '#505050',
    },
    iconButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginVertical: SPACING.md,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    projectDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inboxIcon: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        borderColor: '#505050',
        borderRadius: 3,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 2,
    },
    trayIcon: {
        width: 8,
        height: 2,
        backgroundColor: '#505050',
        borderRadius: 1,
    },
    projectText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#505050',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#F5F5F5',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#DE8C82',
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        marginTop: SPACING.sm,
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
