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

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
        try {
            await groupApi.updateTask(group._id, taskId, { completed: !currentStatus });
            if (currentUserId) dispatch(fetchGroups(currentUserId));
        } catch (err) {
            console.error('Failed to toggle group task', err);
        }
    };

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
                            <View key={t._id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: colors.background, padding: 10, borderRadius: 8 }}>
                                <TouchableOpacity onPress={() => handleTaskToggle(t._id, t.completed)} style={{ marginRight: 10 }}>
                                    {t.completed ? <CheckCircle size={20} color={colors.secondary} /> : <Circle size={20} color={colors.border} />}
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Text style={[{ fontSize: 15, color: colors.text, fontWeight: '500' }, t.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>{t.task}</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                        {t.username ? `Assigned to: ${t.username}` : 'Unassigned'} • Due: {new Date(t.duedate).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </Animated.View>
                )}
            </TouchableOpacity>
        </View>
    );
};
