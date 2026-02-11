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
import { Plus, Filter, Users, X } from 'lucide-react-native';
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
import { CreateTaskForm } from '@/src/components/CreateTaskForm';

import { RootState, AppDispatch } from '@/src/store';
import { fetchTasks, updateTask } from '@/src/store/slices/taskSlice';

import { taskApi, Task } from '@/src/api/tasks';
import { TaskCard } from '@/src/components/TaskCard';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { styles } from '@/assets/styles/mainscreen.styles';

import { AppHeader } from '@/src/components/AppHeader';

export default function TaskDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, pagination } = useSelector((state: RootState) => state.tasks);
  const { currentUserId } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    try {
      // Find the most recent task to sync updates
      const latestTask = tasks.length > 0
        ? [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      if (latestTask?.created_at) {
        await dispatch(fetchTasks({ created_at: latestTask.created_at }));
      } else {
        await dispatch(fetchTasks({ pageNumber: 1, pageSize: 15 }));
      }
    } catch (err) {
      console.log('Incremental sync failed, doing full refresh', err);
      await dispatch(fetchTasks({ pageNumber: 1, pageSize: 15 }));
    } finally {
      setRefreshing(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await taskApi.complete(id);
      dispatch(updateTask(response.data));
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };



  const handleTaskPress = (task: Task) => {
    // Navigate to details if implemented
    console.log('Task pressed', task._id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />


      <View style={styles.toolbar}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>All Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Groups</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={handleTaskPress}
            onComplete={handleComplete}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found. Create one!</Text>
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
            <Plus size={28} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View
          key="modal-container"
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



