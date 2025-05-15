import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const handleMarkComplete = async (taskId, subtaskTitle = null, onSuccess) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      Alert.alert('Error', 'Please login again');
      return;
    }

    const response = await fetch(`https://taskify-eight-kohl.vercel.app/api/tasks/complete/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subtaskTitle })
    });

    if (!response.ok) {
      throw new Error('Failed to mark task as complete');
    }

    const data = await response.json();
    
    if (onSuccess) {
      onSuccess(data);
    }

    return data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    Alert.alert('Error', 'Failed to mark task as complete');
    throw error;
  }
};

export default handleMarkComplete;