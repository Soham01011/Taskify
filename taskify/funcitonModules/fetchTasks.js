import { Alert } from 'react-native';
import { storeTasks, getCachedTasks ,storeGroupTasks} from './taskStorage';
import { refreshTokens } from '../modules/tokenServices.js';

const fetchTasks = async (authToken, forceFetch = false) => {
  try {
    if (!forceFetch) {
      const cachedTasks = await getCachedTasks();
      if (cachedTasks) return cachedTasks;
    }

    let response = await fetch('http://192.168.31.28:5000/api/tasks', {
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
        response = await fetch('http://192.168.31.28:5000/api/tasks', {
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

    const [tasksResponse, groupsResponse] = await Promise.all([
      fetch('http://192.168.31.28:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch('http://192.168.31.28:5000/api/groups', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    const [tasksData, groupsData] = await Promise.all([
      tasksResponse.json(),
      groupsResponse.json()
    ]);

    // Process group tasks to include group name
    const groupTasks = groupsData.reduce((acc, group) => {
      const tasksWithGroup = group.tasks.map(task => ({
        ...task,
        groupName: group.name,
        groupId: group._id
      }));
      return [...acc, ...tasksWithGroup];
    }, []);

    const combinedData = {
      personalTasks: tasksData,
      groupTasks
    };

    await storeTasks(combinedData);
    return combinedData;
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