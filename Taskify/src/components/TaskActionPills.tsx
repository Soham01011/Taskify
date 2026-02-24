import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Bell, Clock, MoreHorizontal, X } from 'lucide-react-native';

interface TaskActionPillsProps {
    colors: any;
    styles: any;
    dueDate: Date | null;
    setDueDate: (date: Date | null) => void;
    alarmType: 'push' | 'alarm';
    toggleAlarmType: () => void;
    alarmReminderTime: Date | null;
    showDatePicker: () => void;
    showReminderPicker: () => void;
}

export const TaskActionPills: React.FC<TaskActionPillsProps> = ({
    colors, styles, dueDate, setDueDate, alarmType, toggleAlarmType,
    alarmReminderTime, showDatePicker, showReminderPicker
}) => {
    return (
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
    );
};
