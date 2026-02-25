import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Filter, Users, X, ArrowUp, ArrowDown, ListFilter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  ZoomIn,
  ZoomOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { CreateTaskForm } from '@/src/components/CreateTaskForm';
import { useMemo } from 'react';

import { RootState, AppDispatch } from '@/src/store';
import { fetchTasks, updateTask } from '@/src/store/slices/taskSlice';

import { taskApi, Task } from '@/src/api/tasks';
import { TaskCard } from '@/src/components/TaskCard';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { getStyles } from '@/assets/styles/mainscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';

import { AppHeader } from '@/src/components/AppHeader';

export default function TaskDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);
  const { tasks, isLoading, pagination } = useSelector((state: RootState) => state.tasks);
  const { currentUserId } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'active' | 'due' | 'upcoming' | 'completed'>('active');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Apply Filter
    if (filter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'due') {
      result = result.filter(t => !t.completed && new Date(t.dueDate) <= endOfToday);
    } else if (filter === 'upcoming') {
      result = result.filter(t => !t.completed && new Date(t.dueDate) > endOfToday);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // Apply Sort
    result.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [tasks, filter, sortOrder]);

  const loadTasks = useCallback((page = 1) => {
    if (currentUserId) {
      dispatch(fetchTasks({ pageNumber: page, pageSize: 15 }));
    }
  }, [currentUserId, dispatch]);

  const loadMoreTasks = () => {
    if (!isLoading && pagination && pagination.currentPage < pagination.totalPages) {
      dispatch(fetchTasks({
        pageNumber: pagination.currentPage + 1,
        pageSize: pagination.pageSize
      }));
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);

    // Find the most recent task to sync updates
    let latestTaskCreatedAt = null;
    if (tasks.length > 0) {
      const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (sortedTasks.length > 0) {
        latestTaskCreatedAt = sortedTasks[0].created_at;
      }
    }

    try {
      if (latestTaskCreatedAt) {
        await dispatch(fetchTasks({ created_at: latestTaskCreatedAt }));
      } else {
        await dispatch(fetchTasks({ pageNumber: 1, pageSize: 15 }));
      }
      setRefreshing(false);
    } catch (err) {
      console.log('Incremental sync failed, doing full refresh', err);
      await dispatch(fetchTasks({ pageNumber: 1, pageSize: 15 }));
      setRefreshing(false);
    }
  };

  const handleComplete = useCallback(async (id: string) => {
    try {
      const response = await taskApi.complete(id);
      dispatch(updateTask(response.data));
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  }, [dispatch]);

  const handleTaskPress = useCallback((task: Task) => {
    // Navigate to details if implemented
    console.log('Task pressed', task._id);
  }, []);

  const renderTaskItem = useCallback(({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={handleTaskPress}
      onComplete={handleComplete}
    />
  ), [handleTaskPress, handleComplete]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />


      <View style={styles.toolbar}>
        <View style={{ flex: 1 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {[
              { id: 'active', label: 'Active' },
              { id: 'due', label: 'Due' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' }
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filterChip,
                  filter === item.id && styles.activeFilterChip
                ]}
                onPress={() => setFilter(item.id as any)}
              >
                <Text style={[
                  styles.filterChipText,
                  filter === item.id && styles.activeFilterChipText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          <Text style={styles.sortText}>Time</Text>
          {sortOrder === 'asc' ? (
            <ArrowUp size={14} color={colors.primary} />
          ) : (
            <ArrowDown size={14} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAndSortedTasks}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'completed' ? 'No completed tasks.' : 'No tasks found.'}
            </Text>
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
            onPress={() => {
              // Slight delay to let the tap animation (dip) finish
              setTimeout(() => setIsCreating(true), 100);
            }}
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
            behavior={Platform.OS === 'android' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 40}
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
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.overlay}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setIsCreating(false)}
            activeOpacity={1}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}



