import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/use-theme';
import { CustomCalendar } from '@/src/components/Calendar/CustomCalendar';
import { TaskCard } from '@/src/components/Tasks/TaskCard';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { getTasksForDate } from '@/src/utils/calendar';
import { useTasks } from '@/src/hooks/useTasks';
import { MoreVertical } from 'lucide-react-native';

export default function CalendarScreen() {
    const { colors } = useAppTheme();
    const { tasks, handleComplete } = useTasks();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const selectedTasks = useMemo(() => {
        return getTasksForDate(selectedDate, tasks);
    }, [selectedDate, tasks]);

    const overdueTasks = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // start of today
        return tasks.filter(t => !t.completed && new Date(t.dueDate) < now);
    }, [tasks]);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <CustomCalendar 
                colors={colors}
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
            />

            {overdueTasks.length > 0 && (
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Tasks</Text>
                        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>{overdueTasks.length} overdue</Text>
                        </View>
                    </View>
                    {overdueTasks.slice(0, 3).map(task => (
                        <View key={task._id} style={[styles.quickTask, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.quickTaskBar, { backgroundColor: '#F8A5A5' }]} />
                            <View style={styles.quickTaskContent}>
                                <Text style={[styles.quickTaskTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
                                <Text style={[styles.quickTaskMeta, { color: colors.textSecondary }]}>
                                    Overdue • {task.groupName || 'Personal'}
                                </Text>
                            </View>
                            <TouchableOpacity style={{ padding: SPACING.xs }}>
                                <MoreVertical size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <View style={[styles.sectionContainer, { marginTop: SPACING.md }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's Tasks" : `${selectedDate.getDate()} ${selectedDate.toLocaleString('default', { month: 'short' })} Tasks`}
                    </Text>
                    {/* Optional Progress bar here */}
                    {selectedTasks.length > 0 && (
                        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${(selectedTasks.filter(t => t.completed).length / selectedTasks.length) * 100}%` }]} />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <FlatList
                data={selectedTasks}
                keyExtractor={item => item._id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TaskCard 
                        task={item}
                        onPress={() => {}}
                        onComplete={handleComplete}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks scheduled for this day.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    headerContainer: {
        marginBottom: SPACING.md,
    },
    sectionContainer: {
        marginBottom: SPACING.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    quickTask: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    quickTaskBar: {
        width: 4,
        alignSelf: 'stretch',
    },
    quickTaskContent: {
        flex: 1,
        padding: SPACING.md,
    },
    quickTaskTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    quickTaskMeta: {
        fontSize: 12,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    progressBarBg: {
        width: 40,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    }
});
