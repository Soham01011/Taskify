import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, ChevronDown, Users, Eye, EyeOff, ClipboardList, Shield } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    interpolate,
    useDerivedValue
} from 'react-native-reanimated';
import { Group, groupApi } from '../../api/groups';
import { useAppTheme } from '@/hooks/use-theme';
import { getStyles } from '@/assets/styles/groupsscreen.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { AppDispatch, RootState } from '../../store';
import { fetchGroups } from '../../store/slices/groupSlice';

interface GroupCardProps {
    group: Group;
}

const GroupTaskItem = ({ t, group, currentUserId, colors }: { t: any, group: Group, currentUserId: string | null, colors: any }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
        try {
            await groupApi.updateTask(group._id, taskId, { completed: !currentStatus });
            if (currentUserId) dispatch(fetchGroups({ userId: currentUserId }));
        } catch (err) {
            console.error('Failed to toggle group task', err);
        }
    };

    return (
        <View style={{ paddingVertical: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleTaskToggle(t._id, t.completed)} style={{ marginRight: 10 }}>
                    {t.completed ? <CheckCircle size={20} color={colors.secondary} /> : <Circle size={20} color={colors.border} />}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 14, color: colors.text, fontWeight: '500' }, t.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>{t.task}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        {t.username ? t.username : 'Unassigned'} • {new Date(t.duedate).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const router = useRouter();
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const progress = useDerivedValue(() => {
        return withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 90 });
    });

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 180}deg` }]
    }));

    const subtasksStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        height: isExpanded ? 'auto' : 0,
        marginTop: interpolate(progress.value, [0, 1], [0, 12]),
    }));

    const completedTasksNum = group.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = group.tasks?.length || 0;
    const progressPercent = totalTasks > 0 ? (completedTasksNum / totalTasks) * 100 : 0;
    const visibleTasks = group.tasks?.filter(t => showCompleted ? true : !t.completed) || [];

    return (
        <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
                style={[styles.groupCard, { flexDirection: 'column', alignItems: 'stretch' }]}
                activeOpacity={0.9}
                onPress={toggleExpand}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.groupIcon}
                        activeOpacity={0.7}
                        onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/group-members-modal?groupId=${group._id}`);
                        }}
                    >
                        <Users size={24} color={colors.white} />
                    </TouchableOpacity>
                    <View style={styles.groupInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            {(group.adminId === currentUserId || (group.adminId as any)?._id === currentUserId) && (
                                <Shield size={14} color={colors.secondary} />
                            )}
                        </View>
                        <View style={styles.groupMeta}>
                            <View style={styles.metaItem}>
                                <Users size={14} color={colors.textSecondary} />
                                <Text style={styles.metaText}>{(group.members?.length || 0) + 1} members</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <ClipboardList size={14} color={colors.textSecondary} />
                                <Text style={styles.metaText}>{completedTasksNum}/{totalTasks} tasks</Text>
                            </View>
                        </View>
                    </View>
                    <Animated.View style={chevronStyle}>
                        <ChevronDown size={24} color={colors.textSecondary} />
                    </Animated.View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Completion</Text>
                        <Text style={styles.progressValue}>{Math.round(progressPercent)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { width: `${progressPercent}%` }
                            ]} 
                        />
                    </View>
                </View>

                <Animated.View style={[styles.subtasksList, subtasksStyle]}>
                    <View style={{ overflow: 'hidden' }}>
                        <View style={styles.divider} />
                        <View style={styles.listHeader}>
                            <Text style={styles.subtaskHeader}>Recent Tasks ({visibleTasks.length})</Text>
                            <TouchableOpacity 
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowCompleted(!showCompleted);
                                }}
                                style={styles.visibilityToggle}
                            >
                                {showCompleted ? <Eye size={16} color={colors.primary} /> : <EyeOff size={16} color={colors.textSecondary} />}
                                <Text style={[styles.visibilityText, showCompleted && { color: colors.primary }]}>
                                    {showCompleted ? 'Showing All' : 'Hiding Done'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {visibleTasks.length === 0 ? (
                            <Text style={styles.emptyTasksText}>No active group tasks.</Text>
                        ) : (
                            visibleTasks.slice(0, 5).map((task) => (
                                <GroupTaskItem 
                                    key={task._id} 
                                    t={task} 
                                    group={group} 
                                    currentUserId={currentUserId} 
                                    colors={colors} 
                                />
                            ))
                        )}
                        
                        <TouchableOpacity 
                            style={styles.viewMoreBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                                router.push(`/group-members-modal?groupId=${group._id}`);
                            }}
                        >
                            <Text style={styles.viewMoreText}>Manage Group & Members</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};
