import React, { useState, useMemo } from 'react';
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

export const DatePickerModal: React.FC<DatePickerProps> = ({
    visible,
    onClose,
    onSelect,
    initialDate,
    title = 'Select Date',
}) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hours, setHours] = useState(selectedDate.getHours());
    const [minutes, setMinutes] = useState(selectedDate.getMinutes());

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

    const calendarDays = useMemo(() => {
        const days = [];
        // Add empty slots for the first week
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [daysInMonth, firstDayOfMonth]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, hours, minutes);
        setSelectedDate(newDate);
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
                        {calendarDays.map((day, index) => {
                            if (day === null) return <View key={`empty-${index}`} style={styles.dayBox} />;

                            const isSelected = selectedDate.getDate() === day &&
                                selectedDate.getMonth() === currentMonth.getMonth() &&
                                selectedDate.getFullYear() === currentMonth.getFullYear();

                            return (
                                <TouchableOpacity
                                    key={day}
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
                                        key={i}
                                        style={[styles.timeChip, hours === i && styles.activeTimeChip]}
                                        onPress={() => {
                                            setHours(i);
                                            const d = new Date(selectedDate);
                                            d.setHours(i);
                                            setSelectedDate(d);
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

const getStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    dismiss: {
        flex: 1,
    },
    container: {
        backgroundColor: colors.card,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: colors.border,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    monthName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    navBtns: {
        flexDirection: 'row',
    },
    navBtn: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    weekHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    weekDay: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.xl,
    },
    dayBox: {
        width: '14.28%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedDay: {
        backgroundColor: colors.primary,
        borderRadius: 22.5,
    },
    dayText: {
        fontSize: 16,
        color: colors.text,
    },
    selectedDayText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    timeSection: {
        marginBottom: SPACING.xl,
    },
    timeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    timeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginLeft: SPACING.xs,
    },
    timeInputRow: {
        flexDirection: 'row',
    },
    timeChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: colors.border,
        borderRadius: RADIUS.md,
        marginRight: SPACING.sm,
    },
    activeTimeChip: {
        backgroundColor: colors.primary,
    },
    timeChipText: {
        fontSize: 14,
        color: colors.text,
    },
    activeTimeChipText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    confirmBtn: {
        height: 55,
    },
});
