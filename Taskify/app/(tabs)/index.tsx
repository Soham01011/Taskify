import React, { useCallback, useMemo } from 'react';
import {
    SectionList,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    View,
    TouchableOpacity,
    Text,
    useWindowDimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Settings, Zap, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import Animated, {
    FadeInUp,
    ZoomIn,
    ZoomOut,
    FadeOut
} from 'react-native-reanimated';

import { TaskCard } from '@/src/components/Tasks/TaskCard';
import { CreateTaskForm } from '@/src/components/Tasks/CreateTaskForm';
import { useTasks } from '@/src/hooks/useTasks';
import { useAppTheme } from '@/hooks/use-theme';
import { getStyles } from '@/assets/styles/mainscreen.styles';
import { SPACING } from '@/src/constants/theme';

export default function TaskDashboard() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);

    const {
        tasks,
        groups,
        refreshing,
        isCreating,
        setIsCreating,
        onRefresh,
        handleComplete,
        loadTasks
    } = useTasks();

    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);

    // Filter Tasks for Overdue, Today & Tomorrow
    const displaySections = useMemo(() => {
        const now = new Date();
        const getLocalDateStr = (d: Date) => {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        const todayStr = getLocalDateStr(now);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = getLocalDateStr(tomorrow);

        const overdueTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDateStr = getLocalDateStr(new Date(t.dueDate));
            return taskDateStr < todayStr && !t.completed;
        });
        const todayTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            return getLocalDateStr(new Date(t.dueDate)) === todayStr;
        });
        const tomorrowTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            return getLocalDateStr(new Date(t.dueDate)) === tomorrowStr;
        });

        const sections = [];
        if (overdueTasks.length > 0) sections.push({ title: 'Overdue', data: overdueTasks });
        if (todayTasks.length > 0) sections.push({ title: 'Today', data: todayTasks });
        if (tomorrowTasks.length > 0) sections.push({ title: 'Tomorrow', data: tomorrowTasks });
        
        return sections;
    }, [tasks]);

    const todayCount = useMemo(() => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            return `${new Date(t.dueDate).getFullYear()}-${String(new Date(t.dueDate).getMonth() + 1).padStart(2, '0')}-${String(new Date(t.dueDate).getDate()).padStart(2, '0')}` === todayStr && !t.completed;
        }).length;
    }, [tasks]);

    const activeGroups = useMemo(() => {
        return groups.slice(0, 2).map(group => {
            const total = group.tasks?.length || 0;
            const completed = group.tasks?.filter(t => t.completed).length || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { ...group, progress };
        });
    }, [groups]);

    const renderHeader = () => (
        <View>
            {/* Header Greeting */}
            <View style={styles.headerSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.greeting}>Hello, {currentUser?.username || 'Soham D'}</Text>
                    <TouchableOpacity onPress={() => router.push('/profile')}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                            <Settings size={22} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>
                <Text style={styles.summary}>You have {todayCount} tasks to finish today.</Text>
            </View>

            {/* Active Groups Section */}
            {activeGroups.length > 0 && (
                <View style={styles.activeSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/groups' as any)}>
                            <Text style={styles.seeAll}>SEE ALL</Text>
                        </TouchableOpacity>
                    </View>
                    {activeGroups.map((group, index) => (
                        <Animated.View
                            key={group._id}
                            entering={FadeInUp.delay(index * 100).duration(500)}
                            style={styles.groupCard}
                        >
                            <View style={styles.groupCardHeader}>
                                <Text style={styles.groupTitle} numberOfLines={1}>{group.name}</Text>
                                <Zap size={20} color={colors.primary} fill={colors.primary} />
                            </View>
                            <Text style={styles.groupDescription} numberOfLines={2}>
                                {group.description || 'No description provided for this group.'}
                            </Text>

                            <View style={styles.progressLabelRow}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressValue}>{group.progress}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${group.progress}%` }]} />
                            </View>
                        </Animated.View>
                    ))}
                </View>
            )}

        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <SectionList
                sections={displaySections}
                renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: SPACING.lg }}>
                        <TaskCard
                            task={item}
                            onPress={() => { }}
                            onComplete={handleComplete}
                        />
                    </View>
                )}
                renderSectionHeader={({ section: { title, data } }) => (
                    <View style={[styles.tasksSection, { paddingBottom: SPACING.sm, backgroundColor: colors.background }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{data.length} TASKS</Text>
                            </View>
                        </View>
                    </View>
                )}
                stickySectionHeadersEnabled={false}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AlertTriangle size={48} color={colors.textSecondary} opacity={0.5} />
                        <Text style={styles.emptyText}>No tasks for today or tomorrow.{"\n"}If you have free time then check on your ideas</Text>
                    </View>
                }
            />

            {/* Fluid FAB to Modal Morph */}
            {!isCreating ? (
                <Animated.View
                    key="fab-container"
                    entering={ZoomIn.duration(400).springify()}
                    exiting={ZoomOut.duration(300).springify()}
                    style={[styles.fab, { zIndex: 99 }]}
                >
                    <TouchableOpacity
                        style={styles.fabTouch}
                        onPress={() => setIsCreating(true)}
                        activeOpacity={0.6}
                    >
                        <Plus size={32} color={colors.white} />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Animated.View
                    key="modal-container"
                    exiting={FadeOut.duration(400)}
                    style={[styles.compactModalContainer, { zIndex: 100 }]}
                    pointerEvents="box-none"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <CreateTaskForm
                            onSuccess={() => {
                                setIsCreating(false);
                                loadTasks();
                            }}
                            onCancel={() => setIsCreating(false)}
                        />
                    </KeyboardAvoidingView>
                </Animated.View>
            )}

            {/* Background Overlay when creating */}
            {isCreating && (
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setIsCreating(false)}
                        activeOpacity={1}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
