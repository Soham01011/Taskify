import { BlurTargetView } from 'expo-blur';
import { AlertTriangle, Plus } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getStyles } from '@/assets/styles/mainscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { AppHeader } from '@/src/components/AppHeader';
import { BlurBackdrop } from '@/src/components/BlurBackdrop';
import { GenieAnimation } from '@/src/components/GenieAnimation';
import { ActiveSchedule } from '@/src/components/Schedule/ActiveSchedule';
import { CreateTaskForm } from '@/src/components/Tasks/CreateTaskForm';
import { TaskCard } from '@/src/components/Tasks/TaskCard';
import { SPACING } from '@/src/constants/theme';
import { useTasks } from '@/src/hooks/useTasks';
import { getTasksForDate } from '@/src/utils/calendar';

export default function TaskDashboard() {
    const { colors, isDark } = useAppTheme();
    const styles = getStyles(colors);

    const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

    const {
        tasks,
        refreshing,
        isCreating,
        setIsCreating,
        onRefresh,
        handleComplete,
        loadTasks
    } = useTasks();

    const effectiveTasks = tasks;
    const blurTargetRef = useRef<View | null>(null);

    const [modalVisible, setModalVisible] = useState(false);

    // when opening:
    const openCreate = () => {
        setModalVisible(true);
        setIsCreating(true);
    };

    // when closing:
    const closeCreate = () => {
        setIsCreating(false);   // triggers exiting=true below
        // modalVisible stays true until onExited fires
    };

    // Filter tasks based on selected date (with recurrence) or today/tomorrow
    const displaySections = useMemo(() => {
        const now = new Date();

        const isSameCalendarDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);

        const isRecurring = (t: any) =>
            !!(t.recurrence && t.recurrence.frequency && t.recurrence.frequency !== 'none');

        const overdueTasks = effectiveTasks.filter((t: any) => {
            if (!t.dueDate || t.completed || isRecurring(t)) return false;
            return new Date(t.dueDate) < startOfToday;
        });

        const isTodaySelected = isSameCalendarDay(selectedDate, now);

        if (!isTodaySelected) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dateTasks = getTasksForDate(selectedDate, effectiveTasks);
            const title = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} Tasks`;
            const sections: any[] = [];
            if (overdueTasks.length > 0) sections.push({ title: 'Overdue', data: overdueTasks });
            sections.push({ title, data: dateTasks });
            return sections;
        }

        const todayTasks = getTasksForDate(now, effectiveTasks);
        const tomorrowTasks = getTasksForDate(tomorrow, effectiveTasks);
        const upcomingTasks = effectiveTasks.filter((t: any) => {
            if (!t.dueDate || t.completed || isRecurring(t)) return false;
            return new Date(t.dueDate) > endOfTomorrow;
        });

        const sections: any[] = [];
        if (overdueTasks.length > 0) sections.push({ title: 'Overdue', data: overdueTasks });
        if (todayTasks.length > 0) sections.push({ title: 'Today', data: todayTasks });
        if (tomorrowTasks.length > 0) sections.push({ title: 'Tomorrow', data: tomorrowTasks });
        if (upcomingTasks.length > 0) sections.push({ title: 'Upcoming', data: upcomingTasks });

        if (sections.length === 0 && effectiveTasks.length > 0) {
            sections.push({ title: 'All Tasks', data: effectiveTasks });
        }

        return sections;
    }, [effectiveTasks, selectedDate]);



    const renderHeader = () => (
        <View>
            <AppHeader />

            {/* Active Schedule */}
            <ActiveSchedule
                tasks={effectiveTasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
            />
        </View>
    );


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
                <SectionList
                    sections={displaySections}
                    renderItem={({ item }) => (
                        <View style={{ paddingHorizontal: SPACING.lg }}>
                            <TaskCard task={item} onPress={() => { }} onComplete={handleComplete} />
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
                    keyExtractor={(item, index) => `${item._id}-${item.dueDate || index}`}
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
                            <Text style={styles.emptyText}>
                                No tasks for today or tomorrow.{'\n'}
                                If you have free time then check on your ideas
                            </Text>
                        </View>
                    }
                />
            </BlurTargetView>

            {!modalVisible && (
                <Animated.View
                    key="fab-container"
                    entering={ZoomIn.duration(400).springify()}
                    exiting={ZoomOut.duration(300).springify()}
                    style={[styles.fab, { zIndex: 99 }]}
                >
                    <TouchableOpacity
                        style={styles.fabTouch}
                        onPress={openCreate}
                        activeOpacity={0.6}
                    >
                        <Plus size={32} color={colors.white} />
                    </TouchableOpacity>
                </Animated.View>
            )}

            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={closeCreate}
                statusBarTranslucent
            >
                <View style={{ flex: 1 }}>
                    {/* Animated blur backdrop */}
                    <BlurBackdrop
                        visible={isCreating}          // <- drives the animation
                        target={blurTargetRef}
                        tint={isDark ? 'dark' : 'default'}
                        maxIntensity={50}
                        duration={250}
                    />

                    {/* Tap-to-close layer */}
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={closeCreate}
                        activeOpacity={1}
                    />

                    {/* Form */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        keyboardVerticalOffset={0}
                        style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 16 : 8 }}
                        pointerEvents="box-none"
                    >
                        <GenieAnimation
                            exiting={!isCreating}
                            onExited={() => setModalVisible(false)}
                        >
                            <CreateTaskForm onSuccess={closeCreate} onCancel={closeCreate} />
                        </GenieAnimation>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
