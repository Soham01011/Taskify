import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CheckCircle, Circle, Clock, ChevronDown, CheckSquare, Square, Trash2, Bell } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Task, Subtask, taskApi } from '../api/tasks';
import { SPACING, } from '../constants/theme';
import { useDispatch } from 'react-redux';
import { fetchTasks, removeTask, updateTask } from '../store/slices/taskSlice';
import { AppDispatch } from '../store';
import { getStyles } from '@/assets/styles/TaskCard.styles';
import { useAppTheme } from '@/hooks/use-theme';

interface TaskCardProps {
    task: Task;
    onPress: (task: Task) => void;
    onComplete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onComplete }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const [isExpanded, setIsExpanded] = useState(false);
    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSubtaskToggle = async (subtaskId: string, currentStatus: boolean) => {
        try {
            const response = await taskApi.updateSubtask(task._id, subtaskId, { completed: !currentStatus });
            dispatch(updateTask(response.data));
        } catch (err) {
            console.error('Failed to toggle subtask', err);
        }
    };

    const handleDeleteTask = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await taskApi.delete(task._id);
                            dispatch(removeTask(task._id));
                        } catch (err) {
                            console.error('Failed to delete task', err);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        Alert.alert(
            'Delete Subtask',
            'Remove this subtask?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await taskApi.deleteSubtask(task._id, subtaskId);
                            dispatch(updateTask(response.data));
                        } catch (err) {
                            console.error('Failed to delete subtask', err);
                        }
                    }
                }
            ]
        );
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
                onLongPress={handleDeleteTask}
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
                                <CheckCircle size={24} color={colors.secondary} />
                            ) : (
                                <Circle size={24} color={colors.border} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
                        {task.description || 'No description provided'}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.meta}>
                            <Clock size={14} color={isOverdue ? colors.danger : colors.textSecondary} />
                            <Text style={[
                                styles.metaText,
                                isOverdue ? styles.overdueText : null
                            ]}>
                                {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                            {task.alarm_type && (
                                <View style={styles.alarmIndicator}>
                                    {task.alarm_type === 'alarm' ? (
                                        <Clock size={12} color={colors.primary} />
                                    ) : (
                                        <Bell size={12} color={colors.primary} />
                                    )}
                                    {task.alarm_reminder_time && (
                                        <Text style={styles.alarmTime}>
                                            {new Date(task.alarm_reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>

                        <Animated.View style={[styles.expandIcon, chevronStyle]}>
                            <ChevronDown size={20} color={colors.textSecondary} />
                        </Animated.View>
                    </View>
                </View>

                {totalSubtasks > 0 && (
                    <Animated.View style={[styles.subtasksList, subtasksStyle]}>
                        <View style={{ overflow: 'hidden' }}>
                            <View style={styles.divider} />
                            <Text style={styles.subtaskHeader}>Subtasks</Text>
                            {task.subtasks.map((subtask) => (
                                <View key={subtask._id} style={styles.subtaskItem}>
                                    <TouchableOpacity
                                        style={styles.deleteSubtaskBtn}
                                        onPress={() => handleDeleteSubtask(subtask._id!)}
                                    >
                                        <Trash2 size={16} color={colors.danger} opacity={0.6} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.subtaskMain}
                                        onPress={() => handleSubtaskToggle(subtask._id!, subtask.completed)}
                                    >
                                        {subtask.completed ? (
                                            <CheckSquare size={18} color={colors.secondary} />
                                        ) : (
                                            <Square size={18} color={colors.border} />
                                        )}
                                        <Text style={[
                                            styles.subtaskTitle,
                                            subtask.completed && styles.subtaskCompletedText
                                        ]}>
                                            {subtask.title}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

            </TouchableOpacity>
        </View>
    );
};

