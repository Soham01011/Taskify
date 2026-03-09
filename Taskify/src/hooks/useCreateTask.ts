import { useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { taskApi } from '../api/tasks';
import { groupApi } from '../api/groups';
import { fetchTasks } from '../store/slices/taskSlice';
import { fetchGroups } from '../store/slices/groupSlice';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'six-months' | 'annually';

export interface SubtaskItem {
    id: string;
    title: string;
}

export interface TaskFormState {
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
    frequency: 'none',
    daysOfWeek: [],
    dayOfMonth: null,
    lastWeekend: false,
    timeOfDay: null,
};

function formReducer(state: TaskFormState, action: FormAction): TaskFormState {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
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
            return { ...initialState, loading: false };
        case 'SUBMIT_ERROR':
            return { ...state, loading: false, error: action.error };
        default: return state;
    }
}

export function useCreateTask(onSuccess: () => void) {
    const dispatch = useDispatch<AppDispatch>();
    const [state, localDispatch] = useReducer(formReducer, initialState);
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const handleCreate = useCallback(async () => {
        if (!state.title.trim()) {
            localDispatch({ type: 'SET_FIELD', field: 'error', value: 'Task title is required' });
            return;
        }

        const hasRecurrence = state.frequency !== 'none';
        let effectiveDate = state.dueDate ? new Date(state.dueDate) : new Date();

        if (hasRecurrence && state.timeOfDay) {
            effectiveDate.setHours(state.timeOfDay.getHours());
            effectiveDate.setMinutes(state.timeOfDay.getMinutes());
            effectiveDate.setSeconds(0);
            effectiveDate.setMilliseconds(0);
        }

        const recurrenceData = hasRecurrence ? {
            frequency: state.frequency,
            daysOfWeek: state.daysOfWeek,
            dayOfMonth: state.dayOfMonth ?? undefined,
            lastWeekend: state.lastWeekend,
            timeOfDay: `${String(effectiveDate.getUTCHours()).padStart(2, '0')}:${String(effectiveDate.getUTCMinutes()).padStart(2, '0')}`
        } : undefined;

        localDispatch({ type: 'SUBMIT_START' });
        try {
            if (state.selectedGroupId) {
                await groupApi.assignTask(state.selectedGroupId, {
                    userId: state.assignee?.id || '',
                    username: state.assignee?.username || '',
                    task: state.title.trim(),
                    duedate: effectiveDate.toISOString(),
                    subtasks: state.subtasks.map(s => ({ title: s.title, completed: false })),
                    recurrence: recurrenceData
                });
                if (currentUserId) {
                    dispatch(fetchGroups({ userId: currentUserId }));
                }
            } else {
                await taskApi.create({
                    title: state.title.trim(),
                    description: state.description.trim(),
                    dueDate: effectiveDate.toISOString(),
                    subtasks: state.subtasks.map(s => ({ title: s.title, completed: false })),
                    alarm_type: state.alarmType,
                    alarm_reminder_time: state.alarmReminderTime?.toISOString() || effectiveDate.toISOString(),
                    recurrence: recurrenceData,
                });
                dispatch(fetchTasks());
            }
            localDispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to create task';
            localDispatch({ type: 'SUBMIT_ERROR', error: errorMsg });
        }
    }, [state, dispatch, currentUserId, onSuccess]);

    return {
        state,
        setField: (field: keyof TaskFormState, value: any) => localDispatch({ type: 'SET_FIELD', field, value }),
        addSubtask: () => localDispatch({ type: 'ADD_SUBTASK' }),
        removeSubtask: (id: string) => localDispatch({ type: 'REMOVE_SUBTASK', id }),
        toggleAlarmType: () => localDispatch({ type: 'TOGGLE_ALARM_TYPE' }),
        handleCreate
    };
}
