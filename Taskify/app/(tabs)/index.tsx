import React, { useEffect, useReducer, useCallback, useRef } from 'react';
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
import { fetchTasks, updateTask, selectUnifiedTasks } from '@/src/store/slices/taskSlice';

import { taskApi, Task, FetchTasksParams } from '@/src/api/tasks';
import { TaskCard } from '@/src/components/TaskCard';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { getStyles } from '@/assets/styles/mainscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';

import { AppHeader } from '@/src/components/AppHeader';

type DashboardState = {
  refreshing: boolean;
  isCreating: boolean;
  filter: 'active' | 'due' | 'upcoming' | 'completed';
  sortOrder: 'asc' | 'desc';
  lastParams: FetchTasksParams;
};

type DashboardAction =
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_IS_CREATING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: DashboardState['filter'] }
  | { type: 'SET_SORT_ORDER'; payload: DashboardState['sortOrder'] }
  | { type: 'SET_LAST_PARAMS'; payload: FetchTasksParams };

const dashboardInitialState: DashboardState = {
  refreshing: false,
  isCreating: false,
  filter: 'active',
  sortOrder: 'asc',
  lastParams: { pageNumber: 1, pageSize: 15 },
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_REFRESHING': return { ...state, refreshing: action.payload };
    case 'SET_IS_CREATING': return { ...state, isCreating: action.payload };
    case 'SET_FILTER': return { ...state, filter: action.payload };
    case 'SET_SORT_ORDER': return { ...state, sortOrder: action.payload };
    case 'SET_LAST_PARAMS': return { ...state, lastParams: action.payload };
    default: return state;
  }
}

export default function TaskDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);
  const { isLoading, pagination } = useSelector((state: RootState) => state.tasks);
  const tasks = useSelector(selectUnifiedTasks);
  const { currentUserId } = useSelector((state: RootState) => state.auth);

  const [state, dashboardDispatch] = useReducer(dashboardReducer, dashboardInitialState);
  const { refreshing, isCreating, filter, sortOrder, lastParams } = state;
  
  const hasAttemptedInitialSync = useRef(false);

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

  const loadTasks = useCallback((params: FetchTasksParams = { pageNumber: 1, pageSize: 15 }) => {
    if (currentUserId) {
      dashboardDispatch({ type: 'SET_LAST_PARAMS', payload: params });
      dispatch(fetchTasks(params));
    }
  }, [currentUserId, dispatch]);

  const loadMoreTasks = () => {
    if (!isLoading && pagination && pagination.currentPage < pagination.totalPages) {
      loadTasks({
        ...lastParams,
        pageNumber: pagination.currentPage + 1,
      });
    }
  };

  const getLatestTimestamp = useCallback(() => {
    if (tasks.length === 0) return null;
    return tasks.reduce((latest, task) => {
      if (!task.created_at) return latest;
      const taskTime = new Date(task.created_at).getTime();
      const latestTime = new Date(latest).getTime();
      return taskTime > latestTime ? task.created_at : latest;
    }, tasks[0].created_at);
  }, [tasks]);

  useEffect(() => {
    if (currentUserId && !hasAttemptedInitialSync.current) {
      hasAttemptedInitialSync.current = true;
      const latest = getLatestTimestamp();
      if (latest) {
        loadTasks({ created_at: latest, pageNumber: 1, pageSize: 15 });
      } else {
        loadTasks({ pageNumber: 1, pageSize: 15 });
      }
    }
  }, [currentUserId, loadTasks, getLatestTimestamp]);

  const onRefresh = async () => {
    dashboardDispatch({ type: 'SET_REFRESHING', payload: true });
    const latest = getLatestTimestamp();

    try {
      if (latest) {
        await dispatch(fetchTasks({ created_at: latest, pageNumber: 1, pageSize: 15 })).unwrap();
      } else {
        await dispatch(fetchTasks({ pageNumber: 1, pageSize: 15 })).unwrap();
      }
      dashboardDispatch({ type: 'SET_REFRESHING', payload: false });
    } catch (err) {
      console.log('Sync failed, doing full refresh', err);
      loadTasks({ pageNumber: 1, pageSize: 15 });
      dashboardDispatch({ type: 'SET_REFRESHING', payload: false });
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
                onPress={() => dashboardDispatch({ type: 'SET_FILTER', payload: item.id as any })}
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
          onPress={() => dashboardDispatch({ type: 'SET_SORT_ORDER', payload: sortOrder === 'asc' ? 'desc' : 'asc' })}
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
              setTimeout(() => dashboardDispatch({ type: 'SET_IS_CREATING', payload: true }), 100);
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
                dashboardDispatch({ type: 'SET_IS_CREATING', payload: false });
                loadTasks();
              }}
              onCancel={() => dashboardDispatch({ type: 'SET_IS_CREATING', payload: false })}
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
            onPress={() => dashboardDispatch({ type: 'SET_IS_CREATING', payload: false })}
            activeOpacity={1}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}



