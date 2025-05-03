import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchTasks from './fetchTasks';

const loadTokenAndFetchTasks = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        await fetchTasks(savedToken);
      } else {
        Alert.alert('No token found', 'Please login again.');
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
};

export default loadTokenAndFetchTasks;