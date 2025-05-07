import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Dimensions, ScrollView, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import fetchTasks from '../funcitonModules/fetchTasks'; 
import { getCachedTasks } from '../funcitonModules/taskStorage';
import loadTokenAndFetchTasks from '../funcitonModules/loadTokenAndFetchTasks';

import BottomNavBar from '../modules/BottomNavBar';

const { height: windowHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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
        Animated.timing(pulseAnim, { toValue: 0.97, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    const loadCachedTasks = async () => {
      const cached = await getCachedTasks();
      if (cached) {
        setTasks(cached);
      }
      const result = await loadTokenAndFetchTasks();
      if (result.tasks) {
        setTasks(result.tasks);
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
      console.error('Error refreshing tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterTodayAndOverdueTasks = (tasks) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(startOfToday.getDate() + 1);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate < endOfToday;
    });
  };

  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));
    return new Date(dueDate) < nowIST;
  };

  const handleAddTaskPress = () => {
    // Animate button to expand
    Animated.timing(buttonScale, {
      toValue: 50,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      navigation.navigate('AddTask');
      buttonScale.setValue(1); // reset after navigation
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 16, paddingTop: windowHeight * 0.05 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 16 }}>
          Today & Overdue
        </Text>
        <TextInput
          placeholder="Search tasks..."
          placeholderTextColor="#aaa"
          style={{
            backgroundColor: '#111',
            padding: 12,
            borderRadius: 12,
            color: 'white',
            marginBottom: 24,
          }}
        />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }
        >
          {filterTodayAndOverdueTasks(tasks).map((task, index) => {
            const overdue = isTaskOverdue(task.dueDate);
            const gradientColors = overdue
              ? ['#FF0000', '#FF7F50'] // Red to Orange
              : ['#0B2F9F', '#7CF5FF']; // Normal Blue Gradient

            return (
              <Animated.View
                key={task._id || index}
                style={{ transform: [{ scale: overdue ? pulseAnim : 1 }], marginBottom: 20 }}
              >
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    padding: 2,
                  }}
                >
                  <View style={{ backgroundColor: '#000', borderRadius: 14, padding: 16 }}>
                    {/* Title */}
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
                      {task.title}
                    </Text>

                    {/* Description inside grey box */}
                    {task.description && (
                      <View style={{
                        backgroundColor: '#222',
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 10,
                      }}>
                        <Text style={{ color: '#bbb', fontSize: 14 }}>
                          {task.description}
                        </Text>
                      </View>
                    )}

                    {/* Tags */}
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {task.tags && task.tags.map((tag, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: '#222',
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: '#bbb', fontSize: 12 }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}
          <TouchableOpacity onPress={handleAddTaskPress} activeOpacity={0.8}>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
      <BottomNavBar />
    </View>
  );
}
