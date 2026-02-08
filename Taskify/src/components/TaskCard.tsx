import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle, Circle, Clock, ChevronDown, CheckSquare, Square } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Task, Subtask, taskApi } from '../api/tasks';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useDispatch } from 'react-redux';
import { fetchTasks } from '../store/slices/taskSlice';
import { AppDispatch } from '../store';

interface TaskCardProps {
    task: Task;
    onPress: (task: Task) => void;
    onComplete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onComplete }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isExpanded, setIsExpanded] = useState(false);
    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSubtaskToggle = async (subtaskId: string, currentStatus: boolean) => {
        try {
            await taskApi.updateSubtask(task._id, subtaskId, { completed: !currentStatus });
            dispatch(fetchTasks());
        } catch (err) {
            console.error('Failed to toggle subtask', err);
        }
    };

    const completedSubtasks = task.subtasks.filter(s => s.completed).length;
    const totalSubtasks = task.subtasks.length;

    // Animation values
    const progress = useDerivedValue(() => {
        return withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 90 });
    });

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 180}deg` }]
    }));

    const subtasksStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        height: isExpanded ? 'auto' : 0,
        marginTop: interpolate(progress.value, [0, 1], [0, SPACING.md]),
    }));

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={[
                    styles.card,
                    isExpanded && styles.expandedCard
                ]}
                onPress={toggleExpand}
                activeOpacity={0.9}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={[
                                styles.title,
                                task.completed && styles.completedTextStrike
                            ]} numberOfLines={1}>
                                {task.title}
                            </Text>
                            {totalSubtasks > 0 && (
                                <View style={styles.subtaskCountBadge}>
                                    <Text style={styles.subtaskCountText}>
                                        {completedSubtasks}/{totalSubtasks}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => onComplete(task._id)}
                        >
                            {task.completed ? (
                                <CheckCircle size={24} color={COLORS.secondary} />
                            ) : (
                                <Circle size={24} color={COLORS.border} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
                        {task.description || 'No description provided'}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.meta}>
                            <Clock size={14} color={isOverdue ? COLORS.danger : COLORS.textSecondary} />
                            <Text style={[
                                styles.metaText,
                                isOverdue ? styles.overdueText : null
                            ]}>
                                {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                        </View>

                        <Animated.View style={[styles.expandIcon, chevronStyle]}>
                            <ChevronDown size={20} color={COLORS.textSecondary} />
                        </Animated.View>
                    </View>
                </View>

                {totalSubtasks > 0 && (
                    <Animated.View style={[styles.subtasksList, subtasksStyle]}>
                        <View style={{ overflow: 'hidden' }}>
                            <View style={styles.divider} />
                            <Text style={styles.subtaskHeader}>Subtasks</Text>
                            {task.subtasks.map((subtask) => (
                                <TouchableOpacity
                                    key={subtask._id}
                                    style={styles.subtaskItem}
                                    onPress={() => handleSubtaskToggle(subtask._id!, subtask.completed)}
                                >
                                    {subtask.completed ? (
                                        <CheckSquare size={18} color={COLORS.secondary} />
                                    ) : (
                                        <Square size={18} color={COLORS.border} />
                                    )}
                                    <Text style={[
                                        styles.subtaskTitle,
                                        subtask.completed && styles.subtaskCompletedText
                                    ]}>
                                        {subtask.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.sm,
        overflow: 'hidden', // Fixes rounded corners clipping
        borderWidth: 1,
        borderColor: 'transparent', // Default border to avoid jump
    },
    expandedCard: {
        borderColor: COLORS.primary,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginRight: SPACING.sm,
    },
    completedTextStrike: {
        textDecorationLine: 'line-through',
        color: COLORS.textSecondary,
    },
    subtaskCountBadge: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    subtaskCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primary,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: SPACING.sm,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    overdueText: {
        color: COLORS.danger,
        fontWeight: '600',
    },
    expandIcon: {
        marginLeft: SPACING.sm,
    },
    actionBtn: {
        padding: SPACING.xs,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: SPACING.md,
    },
    subtaskHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    subtasksList: {
        marginTop: SPACING.xs,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    subtaskTitle: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },
    subtaskCompletedText: {
        textDecorationLine: 'line-through',
        color: COLORS.textSecondary,
    },
});
