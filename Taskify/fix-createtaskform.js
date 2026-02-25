const fs = require('fs');
const content = `import React, { useReducer } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    Calendar,
    Bell,
    MoreHorizontal,
    ChevronDown,
    X,
    Plus,
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
import { GenieAnimation } from './GenieAnimation';

interface CreateTaskFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

interface SubtaskItem {
    id: string;
    title: string;
}

interface TaskFormState {
    title: string;
    description: string;
    dueDate: Date | null;
    alarmType: 'push' | 'alarm';
    alarmReminderTime: Date | null;
    subtasks: SubtaskItem[];
    newSubtaskTitle: string;
    showSubtaskInput: boolean;
    isDatePickerVisible: boolean;
    isReminderPickerVisible: boolean;
    loading: boolean;
    error: string;
    selectedGroupId: string | null;
    assignee: { id: string; username: string } | null;
    showGroupPicker: boolean;
    showAssigneePicker: boolean;
}

type FormAction =
    | { type: 'SET_FIELD'; field: keyof TaskFormState; value: any }
    | { type: 'ADD_SUBTASK' }
    | { type: 'REMOVE_SUBTASK'; id: string }
    | { type: 'TOGGLE_ALARM_TYPE' }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string }
    | { type: 'RESET_PICKERS' };

const initialState: TaskFormState = {
    title: '',
    description: '',
    dueDate: new Date(),
    alarmType: 'push',
    alarmReminderTime: null,
    subtasks: [],
    newSubtaskTitle: '',
    showSubtaskInput: false,
    isDatePickerVisible: false,
    isReminderPickerVisible: false,
    loading: false,
    error: '',
    selectedGroupId: null,
    assignee: null,
    showGroupPicker: false,
    showAssigneePicker: false,
};

function formReducer(state: TaskFormState, action: FormAction): TaskFormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'ADD_SUBTASK': {
            const trimmedTitle = state.newSubtaskTitle.trim();
            if (trimmedTitle) {
                return {
                    ...state,
                    subtasks: [...state.subtasks, { id: Date.now().toString(), title: trimmedTitle }],
                    newSubtaskTitle: '',
                    showSubtaskInput: false
                };
            }
            return { ...state, newSubtaskTitle: '', showSubtaskInput: false };
        }
        case 'REMOVE_SUBTASK':
            return { ...state, subtasks: state.subtasks.filter(s => s.id !== action.id) };
        case 'TOGGLE_ALARM_TYPE':
            return { ...state, alarmType: state.alarmType === 'push' ? 'alarm' : 'push' };
        case 'SUBMIT_START':
            return { ...state, loading: true, error: '' };
        case 'SUBMIT_SUCCESS':
            return { ...state, loading: false };
        case 'SUBMIT_ERROR':
            return { ...state, loading: false, error: action.error };
        case 'RESET_PICKERS':
            return { ...state, showGroupPicker: false, showAssigneePicker: false };
        default:
            return state;
    }
}

const SubtaskSection = ({ state, dispatch, colors, styles }: any) => {
    if (state.selectedGroupId) return null;

    return (
        <>
            {state.subtasks.length > 0 && (
                <View style={styles.subtaskContainer}>
                    {state.subtasks.map((st: SubtaskItem) => (
                        <View key={st.id} style={styles.subtaskItem}>
                            <Circle size={14} color={colors.textSecondary} />
                            <Text style={styles.subtaskText}>{st.title}</Text>
                            <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_SUBTASK', id: st.id })}>
                                <X size={14} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {state.showSubtaskInput ? (
                <View style={styles.subtaskInputRow}>
                    <TextInput
                        style={styles.subtaskInput}
                        placeholder="Add subtask..."
                        value={state.newSubtaskTitle}
                        onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'newSubtaskTitle', value: val })}
                        onSubmitEditing={() => dispatch({ type: 'ADD_SUBTASK' })}
                    />
                    <TouchableOpacity onPress={() => dispatch({ type: 'ADD_SUBTASK' })}>
                        <Plus size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.addSubtaskBtn}
                    onPress={() => dispatch({ type: 'SET_FIELD', field: 'showSubtaskInput', value: true })}
                >
                    <Plus size={14} color={colors.textSecondary} />
                    <Text style={styles.addSubtaskText}>Add subtask</Text>
                </TouchableOpacity>
            )}
        </>
    );
};

const TaskActionsRow = ({ state, dispatch, colors, styles }: any) => (
    <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.pill} onPress={() => dispatch({ type: 'SET_FIELD', field: 'isDatePickerVisible', value: true })}>
            <Calendar size={14} color="#058527" />
            <Text style={[styles.pillText, { color: '#058527' }]}>
                {state.dueDate ? (
                    \`\${state.dueDate.toDateString() === new Date().toDateString() ? 'Today' : state.dueDate.toLocaleDateString()} \${state.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\`
                ) : 'No Date'}
            </Text>
            {state.dueDate && (
                <TouchableOpacity onPress={() => dispatch({ type: 'SET_FIELD', field: 'dueDate', value: null })}>
                    <X size={12} color="#058527" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.pill} onPress={() => dispatch({ type: 'TOGGLE_ALARM_TYPE' })}>
            {state.alarmType === 'push' ? (
                <Bell size={14} color={colors.textSecondary} />
            ) : (
                <Clock size={14} color={colors.primary} />
            )}
            <Text style={[styles.pillText, state.alarmType === 'alarm' && { color: colors.primary }]}>
                {state.alarmType === 'push' ? 'Push' : 'Alarm'}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pill} onPress={() => dispatch({ type: 'SET_FIELD', field: 'isReminderPickerVisible', value: true })}>
            <Bell size={14} color={colors.textSecondary} />
            <Text style={styles.pillText}>
                {state.alarmReminderTime ? state.alarmReminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reminders'}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
            <MoreHorizontal size={18} color={colors.textSecondary} />
        </TouchableOpacity>
    </View>
);

const GroupPickers = ({ state, dispatch, colors, styles, groups, activeGroup }: any) => {
    return (
        <>
            {state.showGroupPicker && (
                <View style={{ backgroundColor: colors.card, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch({ type: 'SET_FIELD', field: 'selectedGroupId', value: null });
                                dispatch({ type: 'SET_FIELD', field: 'assignee', value: null });
                                dispatch({ type: 'SET_FIELD', field: 'showGroupPicker', value: false });
                            }}
                            style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <View style={[styles.inboxIcon, { marginRight: 8 }]}><View style={styles.trayIcon} /></View>
                            <Text style={{ color: colors.text, fontWeight: '600' }}>Inbox (Personal)</Text>
                            {!state.selectedGroupId && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                        {groups.map((g: any) => (
                            <TouchableOpacity
                                key={g._id}
                                onPress={() => {
                                    dispatch({ type: 'SET_FIELD', field: 'selectedGroupId', value: g._id });
                                    dispatch({ type: 'SET_FIELD', field: 'assignee', value: null });
                                    dispatch({ type: 'SET_FIELD', field: 'showGroupPicker', value: false });
                                }}
                                style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 28 }}>{g.name}</Text>
                                {state.selectedGroupId === g._id && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            
            {state.showAssigneePicker && activeGroup && (
                <View style={{ backgroundColor: colors.card, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch({ type: 'SET_FIELD', field: 'assignee', value: null });
                                dispatch({ type: 'SET_FIELD', field: 'showAssigneePicker', value: false });
                            }}
                            style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>None (Unassigned)</Text>
                            {!state.assignee && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                        {activeGroup.members?.map((member: any) => {
                            const username = typeof member === 'string' ? member : (member.username || member._id);
                            const id = typeof member === 'string' ? member : member._id;
                            const displayName = username === id ? \`User \${id.substring(0, 6)}\` : username;

                            return (
                                <TouchableOpacity
                                    key={id}
                                    onPress={() => {
                                        dispatch({ type: 'SET_FIELD', field: 'assignee', value: { id, username: displayName } });
                                        dispatch({ type: 'SET_FIELD', field: 'showAssigneePicker', value: false });
                                    }}
                                    style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>{displayName}</Text>
                                    {state.assignee?.id === id && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </>
    );
};

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const reduxDispatch = useDispatch<AppDispatch>();
    
    const [state, dispatch] = useReducer(formReducer, initialState);
    
    const { groups } = useSelector((rootState: RootState) => rootState.groups);
    const activeGroup = groups.find(g => g._id === state.selectedGroupId);

    const handleCreate = async () => {
        if (!state.title.trim()) {
            dispatch({ type: 'SET_FIELD', field: 'error', value: 'Task title is required' });
            return;
        }

        try {
            dispatch({ type: 'SUBMIT_START' });

            if (state.selectedGroupId) {
                await groupApi.assignTask(state.selectedGroupId, {
                    userId: state.assignee?.id || '',
                    username: state.assignee?.username || '',
                    task: state.title.trim(),
                    duedate: state.dueDate?.toISOString() || new Date().toISOString(),
                    subtasks: state.subtasks.map(s => ({ title: s.title, completed: false }))
                });
                reduxDispatch(fetchGroups('')); // Refresh groups
            } else {
                const taskData = {
                    title: state.title.trim(),
                    description: state.description.trim(),
                    dueDate: state.dueDate?.toISOString(),
                    subtasks: state.subtasks.map(s => ({ title: s.title, completed: false })),
                    alarm_type: state.alarmType,
                    alarm_reminder_time: state.alarmReminderTime?.toISOString() || state.dueDate?.toISOString(),
                    created_at: new Date(),
                    updated_at: new Date()
                };

                await taskApi.create(taskData);
                reduxDispatch(fetchTasks());
            }

            dispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
             dispatch({ 
                type: 'SUBMIT_ERROR', 
                error: err.response?.data?.message || 'Failed to create task' 
            });
        }
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
                            value={state.title}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'title', value: val })}
                        />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Description"
                            placeholderTextColor={colors.placeholder}
                            value={state.description}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'description', value: val })}
                            multiline
                        />

                        <SubtaskSection state={state} dispatch={dispatch} colors={colors} styles={styles} />
                    </ScrollView>

                    <TaskActionsRow state={state} dispatch={dispatch} colors={colors} styles={styles} />

                    <View style={styles.divider} />

                    <View style={styles.bottomBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity 
                                style={styles.projectDropdown} 
                                onPress={() => dispatch({ type: 'SET_FIELD', field: 'showGroupPicker', value: !state.showGroupPicker })}
                            >
                                <View style={styles.inboxIcon}>
                                    <View style={styles.trayIcon} />
                                </View>
                                <Text style={styles.projectText}>{activeGroup ? activeGroup.name : 'Inbox'}</Text>
                                <ChevronDown size={14} color={colors.textSecondary} />
                            </TouchableOpacity>

                            {activeGroup && (
                                <TouchableOpacity 
                                    style={styles.projectDropdown} 
                                    onPress={() => dispatch({ type: 'SET_FIELD', field: 'showAssigneePicker', value: !state.showAssigneePicker })}
                                >
                                    <User size={14} color={colors.primary} />
                                    <Text style={[styles.projectText, { marginLeft: 4 }]}>{state.assignee ? state.assignee.username : 'Assignee'}</Text>
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
                                    (!state.title.trim() || state.loading) && styles.addButtonDisabled
                                ]}
                                onPress={handleCreate}
                                disabled={!state.title.trim() || state.loading}
                            >
                                <Text style={styles.addButtonText}>Add task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <GroupPickers state={state} dispatch={dispatch} colors={colors} styles={styles} groups={groups} activeGroup={activeGroup} />
                </View>
            </GenieAnimation>

            {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}

            <DateTimePickerModal
                isVisible={state.isDatePickerVisible}
                mode="datetime"
                onConfirm={(date) => {
                    dispatch({ type: 'SET_FIELD', field: 'dueDate', value: date });
                    dispatch({ type: 'SET_FIELD', field: 'isDatePickerVisible', value: false });
                }}
                onCancel={() => dispatch({ type: 'SET_FIELD', field: 'isDatePickerVisible', value: false })}
            />

            <DateTimePickerModal
                isVisible={state.isReminderPickerVisible}
                mode="datetime"
                onConfirm={(date) => {
                    dispatch({ type: 'SET_FIELD', field: 'alarmReminderTime', value: date });
                    dispatch({ type: 'SET_FIELD', field: 'isReminderPickerVisible', value: false });
                }}
                onCancel={() => dispatch({ type: 'SET_FIELD', field: 'isReminderPickerVisible', value: false })}
            />
        </View>
    );
};
`
fs.writeFileSync('/home/soham-dalvi/Projects/Taskify/Taskify/src/components/CreateTaskForm.tsx', content);
