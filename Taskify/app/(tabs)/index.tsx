import React, { useCallback } from 'react';
import {
    FlatList,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DashboardToolbar } from '@/src/components/Tasks/Dashboard/Toolbar';
import { EmptyDashboardState } from '@/src/components/Tasks/Dashboard/EmptyState';
import Animated, {
    FadeOut,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CreateTaskForm } from '@/src/components/Tasks/CreateTaskForm';
import { TaskCard } from '@/src/components/Tasks/TaskCard';
import { AppHeader } from '@/src/components/AppHeader';
import { useTasks } from '@/src/hooks/useTasks';
import { useAppTheme } from '@/hooks/use-theme';
import { getStyles } from '@/assets/styles/mainscreen.styles';
import { Task } from '@/src/api/tasks';

export default function TaskDashboard() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    
    const {
        tasks,
        isLoading,
        refreshing,
        isCreating,
        filter,
        sortOrder,
        pendingGroupTasks,
        ideas,
        setIsCreating,
        setFilter,
        toggleSort,
        loadMoreTasks,
        onRefresh,
        handleComplete,
        loadTasks
    } = useTasks();

    const renderTaskItem = useCallback(({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            onPress={(task) => console.log('Task pressed', task._id)}
            onComplete={handleComplete}
        />
    ), [handleComplete]);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />

            <DashboardToolbar
                filter={filter}
                setFilter={setFilter}
                sortOrder={sortOrder}
                toggleSort={toggleSort}
                colors={colors}
                styles={styles}
            />

            <FlatList
                data={tasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMoreTasks}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <EmptyDashboardState
                        filter={filter}
                        pendingGroupTasks={pendingGroupTasks}
                        ideas={ideas}
                        colors={colors}
                        styles={styles}
                        onSeeGroups={() => router.push('/(tabs)/groups' as any)}
                        onExploreIdeas={() => router.push('/(tabs)/ideas' as any)}
                    />
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
                        onPress={() => setTimeout(() => setIsCreating(true), 100)}
                        activeOpacity={0.6}
                    >
                        <Plus size={28} color={colors.white} />
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
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
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
