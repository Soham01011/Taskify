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
    FlatList
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
    Calendar,
    Bell,
    MoreHorizontal,
    ChevronDown,
    X,
    Plus,
    Trash2,
    Clock,
    Circle,
    User,
    Check
} from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getStyles } from '@/assets/styles/CreateTaskForm.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { taskApi } from '../api/tasks';
import { groupApi } from '../api/groups';
import { fetchTasks } from '../store/slices/taskSlice';
import { fetchGroups } from '../store/slices/groupSlice';
import { AppDispatch, RootState } from '../store';
import { useSelector } from 'react-redux';
import { GenieAnimation } from './GenieAnimation';

interface CreateTaskFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(new Date());
    const [alarmType, setAlarmType] = useState<'push' | 'alarm'>('push');
    const [alarmReminderTime, setAlarmReminderTime] = useState<Date | null>(null);
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [showSubtaskInput, setShowSubtaskInput] = useState(false);

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isReminderPickerVisible, setReminderPickerVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { groups } = useSelector((state: RootState) => state.groups);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [assignee, setAssignee] = useState<{ id: string, username: string } | null>(null);

    // simple inline modal replacement for pickers
    const [showGroupPicker, setShowGroupPicker] = useState(false);
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);

    const activeGroup = groups.find(g => g._id === selectedGroupId);

    const handleCreate = async () => {
        if (!title.trim()) {
            setError('Task title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (selectedGroupId) {
                await groupApi.assignTask(selectedGroupId, {
                    userId: assignee?.id || '',
                    username: assignee?.username || '',
                    task: title.trim(),
                    duedate: dueDate?.toISOString() || new Date().toISOString()
                });
                dispatch(fetchGroups('')); // Refresh groups
            } else {
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
            }

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
            <GenieAnimation>
                <View style={styles.card}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollArea}
                    >
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Task name"
                            placeholderTextColor={colors.placeholder}
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Description"
                            placeholderTextColor={colors.placeholder}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        {/* Subtasks List */}
                        {subtasks.length > 0 && (
                            <View style={styles.subtaskContainer}>
                                {subtasks.map((st, index) => (
                                    <View key={index} style={styles.subtaskItem}>
                                        <Circle size={14} color={colors.textSecondary} />
                                        <Text style={styles.subtaskText}>{st}</Text>
                                        <TouchableOpacity onPress={() => removeSubtask(index)}>
                                            <X size={14} color={colors.textSecondary} />
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
                                    <Plus size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addSubtaskBtn}
                                onPress={() => setShowSubtaskInput(true)}
                            >
                                <Plus size={14} color={colors.textSecondary} />
                                <Text style={styles.addSubtaskText}>Add subtask</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.pill} onPress={showDatePicker}>
                            <Calendar size={14} color="#058527" />
                            <Text style={[styles.pillText, { color: '#058527' }]}>
                                {dueDate ? (
                                    `${dueDate.toDateString() === new Date().toDateString() ? 'Today' : dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                ) : 'No Date'}
                            </Text>
                            {dueDate && (
                                <TouchableOpacity onPress={() => setDueDate(null)}>
                                    <X size={12} color="#058527" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pill} onPress={toggleAlarmType}>
                            {alarmType === 'push' ? (
                                <Bell size={14} color={colors.textSecondary} />
                            ) : (
                                <Clock size={14} color={colors.primary} />
                            )}
                            <Text style={[styles.pillText, alarmType === 'alarm' && { color: colors.primary }]}>
                                {alarmType === 'push' ? 'Push' : 'Alarm'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pill} onPress={showReminderPicker}>
                            <Bell size={14} color={colors.textSecondary} />
                            <Text style={styles.pillText}>
                                {alarmReminderTime ? alarmReminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reminders'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton}>
                            <MoreHorizontal size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.bottomBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity style={styles.projectDropdown} onPress={() => setShowGroupPicker(!showGroupPicker)}>
                                <View style={styles.inboxIcon}>
                                    <View style={styles.trayIcon} />
                                </View>
                                <Text style={styles.projectText}>{activeGroup ? activeGroup.name : 'Inbox'}</Text>
                                <ChevronDown size={14} color={colors.textSecondary} />
                            </TouchableOpacity>

                            {activeGroup && (
                                <TouchableOpacity style={styles.projectDropdown} onPress={() => setShowAssigneePicker(!showAssigneePicker)}>
                                    <User size={14} color={colors.primary} />
                                    <Text style={[styles.projectText, { marginLeft: 4 }]}>{assignee ? assignee.username : 'Assignee'}</Text>
                                    <ChevronDown size={14} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </ScrollView>

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

                    {showGroupPicker && (
                        <View style={{ backgroundColor: colors.card, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                            <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                <TouchableOpacity
                                    onPress={() => { setSelectedGroupId(null); setAssignee(null); setShowGroupPicker(false); }}
                                    style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <View style={[styles.inboxIcon, { marginRight: 8 }]}><View style={styles.trayIcon} /></View>
                                    <Text style={{ color: colors.text, fontWeight: '600' }}>Inbox (Personal)</Text>
                                    {!selectedGroupId && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                                </TouchableOpacity>
                                {groups.map(g => (
                                    <TouchableOpacity
                                        key={g._id}
                                        onPress={() => { setSelectedGroupId(g._id); setAssignee(null); setShowGroupPicker(false); }}
                                        style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                        <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 28 }}>{g.name}</Text>
                                        {selectedGroupId === g._id && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {showAssigneePicker && activeGroup && (
                        <View style={{ backgroundColor: colors.card, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                            <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                <TouchableOpacity
                                    onPress={() => { setAssignee(null); setShowAssigneePicker(false); }}
                                    style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>None (Unassigned)</Text>
                                    {!assignee && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                                </TouchableOpacity>
                                {activeGroup.members?.map((member: any) => {
                                    const username = typeof member === 'string' ? member : (member.username || member._id);
                                    const id = typeof member === 'string' ? member : member._id;
                                    // if username is just the id because populated docs failed, we show abbreviated id or username if different
                                    const displayName = username === id ? `User ${id.substring(0, 6)}` : username;

                                    return (
                                        <TouchableOpacity
                                            key={id}
                                            onPress={() => { setAssignee({ id, username: displayName }); setShowAssigneePicker(false); }}
                                            style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                            <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>{displayName}</Text>
                                            {assignee?.id === id && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </GenieAnimation>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
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

