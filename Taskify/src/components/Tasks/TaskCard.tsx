import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Check, ChevronRight, History, AlertTriangle, CheckSquare, Square, Trash2 } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useDerivedValue,
    interpolate,
} from 'react-native-reanimated';
import { Task, taskApi } from '../../api/tasks';
import { SPACING } from '../../constants/theme';
import { useDispatch } from 'react-redux';
import { fetchTasks, removeTask, updateTask } from '../../store/slices/taskSlice';
import { AppDispatch } from '../../store';
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
        onPress(task);
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

    const totalSubtasks = task.subtasks?.length || 0;

    // Animation values
    const progress = useDerivedValue(() => {
        return withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 90 });
    });

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 90}deg` }]
    }));

    const expandedStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        height: isExpanded ? 'auto' : 0,
        marginTop: interpolate(progress.value, [0, 1], [0, SPACING.md]),
    }));

    const rightIcon = () => {
        if (task.completed) {
            return <History size={20} color={colors.textSecondary} />;
        }
        if (isOverdue) {
            return <AlertTriangle size={20} color={colors.danger} />;
        }
        if (task.groupName) {
            return (
                <View style={styles.avatarStack}>
                    <View style={[styles.avatarMock, { zIndex: 2, backgroundColor: colors.primary }]} />
                    <View style={[styles.avatarMock, { zIndex: 1, marginLeft: -8, backgroundColor: colors.secondary }]} />
                </View>
            );
        }
        return (
            <Animated.View style={chevronStyle}>
                <ChevronRight size={20} color={colors.textSecondary} />
            </Animated.View>
        );
    };

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
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => onComplete(task._id)}
                        >
                            {task.completed ? (
                                <View style={[styles.checkbox, styles.checkboxChecked]}>
                                    <Check size={14} color={colors.white || '#FFF'} strokeWidth={3} />
                                </View>
                            ) : (
                                <View style={[styles.checkbox, isOverdue && styles.checkboxOverdue]} />
                            )}
                        </TouchableOpacity>
                        
                        <View style={styles.titleContainer}>
                            <Text style={[
                                styles.title,
                                task.completed && styles.completedTextStrike
                            ]} numberOfLines={1}>
                                {task.title}
                            </Text>
                            <Text style={[
                                styles.subtitleText,
                                isOverdue ? styles.overdueText : null
                            ]}>
                                {task.completed ? `Done at ${new Date(task.updated_at || task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                                 isOverdue ? `High Priority • Overdue` :
                                 `Due at ${new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • ${task.groupName || 'Personal'}`}
                            </Text>
                        </View>

                        <View style={styles.rightAction}>
                            {rightIcon()}
                        </View>
                    </View>

                    <Animated.View style={[styles.expandedContent, expandedStyle]}>
                        <Text style={styles.description}>
                            {task.description || 'No description provided'}
                        </Text>

                        {totalSubtasks > 0 && (
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
                        )}
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </View>
    );
};
