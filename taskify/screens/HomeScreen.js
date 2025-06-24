import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { fetchuserTasks } from '../modules/fetchUserTasks'; // Adjust if needed

import AddTaskButton from '../components/addTask';


export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchuserTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id} // MongoDB's _id
        renderItem={renderTaskItem}
      />
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
    textAlign: 'center',
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
