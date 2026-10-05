import { getStyles } from '@/assets/styles/CreateTaskForm.styles';
import { useAppTheme } from '@/hooks/use-theme';
import {
    ChevronDown,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// Subcomponents
import { useCreateTask } from '@/src/hooks/useCreateTask';
import { RecurrencePicker } from './RecurrencePicker';
import { TaskActionPills } from './TaskActionPills';
import { TaskBasicInputs } from './TaskBasicInputs';
import { TaskPickers } from './TaskPickers';
import { TaskSubtasks } from './TaskSubtasks';
import { TimeSlotPicker } from './TimeSlotPicker';

interface CreateTaskFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const { state, setField, addSubtask, removeSubtask, toggleAlarmType, handleCreate } = useCreateTask(onSuccess);

    const { groups } = useSelector((rootState: RootState) => rootState.groups);
    const activeGroup = groups.find(g => g._id === state.selectedGroupId);

    return (
        <View style={styles.container}>

            <View style={[styles.card, (state.showRecurrencePicker || state.showTimeSlotPicker) && { maxHeight: 600 }]}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollArea}
                >
                    <TaskBasicInputs
                        colors={colors}
                        styles={styles}
                        title={state.title}
                        setTitle={(val) => setField('title', val)}
                        description={state.description}
                        setDescription={(val) => setField('description', val)}
                    />

                    {state.showTimeSlotPicker && (
                        <TimeSlotPicker
                            colors={colors}
                            hours={state.timeSlotHours}
                            setHours={(val) => setField('timeSlotHours', val)}
                            minutes={state.timeSlotMinutes}
                            setMinutes={(val) => setField('timeSlotMinutes', val)}
                            dueDate={state.dueDate}
                        />
                    )}

                    {state.showRecurrencePicker && (
                        <RecurrencePicker
                            colors={colors}
                            frequency={state.frequency}
                            setFrequency={(val) => setField('frequency', val)}
                            daysOfWeek={state.daysOfWeek}
                            setDaysOfWeek={(val) => setField('daysOfWeek', val)}
                            dayOfMonth={state.dayOfMonth}
                            setDayOfMonth={(val) => setField('dayOfMonth', val)}
                            lastWeekend={state.lastWeekend}
                            setLastWeekend={(val) => setField('lastWeekend', val)}
                            timeOfDay={state.timeOfDay}
                            setTimeOfDay={() => { }}
                            showTimePicker={() => setField('isTimePickerVisible', true)}
                        />
                    )}

                    <TaskSubtasks
                        colors={colors}
                        styles={styles}
                        selectedGroupId={state.selectedGroupId}
                        subtasks={state.subtasks}
                        newSubtaskTitle={state.newSubtaskTitle}
                        setNewSubtaskTitle={(val) => setField('newSubtaskTitle', val)}
                        showSubtaskInput={state.showSubtaskInput}
                        setShowSubtaskInput={(val) => setField('showSubtaskInput', val)}
                        addSubtask={addSubtask}
                        removeSubtask={removeSubtask}
                    />
                </ScrollView>

                <TaskActionPills
                    colors={colors}
                    styles={styles}
                    dueDate={state.dueDate}
                    setDueDate={(val) => setField('dueDate', val)}
                    alarmType={state.alarmType}
                    toggleAlarmType={toggleAlarmType}
                    alarmReminderTime={state.alarmReminderTime}
                    showDatePicker={() => setField('isDatePickerVisible', true)}
                    showReminderPicker={() => setField('isReminderPickerVisible', true)}
                    recurrence={state.frequency}
                    onRecurrencePress={() => {
                        setField('showRecurrencePicker', !state.showRecurrencePicker);
                        if (!state.showRecurrencePicker) setField('showTimeSlotPicker', false);
                    }}
                    timeSlotHours={state.timeSlotHours}
                    timeSlotMinutes={state.timeSlotMinutes}
                    onTimeSlotPress={() => {
                        setField('showTimeSlotPicker', !state.showTimeSlotPicker);
                        if (!state.showTimeSlotPicker) setField('showRecurrencePicker', false);
                    }}
                    isTimeSlotActive={state.showTimeSlotPicker}
                />

                <View style={styles.divider} />

                <View style={styles.bottomBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                        <TouchableOpacity
                            style={styles.projectDropdown}
                            onPress={() => setField('showGroupPicker', !state.showGroupPicker)}
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
                                onPress={() => setField('showAssigneePicker', !state.showAssigneePicker)}
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
                    setSelectedGroupId={(val) => setField('selectedGroupId', val)}
                    assignee={state.assignee}
                    setAssignee={(val) => setField('assignee', val)}
                    showGroupPicker={state.showGroupPicker}
                    setShowGroupPicker={(val) => setField('showGroupPicker', val)}
                    showAssigneePicker={state.showAssigneePicker}
                    setShowAssigneePicker={(val) => setField('showAssigneePicker', val)}
                />
            </View>

            {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}

            <DateTimePickerModal
                isVisible={state.isDatePickerVisible}
                mode="datetime"
                onConfirm={(date) => {
                    setField('dueDate', date);
                    setField('isDatePickerVisible', false);
                }}
                onCancel={() => setField('isDatePickerVisible', false)}
            />

            <DateTimePickerModal
                isVisible={state.isReminderPickerVisible}
                mode="datetime"
                onConfirm={(date) => {
                    setField('alarmReminderTime', date);
                    setField('isReminderPickerVisible', false);
                }}
                onCancel={() => setField('isReminderPickerVisible', false)}
            />

            <DateTimePickerModal
                isVisible={state.isTimePickerVisible}
                mode="time"
                onConfirm={(date) => {
                    setField('timeOfDay', date);
                    setField('isTimePickerVisible', false);
                }}
                onCancel={() => setField('isTimePickerVisible', false)}
            />
        </View>
    );
};
