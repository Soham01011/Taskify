import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Users, Shield, MessageSquare, ChevronDown, CheckSquare, Square, CheckCircle, Circle } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    interpolate,
    useDerivedValue
} from 'react-native-reanimated';
import { Group, groupApi } from '../api/groups';
import { useAppTheme } from '@/hooks/use-theme';
import { getStyles } from '@/assets/styles/groupsscreen.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { AppDispatch, RootState } from '../store';
import { fetchGroups } from '../store/slices/groupSlice';

interface GroupCardProps {
    group: Group;
}

const GroupTaskItem = ({ t, group, currentUserId, colors }: { t: any, group: Group, currentUserId: string | null, colors: any }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
        try {
            await groupApi.updateTask(group._id, taskId, { completed: !currentStatus });
            if (currentUserId) dispatch(fetchGroups(currentUserId));
        } catch (err) {
            console.error('Failed to toggle group task', err);
        }
    };

    const handleSubtaskToggle = async (taskId: string, subtaskId: string, currentStatus: boolean) => {
        try {
            await groupApi.updateSubtask(group._id, taskId, subtaskId, { completed: !currentStatus });
            if (currentUserId) dispatch(fetchGroups(currentUserId));
        } catch (err) {
            console.error('Failed to toggle subtask', err);
        }
    };

    const progress = useDerivedValue(() => withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 90 }));

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 180}deg` }]
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        height: isExpanded ? 'auto' : 0,
        marginTop: interpolate(progress.value, [0, 1], [0, 8]),
    }));

    return (
        <View style={{ backgroundColor: colors.background, padding: 10, borderRadius: 8, marginBottom: 10 }}>
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={t.subtasks && t.subtasks.length > 0 ? 0.7 : 1}
                onPress={() => t.subtasks && t.subtasks.length > 0 && setIsExpanded(!isExpanded)}
            >
                <TouchableOpacity onPress={() => handleTaskToggle(t._id, t.completed)} style={{ marginRight: 10 }}>
                    {t.completed ? <CheckCircle size={20} color={colors.secondary} /> : <Circle size={20} color={colors.border} />}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 15, color: colors.text, fontWeight: '500' }, t.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>{t.task}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                        {t.username ? `Assigned to: ${t.username}` : 'Unassigned'} • Due: {new Date(t.duedate).toLocaleDateString()}
                    </Text>
                </View>
                {t.subtasks && t.subtasks.length > 0 && (
                    <Animated.View style={chevronStyle}>
                        <ChevronDown size={20} color={colors.textSecondary} />
                    </Animated.View>
                )}
            </TouchableOpacity>

            {t.subtasks && t.subtasks.length > 0 && (
                <Animated.View style={[{ overflow: 'hidden' }, contentStyle]}>
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8, marginTop: 4 }} />
                    {t.subtasks.map((st: any, index: number) => (
                        <View key={st._id || `subtask-fallback-${index}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingLeft: 30 }}>
                            <TouchableOpacity onPress={() => st._id && handleSubtaskToggle(t._id, st._id, st.completed)} style={{ marginRight: 8 }}>
                                {st.completed ? <CheckSquare size={16} color={colors.secondary} /> : <Square size={16} color={colors.border} />}
                            </TouchableOpacity>
                            <Text style={[{ flex: 1, fontSize: 13, color: colors.text }, st.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>
                                {st.title}
                            </Text>
                        </View>
                    ))}
                </Animated.View>
            )}
        </View>
    );
};

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);



    const progress = useDerivedValue(() => {
        return withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 90 });
    });

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 180}deg` }]
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        height: isExpanded ? 'auto' : 0,
        marginTop: interpolate(progress.value, [0, 1], [0, 12]),
    }));

    // Calculate completed tasks
    const completedTasksNum = group.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = group.tasks?.length || 0;

    return (
        <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
                style={[styles.groupCard, { flexDirection: 'column', alignItems: 'stretch' }]}
                activeOpacity={0.9}
                onPress={toggleExpand}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.groupIcon}
                        activeOpacity={0.7}
                        onPress={() => router.push(`/group-members-modal?groupId=${group._id}`)}
                    >
                        <Users size={24} color={colors.white} />
                    </TouchableOpacity>
                    <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupDesc} numberOfLines={1}>{group.description}</Text>
                        <View style={styles.groupMeta}>
                            <View style={styles.metaItem}>
                                <Users size={14} color={colors.textSecondary} />
                                <Text style={styles.metaText}>{(group.members?.length || 0) + 1} members</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <MessageSquare size={14} color={colors.textSecondary} />
                                <Text style={styles.metaText}>{completedTasksNum}/{totalTasks} tasks</Text>
                                {totalTasks > 0 && <Animated.View style={[chevronStyle, { marginLeft: 4 }]}><ChevronDown size={14} color={colors.textSecondary} /></Animated.View>}
                            </View>
                        </View>
                    </View>

                    {group.adminId === currentUserId || (group.adminId as any)?._id === currentUserId ? (
                        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                            <View style={styles.adminBadge}>
                                <Shield size={12} color={colors.secondary} />
                                <Text style={styles.adminText}>Admin</Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                {totalTasks > 0 && (
                    <Animated.View style={[{ overflow: 'hidden' }, contentStyle]}>
                        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 }}>Group Tasks</Text>
                        {group.tasks.map((t) => (
                            <GroupTaskItem key={t._id} t={t} group={group} currentUserId={currentUserId} colors={colors} />
                        ))}
                    </Animated.View>
                )}
            </TouchableOpacity>
        </View>
    );
};
