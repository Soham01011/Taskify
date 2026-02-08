import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, Clock, ChevronRight } from 'lucide-react-native';
import { Task } from '../api/tasks';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface TaskCardProps {
    task: Task;
    onPress: (task: Task) => void;
    onComplete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onComplete }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(task)}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
                    <View style={[
                        styles.statusBadge,
                        task.completed ? styles.completedBadge : styles.pendingBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            task.completed ? styles.completedText : styles.pendingText
                        ]}>
                            {task.completed ? 'Completed' : 'Pending'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
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
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
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
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: SPACING.sm,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    pendingBadge: {
        backgroundColor: '#FFF3E0',
    },
    completedBadge: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    pendingText: {
        color: '#F57C00',
    },
    completedText: {
        color: '#388E3C',
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
    actionBtn: {
        padding: SPACING.xs,
    },
});
