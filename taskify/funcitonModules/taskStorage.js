import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const TASKS_STORAGE_KEY = '@taskify_tasks';
const LAST_FETCH_KEY = '@taskify_last_fetch';

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

export const storeTasks = async (tasks) => {
  try {
    const timestamp = new Date().getTime();
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    await AsyncStorage.setItem(LAST_FETCH_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error storing tasks:', error);
  }
};

export const getCachedTasks = async () => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const lastFetch = await AsyncStorage.getItem(LAST_FETCH_KEY);
    
    if (!tasksJson || !lastFetch) return null;

    const timestamp = parseInt(lastFetch);
    const now = new Date().getTime();

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      return null;
    }

    return JSON.parse(tasksJson);
  } catch (error) {
    console.error('Error reading cached tasks:', error);
    return null;
  }
};

export const clearTasksCache = async () => {
  try {
    await AsyncStorage.multiRemove([TASKS_STORAGE_KEY, LAST_FETCH_KEY]);
  } catch (error) {
    console.error('Error clearing tasks cache:', error);
  }
};