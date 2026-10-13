import { useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { taskApi } from '../api/tasks';
import { groupApi } from '../api/groups';
import { fetchTasks, addTasks } from '../store/slices/taskSlice';
import { fetchGroups } from '../store/slices/groupSlice';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'six-months' | 'annually' | 'schedule';

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
    isStartDatePickerVisible: boolean;
    isEndDatePickerVisible: boolean;
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
    startDate: Date | null;
    endDate: Date | null;
    // Time slot stored as separate hours/minutes to match API format: timeSlots: [{ hours, minutes }]
    timeSlotHours: number;
    timeSlotMinutes: number;
    showTimeSlotPicker: boolean;
}

type FormAction =
    | { type: 'SET_FIELD'; field: keyof TaskFormState; value: any }
    | { type: 'ADD_SUBTASK' }
    | { type: 'REMOVE_SUBTASK'; id: string }
    | { type: 'TOGGLE_ALARM_TYPE' }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string };

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
    isStartDatePickerVisible: false,
    isEndDatePickerVisible: false,
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
    startDate: new Date(),
    endDate: null,
    timeSlotHours: 0,
    timeSlotMinutes: 30,
    showTimeSlotPicker: false,
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

        if (state.frequency === 'schedule') {
            if (!state.startDate || !state.endDate) {
                localDispatch({ type: 'SET_FIELD', field: 'error', value: 'startDate and endDate are required for schedule recurrence' });
                return;
            }

            const startMid = new Date(state.startDate.getFullYear(), state.startDate.getMonth(), state.startDate.getDate()).getTime();
            const endMid = new Date(state.endDate.getFullYear(), state.endDate.getMonth(), state.endDate.getDate()).getTime();
            const todayMid = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();

            if (endMid < startMid) {
                localDispatch({ type: 'SET_FIELD', field: 'error', value: 'endDate cannot be before startDate' });
                return;
            }

            if (startMid < todayMid) {
                localDispatch({ type: 'SET_FIELD', field: 'error', value: 'startDate cannot be in the past' });
                return;
            }
        }

        const hasRecurrence = state.frequency !== 'none';

        // 1. Calculate effective start date in local time
        const effectiveStartDate = state.startDate
            ? new Date(state.startDate)
            : (state.dueDate ? new Date(state.dueDate) : new Date());

        if (state.timeOfDay) {
            effectiveStartDate.setHours(state.timeOfDay.getHours());
            effectiveStartDate.setMinutes(state.timeOfDay.getMinutes());
            effectiveStartDate.setSeconds(0);
            effectiveStartDate.setMilliseconds(0);
        } else if (state.dueDate) {
            effectiveStartDate.setHours(state.dueDate.getHours());
            effectiveStartDate.setMinutes(state.dueDate.getMinutes());
            effectiveStartDate.setSeconds(0);
            effectiveStartDate.setMilliseconds(0);
        }

        // 2. Calculate effective end date in local time (for schedule recurrence)
        const effectiveEndDate = state.endDate
            ? new Date(state.endDate)
            : new Date(effectiveStartDate);

        if (state.timeOfDay) {
            effectiveEndDate.setHours(state.timeOfDay.getHours());
            effectiveEndDate.setMinutes(state.timeOfDay.getMinutes());
            effectiveEndDate.setSeconds(0);
            effectiveEndDate.setMilliseconds(0);
        } else {
            effectiveEndDate.setHours(effectiveStartDate.getHours());
            effectiveEndDate.setMinutes(effectiveStartDate.getMinutes());
            effectiveEndDate.setSeconds(0);
            effectiveEndDate.setMilliseconds(0);
        }

        // 3. Global scale UTC conversions
        // Serialise to UTC ISO 8601 strings (e.g. "2026-10-20T11:30:00.000Z")
        const utcStartDate = effectiveStartDate.toISOString();
        const utcEndDate = effectiveEndDate.toISOString();
        // Time formatted as UTC "HH:mm" (e.g. "11:30")
        const utcTimeStr = `${String(effectiveStartDate.getUTCHours()).padStart(2, '0')}:${String(effectiveStartDate.getUTCMinutes()).padStart(2, '0')}`;

        let recurrenceData: any = undefined;
        if (state.frequency === 'schedule') {
            recurrenceData = {
                frequency: 'schedule',
                startDate: utcStartDate,
                endDate: utcEndDate,
                time: utcTimeStr,
                timeOfDay: utcTimeStr,
            };
        } else if (hasRecurrence) {
            recurrenceData = {
                frequency: state.frequency,
                daysOfWeek: state.daysOfWeek,
                dayOfMonth: state.dayOfMonth ?? undefined,
                lastWeekend: state.lastWeekend,
                timeOfDay: utcTimeStr,
            };
        }

        // Build timeSlots payload: [{ hours, minutes }]
        const timeSlotsPayload = [{ hours: state.timeSlotHours, minutes: state.timeSlotMinutes }];

        localDispatch({ type: 'SUBMIT_START' });
        try {
            if (state.selectedGroupId) {
                await groupApi.assignTask(state.selectedGroupId, {
                    userId: state.assignee?.id || '',
                    username: state.assignee?.username || '',
                    task: state.title.trim(),
                    duedate: utcStartDate,
                    timeSlots: timeSlotsPayload,
                    subtasks: state.subtasks.map(s => ({ title: s.title, completed: false })),
                    recurrence: recurrenceData
                });
                if (currentUserId) {
                    dispatch(fetchGroups({ userId: currentUserId }));
                }
            } else {
                const response = await taskApi.create({
                    title: state.title.trim(),
                    description: state.description.trim(),
                    dueDate: utcStartDate,
                    timeSlots: timeSlotsPayload,
                    timeSlot: { hours: state.timeSlotHours, minutes: state.timeSlotMinutes },
                    subtasks: state.subtasks.map(s => ({ title: s.title, completed: false })),
                    alarm_type: state.alarmType,
                    alarm_reminder_time: state.alarmReminderTime?.toISOString() || utcStartDate,
                    recurrence: recurrenceData,
                });
                if (response?.data) {
                    dispatch(addTasks(response.data));
                }
                dispatch(fetchTasks());
            }
            localDispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to create task';
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
