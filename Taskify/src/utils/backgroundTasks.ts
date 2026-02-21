import * as TaskManager from 'expo-task-manager';
import { taskApi, Task } from '../api/tasks';
import { groupApi } from '../api/groups';
import { NotificationService } from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let BackgroundFetch: any = null;
if (!isExpoGo) {
    try {
        BackgroundFetch = require('expo-background-fetch');
    } catch (e) {
        console.log('Failed to load expo-background-fetch', e);
    }
}

const BACKGROUND_FETCH_TASK = 'TASK_SYNC_BACKGROUND_FETCH';

// Define the background task
if (!isExpoGo) {
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
            let tasks = Array.isArray(response.data) ? response.data : response.data.tasks;

            try {
                const groupRes = await groupApi.getGroups(currentUserId);
                const groups = groupRes.data || [];

                // Convert group tasks to the standard Task format so notifications can be scheduled automatically
                const groupTasks: Task[] = groups.flatMap(group =>
                    group.tasks.map(t => ({
                        _id: t._id,
                        userId: typeof t.userId === 'string' ? t.userId : (t.userId as any)?._id,
                        title: `[${group.name}] ${t.task}`,
                        description: `Assigned to: ${t.username || 'Unassigned'}`,
                        completed: t.completed,
                        dueDate: t.duedate,
                        subtasks: [],
                        // automatically set alarm for group tasks
                        alarm_type: 'push',
                        alarm_reminder_time: t.duedate,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }))
                );

                // only schedule for tasks assigned to the current user
                const myGroupTasks = groupTasks.filter(gt => gt.userId === currentUserId);
                tasks = [...tasks, ...myGroupTasks];
            } catch (e) {
                console.error('Failed to fetch group background tasks', e);
            }

            if (tasks && tasks.length > 0) {
                await NotificationService.syncTasksWithNotifications(tasks);
                console.log('Synchronized notifications from background task');
                return BackgroundFetch.BackgroundFetchResult.NewData;
            }

            return BackgroundFetch?.BackgroundFetchResult?.NoData || 1;
        } catch (error) {
            console.error('Background fetch failed:', error);
            return BackgroundFetch?.BackgroundFetchResult?.Failed || 3;
        }
    });
}

export const registerBackgroundFetch = async () => {
    if (isExpoGo || !BackgroundFetch) {
        console.log('Background fetch not supported in Expo Go');
        return;
    }

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
    if (isExpoGo || !BackgroundFetch) return;

    if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK)) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
};
