import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../modules/BottomNavBar';
import loadTokenAndFetchTasks from '../funcitonModules/loadTokenAndFetchTasks';
import { getCachedTasks } from '../funcitonModules/taskStorage';

const UpcomingScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load tasks from cache first, then fetch from API
  useEffect(() => {
    const loadInitialTasks = async () => {
      // Try to get cached tasks first
      const cachedTasks = await getCachedTasks();
      if (cachedTasks) {
        setTasks(cachedTasks);
      }
      
      // Then fetch fresh tasks
      const result = await loadTokenAndFetchTasks();
      if (result.tasks) {
        setTasks(result.tasks);
      }
    };

    loadInitialTasks();
  }, []);

  const filterUpcomingTasks = (tasks) => {
    const now = new Date();
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    return tasks
      .filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) >= startOfTomorrow;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await loadTokenAndFetchTasks();
      if (result.tasks) {
        setTasks(result.tasks);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Upcoming Tasks</Text>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#7CF5FF"
            colors={['#7CF5FF']}
            progressBackgroundColor="#222"
          />
        }
      >
        {filterUpcomingTasks(tasks).map((task, index) => (
          <View key={task._id || index} style={styles.taskContainer}>
            <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
            <LinearGradient
              colors={['#0B2F9F', '#7CF5FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBorder}
            >
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.description && (
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{task.description}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        ))}

        
      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    paddingTop: 40,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  taskContainer: {
    marginBottom: 20,
  },
  dateText: {
    color: '#7CF5FF',
    fontSize: 16,
    marginBottom: 8,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
  },
  taskContent: {
    backgroundColor: '#000',
    borderRadius: 14,
    padding: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  descriptionBox: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  descriptionText: {
    color: '#bbb',
    fontSize: 14,
  }
});

export default UpcomingScreen;