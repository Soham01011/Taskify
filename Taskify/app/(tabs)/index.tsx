import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Filter, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { RootState, AppDispatch } from '@/src/store';
import { fetchTasks } from '@/src/store/slices/taskSlice';
import { taskApi, Task } from '@/src/api/tasks';
import { TaskCard } from '@/src/components/TaskCard';
import { COLORS } from '@/src/constants/theme';
import { styles } from '@/assets/styles/mainscreen.styles';

import { AppHeader } from '@/src/components/AppHeader';

export default function TaskDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const { currentUserId } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(() => {
    if (currentUserId) {
      dispatch(fetchTasks());
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  };

  const handleComplete = async (id: string) => {
    try {
      await taskApi.complete(id);
      dispatch(fetchTasks());
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found. Create one!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modal')} // Using modal for task creation
      >
        <Plus size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

