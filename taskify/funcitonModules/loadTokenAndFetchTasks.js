import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchTasks from './fetchTasks';
import { Alert } from 'react-native';

const loadTokenAndFetchTasks = async () => {
  try {
    const savedToken = await AsyncStorage.getItem('token');
    if (savedToken) {
      const tasks = await fetchTasks(savedToken, true); // Force fetch on refresh
      return { tasks, token: savedToken };
    } else {
      Alert.alert('No token found', 'Please login again.');
      return { tasks: null, token: null };
    }
  } catch (error) {
    console.error('Error loading token:', error);
    return { tasks: null, token: null };
  }
};

export default loadTokenAndFetchTasks;