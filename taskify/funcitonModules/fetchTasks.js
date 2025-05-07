import { Alert } from 'react-native';
import { storeTasks, getCachedTasks } from './taskStorage';
import { refreshTokens } from '../modules/tokenServices.js';

const fetchTasks = async (authToken, forceFetch = false) => {
  try {
    if (!forceFetch) {
      const cachedTasks = await getCachedTasks();
      if (cachedTasks) return cachedTasks;
    }

    let response = await fetch('https://taskify-eight-kohl.vercel.app/api/tasks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      const newToken = await refreshTokens();
      if (newToken) {
        response = await fetch('https://taskify-eight-kohl.vercel.app/api/tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Refresh failed, user needs to login again
        throw new Error('Session expired');
      }
    }

    const data = await response.json();

    if (response.ok) {
      await storeTasks(data);
      return data;
    } else {
      console.error('Error fetching tasks:', data.message);
      Alert.alert('Failed to fetch tasks: ' + (data.message || 'Unknown error'));
      return null;
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    if (error.message === 'Session expired') {
      Alert.alert('Session expired', 'Please login again');
      // Handle navigation to login screen
    } else {
      Alert.alert('Failed to fetch tasks');
    }
    return null;
  }
};

export default fetchTasks;