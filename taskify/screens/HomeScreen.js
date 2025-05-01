import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ScrollView, RefreshControl, Animated, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

    loadTokenAndFetchTasks();
  }, []);

  const loadTokenAndFetchTasks = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        await fetchTasks(savedToken);
      } else {
        Alert.alert('No token found', 'Please login again.');
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  };

  const fetchTasks = async (authToken) => {
    try {
      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/tasks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      } else {
        console.error('Error fetching tasks:', data.message);
        Alert.alert('Failed to fetch tasks: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Failed to fetch tasks');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await fetchTasks(token);
    }
    setRefreshing(false);
  };

  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const taskDue = new Date(dueDate);
    return taskDue < nowIST;
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
    <Animated.View style={{ flex: 1, backgroundColor: '#000', padding: 16, paddingTop: windowHeight * 0.05, opacity: fadeAnim }}>
      <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 16 }}>
        Today
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
        {tasks.map((task, index) => {
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
  );
}
