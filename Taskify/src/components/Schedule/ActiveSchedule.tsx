import { styles } from '@/assets/styles/activeSchedule.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { Task } from '@/src/api/tasks';
import { getTasksForDate } from '@/src/utils/calendar';
import { Check, Clock, Repeat } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ActiveScheduleProps {
    tasks: Task[];
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
    onTaskPress?: (task: Task) => void;
}
const HOUR_HEIGHT = 64;
const VISIBLE_HOURS = 3;
const SCHEDULE_CONTAINER_HEIGHT = HOUR_HEIGHT * VISIBLE_HOURS;
const TOTAL_DAY_HEIGHT = HOUR_HEIGHT * 24;

const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatHourLabel = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
};

const formatTime12 = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const displayMin = String(minutes).padStart(2, '0');
    return `${displayHour}:${displayMin} ${period}`;
};

/** Get total duration in minutes from a task's timeSlots field */
const getTaskDurationMinutes = (task: Task): number => {
    const slot = task.timeSlots?.[0];
    if (!slot) return 30;
    return slot.hours * 60 + slot.minutes;
};

export const ActiveSchedule: React.FC<ActiveScheduleProps> = ({
    tasks,
    selectedDate: propSelectedDate,
    onSelectDate,
    onTaskPress,
}) => {
    const { colors } = useAppTheme();
    const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(() => new Date());
    const selectedDate = propSelectedDate || internalSelectedDate;

    const handleSetSelectedDate = (d: Date) => {
        if (onSelectDate) {
            onSelectDate(d);
        } else {
            setInternalSelectedDate(d);
        }
    };

    const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

    const verticalScrollRef = useRef<ScrollView>(null);
    const horizontalScrollRef = useRef<ScrollView>(null);

    // Tick the clock every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const isToday = isSameDay(selectedDate, currentTime);

    // Generate date range: 7 days before today → 28 days ahead
    const dateList = useMemo(() => {
        const list: Date[] = [];
        const base = new Date(currentTime);
        for (let i = -7; i <= 28; i++) {
            list.push(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
        }
        return list;
    }, [currentTime.getDate(), currentTime.getMonth(), currentTime.getFullYear()]);

    const todayIndex = 7;

    // Scroll horizontal picker to center today on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (horizontalScrollRef.current) {
                const itemWidth = 52;
                horizontalScrollRef.current.scrollTo({ x: Math.max(0, (todayIndex - 2) * itemWidth), animated: false });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Scroll vertical timeline to current time
    const scrollToCurrentTime = (animated = true) => {
        if (!verticalScrollRef.current) return;
        const now = new Date();
        const targetY = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
        const clamped = Math.max(0, Math.min(targetY, (24 - VISIBLE_HOURS) * HOUR_HEIGHT));
        verticalScrollRef.current.scrollTo({ y: clamped, animated });
    };

    useEffect(() => {
        if (isToday) {
            const timer = setTimeout(() => scrollToCurrentTime(false), 150);
            return () => clearTimeout(timer);
        }
    }, [isToday]);

    // Tasks for the selected date (including recurring)
    const dayTasks = useMemo(() => getTasksForDate(selectedDate, tasks), [selectedDate, tasks]);

    // Compute overlapping layout (column assignment)
    const layoutTasks = useMemo(() => {
        if (dayTasks.length === 0) return [];

        interface ProcessedTask {
            task: Task;
            startMinutes: number;
            endMinutes: number;
            top: number;
            height: number;
            colIndex: number;
            totalCols: number;
        }

        const items = dayTasks.map(task => {
            const dueDate = new Date(task.dueDate);
            const startM = dueDate.getHours() * 60 + dueDate.getMinutes();
            const duration = getTaskDurationMinutes(task);
            return {
                task,
                startMinutes: startM,
                endMinutes: startM + duration,
                top: (startM / 60) * HOUR_HEIGHT,
                height: Math.max((duration / 60) * HOUR_HEIGHT, 26),
            };
        });

        items.sort((a, b) =>
            a.startMinutes !== b.startMinutes
                ? a.startMinutes - b.startMinutes
                : (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
        );

        const result: ProcessedTask[] = [];
        let cluster: typeof items = [];
        let clusterEnd = -1;

        const processCluster = (clusterItems: typeof items) => {
            if (!clusterItems.length) return;
            const cols: number[] = [];
            const assigned: { item: typeof items[0]; col: number }[] = [];

            clusterItems.forEach(it => {
                let placed = -1;
                for (let c = 0; c < cols.length; c++) {
                    if (cols[c] <= it.startMinutes) { placed = c; cols[c] = it.endMinutes; break; }
                }
                if (placed === -1) { placed = cols.length; cols.push(it.endMinutes); }
                assigned.push({ item: it, col: placed });
            });

            const totalCols = Math.max(1, cols.length);
            assigned.forEach(({ item, col }) =>
                result.push({ ...item, colIndex: col, totalCols })
            );
        };

        items.forEach(it => {
            if (!cluster.length) { cluster.push(it); clusterEnd = it.endMinutes; }
            else if (it.startMinutes < clusterEnd) { cluster.push(it); clusterEnd = Math.max(clusterEnd, it.endMinutes); }
            else { processCluster(cluster); cluster = [it]; clusterEnd = it.endMinutes; }
        });
        if (cluster.length) processCluster(cluster);

        return result;
    }, [dayTasks]);

    const headerDateText = useMemo(() => {
        return `${DAYS_SHORT[selectedDate.getDay()]}, ${MONTHS_SHORT[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
    }, [selectedDate]);

    const currentTimeTop = useMemo(() => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        return (h + m / 60) * HOUR_HEIGHT;
    }, [currentTime]);

    const handleSelectToday = () => {
        handleSetSelectedDate(new Date());
        scrollToCurrentTime(true);
    };

    return (
        <View style={styles.container}>
            {/* Section header */}
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.text }]}>Active Schedule</Text>
                <TouchableOpacity
                    style={styles.headerBadgeContainer}
                    onPress={handleSelectToday}
                    activeOpacity={0.7}
                >
                    {isToday && (
                        <View style={[styles.nowCapsule, { backgroundColor: colors.primary + '25', borderColor: colors.primary }]}>
                            <View style={[styles.nowDot, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.nowBadgeText, { color: colors.primary }]}>NOW</Text>
                        </View>
                    )}
                    <Text style={[styles.nowDateText, { color: colors.textSecondary }]}>{headerDateText}</Text>
                    {isToday && <Text style={[styles.todayTag, { color: colors.primary }]}>TODAY</Text>}
                </TouchableOpacity>
            </View>

            {/* Schedule card */}
            <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Horizontal Day Picker */}
                <ScrollView
                    ref={horizontalScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.daysScrollContent}
                    style={styles.daysScrollView}
                >
                    {dateList.map((d) => {
                        const isSelected = isSameDay(d, selectedDate);
                        const isTodayItem = isSameDay(d, currentTime);
                        return (
                            <TouchableOpacity
                                key={d.toISOString()}
                                style={[
                                    styles.dayChip,
                                    isSelected && [styles.dayChipSelected, { backgroundColor: colors.primary }],
                                ]}
                                onPress={() => handleSetSelectedDate(d)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.dayChipName, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                                    {DAYS_SHORT[d.getDay()]}
                                </Text>
                                <Text style={[styles.dayChipNumber, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                                    {d.getDate()}
                                </Text>
                                {isTodayItem && !isSelected && (
                                    <View style={[styles.todayDotIndicator, { backgroundColor: colors.primary }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* 3-Hour Scrollable Timeline */}
                <View style={styles.scheduleViewport}>
                    <ScrollView
                        ref={verticalScrollRef}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator
                        contentContainerStyle={styles.timelineContent}
                    >
                        <View style={styles.timelineRow}>
                            {/* Time labels column */}
                            <View style={styles.timeLabelsColumn}>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <View key={`label-${hour}`} style={[styles.timeLabelSlot, { height: HOUR_HEIGHT }]}>
                                        <Text style={[styles.timeLabelText, { color: colors.textSecondary }]}>
                                            {formatHourLabel(hour)}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Grid + task blocks */}
                            <View style={styles.timelineGridArea}>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <View
                                        key={`grid-${hour}`}
                                        style={[styles.gridLineSlot, { height: HOUR_HEIGHT, borderTopColor: colors.border + '50' }]}
                                    />
                                ))}

                                {/* Current time indicator */}
                                {isToday && (
                                    <View
                                        style={[styles.currentTimeIndicator, { top: currentTimeTop }]}
                                        pointerEvents="none"
                                    >
                                        <View style={[styles.currentTimeDot, { backgroundColor: colors.primary }]} />
                                        <View style={[styles.currentTimeLine, { backgroundColor: colors.primary }]} />
                                    </View>
                                )}

                                {/* Task blocks */}
                                {layoutTasks.map(({ task, top, height, colIndex, totalCols }) => {
                                    const taskStart = new Date(task.dueDate);
                                    const duration = getTaskDurationMinutes(task);
                                    const timeSpanStr = `${formatTime12(taskStart.getHours(), taskStart.getMinutes())} (${duration}m)`;
                                    const isRecurring = !!(task.recurrence && task.recurrence.frequency !== 'none');
                                    const leftPct = (colIndex / totalCols) * 100;
                                    const widthPct = (1 / totalCols) * 100;

                                    return (
                                        <TouchableOpacity
                                            key={task._id}
                                            activeOpacity={0.8}
                                            onPress={() => onTaskPress?.(task)}
                                            style={[
                                                styles.taskBlock,
                                                {
                                                    top,
                                                    height,
                                                    left: `${leftPct}%` as any,
                                                    width: `${widthPct}%` as any,
                                                    backgroundColor: task.completed
                                                        ? colors.secondary + '20'
                                                        : colors.primary + '25',
                                                    borderColor: task.completed
                                                        ? colors.secondary
                                                        : colors.primary,
                                                },
                                            ]}
                                        >
                                            <View style={styles.taskBlockHeader}>
                                                <Text
                                                    style={[
                                                        styles.taskBlockTitle,
                                                        { color: colors.text },
                                                        task.completed && styles.taskCompletedTitle,
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {task.title}
                                                </Text>
                                                <View style={styles.taskBlockIcons}>
                                                    {isRecurring && (
                                                        <Repeat size={11} color={colors.primary} style={{ marginRight: 3 }} />
                                                    )}
                                                    {task.completed && (
                                                        <Check size={11} color={colors.secondary} />
                                                    )}
                                                </View>
                                            </View>
                                            {height >= 36 && (
                                                <Text
                                                    style={[styles.taskBlockTime, { color: colors.textSecondary }]}
                                                    numberOfLines={1}
                                                >
                                                    {timeSpanStr}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Empty state for selected date */}
                {dayTasks.length === 0 && (
                    <View style={styles.emptySlot}>
                        <Clock size={20} color={colors.textSecondary} opacity={0.5} />
                        <Text style={[styles.emptySlotText, { color: colors.textSecondary }]}>
                            No tasks scheduled
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};


