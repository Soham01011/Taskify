import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { fetchuserTasks } from '../modules/fetchUserTasks';
import AddTaskButton from '../components/addTask';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await fetchuserTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      {item.description ? <Text>Description: {item.description}</Text> : null}
      <Text>Priority: {item.priority}</Text>
      <Text>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}</Text>
      <Text>Group: {item.group}</Text>
      {item.subtasks && item.subtasks.length > 0 && (
        <View style={styles.subtaskContainer}>
          <Text style={styles.subtaskHeader}>Subtasks:</Text>
          {item.subtasks.map((subtask) => (
            <View key={subtask._id} style={styles.subtaskItem}>
              <Text>- {subtask.title} ({subtask.completed ? 'Completed' : 'Pending'})</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // AddTaskButton handler (refresh tasks after adding)
  const handleAddTask = async (taskData) => {
    // TODO: Add your API call to create the task here
    // After successful creation, reload tasks:
    await loadTasks();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTaskItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {/* Floating Add Task Button */}
      <AddTaskButton onAddTask={handleAddTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  taskItem: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtaskContainer: {
    marginTop: 10,
  },
  subtaskHeader: {
    fontWeight: 'bold',
  },
  subtaskItem: {
    paddingLeft: 10,
  },
});
