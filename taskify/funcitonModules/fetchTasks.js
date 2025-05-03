import { storeTasks, getCachedTasks } from './taskStorage';

const fetchTasks = async (authToken, forceFetch = false) => {
  try {
    // Try to get cached data first if not forcing fetch
    if (!forceFetch) {
      const cachedTasks = await getCachedTasks();
      if (cachedTasks) {
        setTasks(cachedTasks);
        return cachedTasks;
      }
    }

    // Fetch from API if cache miss or force fetch
    const response = await fetch('https://taskify-eight-kohl.vercel.app/api/tasks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Store in local storage
      await storeTasks(data);
      setTasks(data);
      return data;
    } else {
      console.error('Error fetching tasks:', data.message);
      Alert.alert('Failed to fetch tasks: ' + (data.message || 'Unknown error'));
      return null;
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    Alert.alert('Failed to fetch tasks');
    return null;
  }
};

export default fetchTasks;