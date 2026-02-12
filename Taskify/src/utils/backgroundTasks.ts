import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { taskApi } from '../api/tasks';
import { NotificationService } from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'TASK_SYNC_BACKGROUND_FETCH';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        console.log('Background fetch execution started');

        const currentUserId = await AsyncStorage.getItem('currentUserId');
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!currentUserId || !accessToken) {
            console.log('Missing auth info, skipping background sync');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        const response = await taskApi.getAll({
            headers: { Authorization: `Bearer ${accessToken}` }
        } as any);
        const tasks = Array.isArray(response.data) ? response.data : response.data.tasks;

        if (tasks && tasks.length > 0) {
            await NotificationService.syncTasksWithNotifications(tasks);
            console.log('Synchronized notifications from background task');
            return BackgroundFetch.BackgroundFetchResult.NewData;
        }

        return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
        console.error('Background fetch failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerBackgroundFetch = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        if (isRegistered) {
            console.log(`Task ${BACKGROUND_FETCH_TASK} is already registered`);
        } else {
            console.log(`Registering task ${BACKGROUND_FETCH_TASK}...`);
        }

        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 15 * 60, // 15 minutes (minimum for iOS)
            stopOnTerminate: false,   // Continue after app is closed
            startOnBoot: true,        // Start after device reboot
        });

        console.log('Background fetch registered successfully');
    } catch (err) {
        console.log('Failed to register background fetch:', err);
    }
};

export const unregisterBackgroundFetch = async () => {
    if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK)) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
};
