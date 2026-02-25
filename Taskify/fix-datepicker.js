const fs = require('fs');

const content = fs.readFileSync('src/components/ui/DatePickerModal.tsx', 'utf8');

const newCode = `import React, { useReducer, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react-native';
import { SPACING, RADIUS } from '../../constants/theme';
import { Button } from './Button';
import { useAppTheme } from '@/hooks/use-theme';

interface DatePickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    initialDate?: Date;
    title?: string;
}

type DatePickerState = {
    currentMonth: Date;
    selectedDate: Date;
    showTimePicker: boolean;
    hours: number;
    minutes: number;
};

type DatePickerAction =
    | { type: 'SET_CURRENT_MONTH'; payload: Date }
    | { type: 'SET_SELECTED_DATE'; payload: Date }
    | { type: 'SET_SHOW_TIME_PICKER'; payload: boolean }
    | { type: 'SET_HOURS'; payload: number }
    | { type: 'SET_MINUTES'; payload: number };

const initDatePickerState = (initialDate?: Date): DatePickerState => {
    const baseDate = initialDate || new Date();
    return {
        currentMonth: baseDate,
        selectedDate: baseDate,
        showTimePicker: false,
        hours: baseDate.getHours(),
        minutes: baseDate.getMinutes()
    };
};

const datePickerReducer = (state: DatePickerState, action: DatePickerAction): DatePickerState => {
    switch (action.type) {
        case 'SET_CURRENT_MONTH': return { ...state, currentMonth: action.payload };
        case 'SET_SELECTED_DATE': return { ...state, selectedDate: action.payload };
        case 'SET_SHOW_TIME_PICKER': return { ...state, showTimePicker: action.payload };
        case 'SET_HOURS': return { ...state, hours: action.payload };
        case 'SET_MINUTES': return { ...state, minutes: action.payload };
        default: return state;
    }
};

export const DatePickerModal: React.FC<DatePickerProps> = ({
    visible,
    onClose,
    onSelect,
    initialDate,
    title = 'Select Date',
}) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    
    const [state, dispatch] = useReducer(datePickerReducer, initialDate, initDatePickerState);
    const { currentMonth, selectedDate, showTimePicker, hours, minutes } = state;

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month, 1).getDay();
    }, [currentMonth]);

    const monthName = useMemo(() => {
        return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [currentMonth]);

    const calendarItems = useMemo(() => {
        const items = [];
        // Add empty slots for the first week
        for (let i = 0; i < firstDayOfMonth; i++) {
            items.push({ id: \`empty-\${i}\`, dayNum: null });
        }
        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            items.push({ id: \`day-\${i}\`, dayNum: i });
        }
        return items;
    }, [daysInMonth, firstDayOfMonth]);

    const handlePrevMonth = () => {
        dispatch({ type: 'SET_CURRENT_MONTH', payload: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1) });
    };

    const handleNextMonth = () => {
        dispatch({ type: 'SET_CURRENT_MONTH', payload: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) });
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, hours, minutes);
        dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
    };

    const handleConfirm = () => {
        onSelect(selectedDate);
        onClose();
    };

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.dismiss} onPress={onClose} />
                <View style={styles.container}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthSelector}>
                        <Text style={styles.monthName}>{monthName}</Text>
                        <View style={styles.navBtns}>
                            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                                <ChevronLeft size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                                <ChevronRight size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.weekHeaders}>
                        {weekDays.map(day => (
                            <Text key={day} style={styles.weekDay}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.grid}>
                        {calendarItems.map((item) => {
                            if (item.dayNum === null) return <View key={item.id} style={styles.dayBox} />;

                            const day = item.dayNum;
                            const isSelected = selectedDate.getDate() === day &&
                                selectedDate.getMonth() === currentMonth.getMonth() &&
                                selectedDate.getFullYear() === currentMonth.getFullYear();

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.dayBox, isSelected && styles.selectedDay]}
                                    onPress={() => handleDateSelect(day)}
                                >
                                    <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.timeSection}>
                        <View style={styles.timeHeader}>
                            <Clock size={20} color={colors.textSecondary} />
                            <Text style={styles.timeLabel}>Select Time</Text>
                        </View>
                        <View style={styles.timeInputRow}>
                            {/* Simplified time picker for demo - could be scrolling wheels */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <TouchableOpacity
                                        key={\`hour-\${i}\`}
                                        style={[styles.timeChip, hours === i && styles.activeTimeChip]}
                                        onPress={() => {
                                            dispatch({ type: 'SET_HOURS', payload: i });
                                            const d = new Date(selectedDate);
                                            d.setHours(i);
                                            dispatch({ type: 'SET_SELECTED_DATE', payload: d });
                                        }}
                                    >
                                        <Text style={[styles.timeChipText, hours === i && styles.activeTimeChipText]}>
                                            {i.toString().padStart(2, '0')}:00
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <Button
                        title="Confirm"
                        onPress={handleConfirm}
                        style={styles.confirmBtn}
                    />
                </View>
            </View>
        </Modal>
    );
};
` + content.slice(content.indexOf('const getStyles'));

fs.writeFileSync('src/components/ui/DatePickerModal.tsx', newCode);
