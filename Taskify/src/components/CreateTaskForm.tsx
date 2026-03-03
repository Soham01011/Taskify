import React, { useReducer } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    ChevronDown,
    User,
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

// Subcomponents
import { TaskBasicInputs } from './TaskBasicInputs';
import { TaskSubtasks } from './TaskSubtasks';
import { TaskActionPills } from './TaskActionPills';
import { TaskPickers } from './TaskPickers';
import { RecurrencePicker, RecurrenceFrequency } from './RecurrencePicker';

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
    isTimePickerVisible: boolean;
    loading: boolean;
    error: string;
    selectedGroupId: string | null;
    assignee: { id: string; username: string } | null;
    showGroupPicker: boolean;
    showAssigneePicker: boolean;
    showRecurrencePicker: boolean;

    // Recurrence state
    frequency: RecurrenceFrequency;
    daysOfWeek: number[];
    dayOfMonth: number | null;
    lastWeekend: boolean;
    timeOfDay: Date | null;
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
    isTimePickerVisible: false,
    loading: false,
    error: '',
    selectedGroupId: null,
    assignee: null,
    showGroupPicker: false,
    showAssigneePicker: false,
    showRecurrencePicker: false,

    // Recurrence initial state
    frequency: 'none',
    daysOfWeek: [],
    dayOfMonth: null,
    lastWeekend: false,
    timeOfDay: null,
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
            return {
                ...state,
                showGroupPicker: false,
                showAssigneePicker: false,
                showRecurrencePicker: false,
                isDatePickerVisible: false,
                isReminderPickerVisible: false,
                isTimePickerVisible: false
            };
        default:
            return state;
    }
}

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

        const taskTitle = state.title.trim();
        const taskDescription = state.description.trim();
        const hasRecurrence = state.frequency !== 'none';

        // Calculate a unified UTC date/time. 
        let effectiveDate = state.dueDate ? new Date(state.dueDate) : new Date();

        if (hasRecurrence && state.timeOfDay) {
            effectiveDate.setHours(state.timeOfDay.getHours());
            effectiveDate.setMinutes(state.timeOfDay.getMinutes());
            effectiveDate.setSeconds(0);
            effectiveDate.setMilliseconds(0);
        }

        const dueDateIso = effectiveDate.toISOString();
        const alarmReminderTimeIso = state.alarmReminderTime ? state.alarmReminderTime.toISOString() : dueDateIso;
        const duedateFallback = dueDateIso; // Always use the calculated UTC date

        const assigneeId = (state.assignee && state.assignee.id) ? state.assignee.id : '';
        const assigneeUsername = (state.assignee && state.assignee.username) ? state.assignee.username : '';

        const subtasksFormatted = state.subtasks.map((s: any) => ({ title: s.title, completed: false }));

        const recurrenceData = hasRecurrence ? {
            frequency: state.frequency,
            daysOfWeek: state.daysOfWeek,
            dayOfMonth: state.dayOfMonth ?? undefined,
            lastWeekend: state.lastWeekend,
            // Send the UTC HH:mm string to ensure the backend schedules correctly
            timeOfDay: `${String(effectiveDate.getUTCHours()).padStart(2, '0')}:${String(effectiveDate.getUTCMinutes()).padStart(2, '0')}`
        } : undefined;

        try {
            dispatch({ type: 'SUBMIT_START' });

            if (state.selectedGroupId) {
                await groupApi.assignTask(state.selectedGroupId, {
                    userId: assigneeId,
                    username: assigneeUsername,
                    task: taskTitle,
                    duedate: duedateFallback as string, // Cast as it expects string but we allow undefined in payload
                    subtasks: subtasksFormatted,
                    recurrence: recurrenceData
                });
                reduxDispatch(fetchGroups('')); // Refresh groups
            } else {
                const taskData = {
                    title: taskTitle,
                    description: taskDescription,
                    dueDate: dueDateIso,
                    subtasks: subtasksFormatted,
                    alarm_type: state.alarmType,
                    alarm_reminder_time: alarmReminderTimeIso,
                    recurrence: recurrenceData,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                await taskApi.create(taskData);
                reduxDispatch(fetchTasks());
            }

            dispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
            let errorMsg = 'Failed to create task';
            if (err && err.response && err.response.data && err.response.data.message) {
                errorMsg = err.response.data.message;
            }
            dispatch({
                type: 'SUBMIT_ERROR',
                error: errorMsg
            });
        }
    };

    return (
        <View style={styles.container}>
            <GenieAnimation>
                <View style={[styles.card, state.showRecurrencePicker && { maxHeight: 600 }]}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollArea}
                    >
                        <TaskBasicInputs
                            colors={colors}
                            styles={styles}
                            title={state.title}
                            setTitle={(val) => dispatch({ type: 'SET_FIELD', field: 'title', value: val })}
                            description={state.description}
                            setDescription={(val) => dispatch({ type: 'SET_FIELD', field: 'description', value: val })}
                        />

                        {state.showRecurrencePicker && (
                            <RecurrencePicker
                                colors={colors}
                                frequency={state.frequency}
                                setFrequency={(val) => dispatch({ type: 'SET_FIELD', field: 'frequency', value: val })}
                                daysOfWeek={state.daysOfWeek}
                                setDaysOfWeek={(val) => dispatch({ type: 'SET_FIELD', field: 'daysOfWeek', value: val })}
                                dayOfMonth={state.dayOfMonth}
                                setDayOfMonth={(val) => dispatch({ type: 'SET_FIELD', field: 'dayOfMonth', value: val })}
                                lastWeekend={state.lastWeekend}
                                setLastWeekend={(val) => dispatch({ type: 'SET_FIELD', field: 'lastWeekend', value: val })}
                                timeOfDay={state.timeOfDay}
                                setTimeOfDay={() => { }} // Not used currently, but kept for interface consistency
                                showTimePicker={() => dispatch({ type: 'SET_FIELD', field: 'isTimePickerVisible', value: true })}
                            />
                        )}

                        <TaskSubtasks
                            colors={colors}
                            styles={styles}
                            selectedGroupId={state.selectedGroupId}
                            subtasks={state.subtasks}
                            newSubtaskTitle={state.newSubtaskTitle}
                            setNewSubtaskTitle={(val) => dispatch({ type: 'SET_FIELD', field: 'newSubtaskTitle', value: val })}
                            showSubtaskInput={state.showSubtaskInput}
                            setShowSubtaskInput={(val) => dispatch({ type: 'SET_FIELD', field: 'showSubtaskInput', value: val })}
                            addSubtask={() => dispatch({ type: 'ADD_SUBTASK' })}
                            removeSubtask={(id) => dispatch({ type: 'REMOVE_SUBTASK', id })}
                        />
                    </ScrollView>

                    <TaskActionPills
                        colors={colors}
                        styles={styles}
                        dueDate={state.dueDate}
                        setDueDate={(val) => dispatch({ type: 'SET_FIELD', field: 'dueDate', value: val })}
                        alarmType={state.alarmType}
                        toggleAlarmType={() => dispatch({ type: 'TOGGLE_ALARM_TYPE' })}
                        alarmReminderTime={state.alarmReminderTime}
                        showDatePicker={() => dispatch({ type: 'SET_FIELD', field: 'isDatePickerVisible', value: true })}
                        showReminderPicker={() => dispatch({ type: 'SET_FIELD', field: 'isReminderPickerVisible', value: true })}
                        recurrence={state.frequency}
                        onRecurrencePress={() => dispatch({ type: 'SET_FIELD', field: 'showRecurrencePicker', value: !state.showRecurrencePicker })}
                    />

                    <View style={styles.divider} />

                    <View style={styles.bottomBar}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
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
                                    (!state.title.trim() || state.loading) && styles.addButtonDisabled
                                ]}
                                onPress={handleCreate}
                                disabled={!state.title.trim() || state.loading}
                            >
                                <Text style={styles.addButtonText}>Add task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TaskPickers
                        colors={colors}
                        styles={styles}
                        groups={groups}
                        activeGroup={activeGroup}
                        selectedGroupId={state.selectedGroupId}
                        setSelectedGroupId={(val) => dispatch({ type: 'SET_FIELD', field: 'selectedGroupId', value: val })}
                        assignee={state.assignee}
                        setAssignee={(val) => dispatch({ type: 'SET_FIELD', field: 'assignee', value: val })}
                        showGroupPicker={state.showGroupPicker}
                        setShowGroupPicker={(val) => dispatch({ type: 'SET_FIELD', field: 'showGroupPicker', value: val })}
                        showAssigneePicker={state.showAssigneePicker}
                        setShowAssigneePicker={(val) => dispatch({ type: 'SET_FIELD', field: 'showAssigneePicker', value: val })}
                    />
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

            <DateTimePickerModal
                isVisible={state.isTimePickerVisible}
                mode="time"
                onConfirm={(date) => {
                    dispatch({ type: 'SET_FIELD', field: 'timeOfDay', value: date });
                    dispatch({ type: 'SET_FIELD', field: 'isTimePickerVisible', value: false });
                }}
                onCancel={() => dispatch({ type: 'SET_FIELD', field: 'isTimePickerVisible', value: false })}
            />
        </View>
    );
};
