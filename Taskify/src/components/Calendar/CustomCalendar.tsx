import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getDaysInMonth, getFirstDayOfMonth } from '../../utils/calendar';
import { SPACING, RADIUS } from '../../constants/theme';
import { Task } from '../../api/tasks';
import { getTasksForDate } from '../../utils/calendar';

interface CustomCalendarProps {
    colors: any;
    tasks: Task[];
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ colors, tasks, selectedDate, onSelectDate }) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const renderDays = () => {
        const days = [];
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }
        
        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
            const dayTasks = getTasksForDate(date, tasks);
            
            // Limit dots to max 3
            const dots = dayTasks.slice(0, 3);
            const hasRecurrent = dayTasks.some(t => t.recurrence && t.recurrence.frequency !== 'none');

            days.push(
                <TouchableOpacity 
                    key={`day-${i}`} 
                    style={[
                        styles.dayCell, 
                        isSelected && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => onSelectDate(date)}
                >
                    <Text style={[
                        styles.dayText, 
                        { color: isSelected ? '#FFF' : colors.text },
                        hasRecurrent && !isSelected && { color: colors.primary, fontWeight: '700' }
                    ]}>
                        {i}
                    </Text>
                    <View style={styles.dotsContainer}>
                        {dots.map((_, idx) => (
                            <View key={`dot-${idx}`} style={[
                                styles.dot, 
                                { backgroundColor: isSelected ? '#FFF' : colors.primary }
                            ]} />
                        ))}
                    </View>
                </TouchableOpacity>
            );
        }

        return days;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <Text style={[styles.monthText, { color: colors.text }]}>
                    {MONTHS[currentMonth]} {currentYear}
                </Text>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { borderColor: colors.border }]}>
                        <ChevronLeft size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { borderColor: colors.border, marginLeft: 8 }]}>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.daysHeader}>
                {DAYS.map((d, i) => (
                    <Text key={`dh-${i}`} style={[styles.dayHeaderText, { color: colors.textSecondary }]}>{d}</Text>
                ))}
            </View>

            <View style={styles.grid}>
                {renderDays()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    monthText: {
        fontSize: 18,
        fontWeight: '600',
    },
    controls: {
        flexDirection: 'row',
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    daysHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    dayHeaderText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        marginVertical: 2,
    },
    dayText: {
        fontSize: 15,
        fontWeight: '500',
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 6,
        gap: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    }
});
