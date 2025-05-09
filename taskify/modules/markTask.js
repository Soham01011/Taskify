import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const handleMarkComplete = async (taskId, subtaskId = null, onSuccess) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      Alert.alert('Error', 'Please login again');
      return;
    }

    // Create the endpoint URL based on whether we have a subtaskId
    const endpoint = subtaskId 
      ? `/api/tasks/complete/${taskId}/subtask/${subtaskId}`
      : `/api/tasks/complete/${taskId}`;

    const response = await fetch(`https://taskify-eight-kohl.vercel.app${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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

export { handleMarkComplete };