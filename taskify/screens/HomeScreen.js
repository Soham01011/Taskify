import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import fetchTasks from "../funcitonModules/fetchTasks";
import { getCachedTasks } from "../funcitonModules/taskStorage";
import loadTokenAndFetchTasks from "../funcitonModules/loadTokenAndFetchTasks";

import BottomNavBar from "../modules/BottomNavBar";
import TaskCard from "../modules/TaskCard";
import handleMarkComplete from "../modules/markTask";
const { height: windowHeight } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.97,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const loadCachedTasks = async () => {
      const cached = await getCachedTasks();
      if (cached) {
        setTasks(cached.personalTasks || []);
        setGroupTasks(cached.groupTasks || []);
      }
      const result = await loadTokenAndFetchTasks();
      if (result.tasks) {
        setTasks(result.tasks.personalTasks || []);
        setGroupTasks(result.tasks.groupTasks || []);
        setToken(result.token);
      }
    };
    loadCachedTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await loadTokenAndFetchTasks();
      if (result.tasks) {
        setTasks(result.tasks);
        setToken(result.token);
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterTodayAndOverdueTasks = (personalTasks, groupTasks) => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(startOfToday.getDate() + 1);

    const filterTask = (task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate < endOfToday;
    };

    const filteredPersonalTasks = personalTasks.filter(filterTask);
    const filteredGroupTasks = groupTasks.filter(filterTask);

    return [...filteredPersonalTasks, ...filteredGroupTasks].sort((a, b) => 
      new Date(a.dueDate) - new Date(b.dueDate)
    );
  };

  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000);
    return new Date(dueDate) < nowIST;
  };

  const handleAddTaskPress = () => {
    // Animate button to expand
    Animated.timing(buttonScale, {
      toValue: 50,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      navigation.navigate("AddTask");
      buttonScale.setValue(1); // reset after navigation
    });
  };

  const onTaskComplete = async (taskId, subtaskId = null) => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      await handleMarkComplete(taskId, subtaskId, (updatedTask) => {
        // Update the tasks state with the completed task
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task._id === taskId) {
              if (subtaskId) {
                // Update subtask
                return {
                  ...task,
                  subtasks: task.subtasks.map(subtask => 
                    subtask._id === subtaskId 
                      ? { ...subtask, completed: true }
                      : subtask
                  )
                };
              }
              // Update main task
              return { ...task, completed: true };
            }
            return task;
          })
        );
      });
    } catch (error) {
      console.error('Error in onTaskComplete:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Today & Overdue</Text>
        <TextInput
          placeholder="Search tasks..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
      >
        {filterTodayAndOverdueTasks(tasks, groupTasks).map((task, index) => (
          <TaskCard
            key={task._id || index}
            task={task}
            pulseAnim={pulseAnim}
            isOverdue={isTaskOverdue(task.dueDate)}
            onComplete={onTaskComplete}
            isCompleting={isCompleting}
          />
        ))}
      </ScrollView>

      <TouchableOpacity 
        onPress={handleAddTaskPress} 
        activeOpacity={0.8}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <BottomNavBar />
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: windowHeight * 0.05,
    backgroundColor: "#000",
    zIndex: 1,
  },
  headerText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
    color: "white",
    marginBottom: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 80, // Adjust based on your bottom nav height
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3D90D7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#7CF5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  addButtonText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "bold",
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    zIndex: 1,
  }
};
