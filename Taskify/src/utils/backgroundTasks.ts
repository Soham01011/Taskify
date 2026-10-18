import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import { authApi } from '../api/auth';
import { groupApi } from '../api/groups';
import { ideaApi } from '../api/ideas';
import { Task, taskApi } from '../api/tasks';
import { CalendarService } from './calendarService';
import { NotificationService } from './notificationService';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let BackgroundFetch: any = null;
if (!isExpoGo) {
    try {
        BackgroundFetch = require('expo-background-task');
    } catch (e) {
        console.log('Failed to load expo-background-task', e);
    }
}

const BACKGROUND_FETCH_TASK = 'TASK_SYNC_BACKGROUND_FETCH';

// Define the background task
if (!isExpoGo) {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
            console.log('Background fetch execution started');

            let currentUserId = await AsyncStorage.getItem('currentUserId');
            let accessToken = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            // 1. Refresh auth tokens if refreshToken is available
            if (refreshToken) {
                try {
                    const refreshRes = await authApi.refresh(refreshToken);
                    if (refreshRes.data?.accessToken) {
                        accessToken = refreshRes.data.accessToken;
                        await AsyncStorage.setItem('accessToken', accessToken);
                        if (refreshRes.data.refreshToken) {
                            await AsyncStorage.setItem('refreshToken', refreshRes.data.refreshToken);
                        }
                        console.log('Background token refresh successful');
                    }
                } catch (refreshErr) {
                    console.log('Background token refresh failed, continuing with current access token');
                }
            }

            if (!currentUserId || !accessToken) {
                console.log('Missing auth info, skipping background sync');
                return BackgroundFetch?.BackgroundFetchResult?.NoData || 1;
            }

            // 2. Check for OTA app updates
            if (!__DEV__) {
                try {
                    const Updates = require('expo-updates');
                    const update = await Updates.checkForUpdateAsync();
                    if (update.isAvailable) {
                        await Updates.fetchUpdateAsync();
                        console.log('Background OTA update downloaded successfully');
                    }
                } catch (updateErr) {
                    console.log('Background update check error:', updateErr);
                }
            }

            // 3. Fetch tasks
            const response = await taskApi.getAll({
                headers: { Authorization: `Bearer ${accessToken}` }
            } as any);
            let tasks = Array.isArray(response.data) ? response.data : response.data.tasks;

            let groups: any[] = [];
            try {
                const groupRes = await groupApi.getGroups(currentUserId);
                groups = groupRes.data || [];

                // Convert group tasks to the standard Task format so notifications can be scheduled automatically
                const groupTasks: Task[] = groups.flatMap(group =>
                    group.tasks.map((t: any) => ({
                        _id: t._id,
                        userId: typeof t.userId === 'string' ? t.userId : (t.userId as any)?._id,
                        title: `[${group.name}] ${t.task}`,
                        description: `Assigned to: ${t.username || 'Unassigned'}`,
                        completed: t.completed,
                        dueDate: t.duedate,
                        subtasks: [],
                        alarm_type: 'push',
                        alarm_reminder_time: t.duedate,
                        groupName: group.name,
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

            // 4. Delegate to Calendar App if sync is enabled; otherwise manage via notificationService
            const calendarSyncEnabled = (await AsyncStorage.getItem('calendarSyncEnabled')) === 'true';

            if (calendarSyncEnabled) {
                // Native calendar app handles alarms and alerts
                await CalendarService.syncTasksToCalendar(tasks, groups);
                console.log('Synchronized tasks to native calendar app');
                await NotificationService.syncTasksWithNotifications(tasks, groups, {
                    notificationsEnabled: true,
                    taskNotificationsEnabled: true,
                    groupNotificationsEnabled: true,
                    calendarSyncEnabled: true,
                });
            } else {
                if (tasks && tasks.length > 0) {
                    await NotificationService.syncTasksWithNotifications(tasks, groups);
                    console.log('Synchronized notifications from background task');
                }
            }

            // 5. If no tasks for today, suggest the user to work on their ideas (interval 5-6 hours)
            const now = new Date();
            const isToday = (dateStr?: string) => {
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return (
                    d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate()
                );
            };

            const incompleteTasksToday = (tasks || []).filter(
                (t: any) => !t.completed && isToday(t.dueDate || t.duedate)
            );

            if (incompleteTasksToday.length === 0) {
                const LAST_IDEA_SUGGESTION_KEY = 'LAST_IDEA_SUGGESTION_TIMESTAMP';
                const lastTimeStr = await AsyncStorage.getItem(LAST_IDEA_SUGGESTION_KEY);
                const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
                const FIVE_HOURS_MS = 5 * 60 * 60 * 1000; // 5 hours throttle interval

                if (now.getTime() - lastTime >= FIVE_HOURS_MS) {
                    try {
                        const ideaRes = await ideaApi.getAll({
                            headers: { Authorization: `Bearer ${accessToken}` }
                        } as any);

                        const ideas = Array.isArray(ideaRes.data) ? ideaRes.data : ideaRes.data.ideas;

                        if (ideas && ideas.length > 0) {
                            const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
                            await NotificationService.scheduleFreeTimeSuggestion(randomIdea, 'IDEA');
                            await AsyncStorage.setItem(LAST_IDEA_SUGGESTION_KEY, now.getTime().toString());
                            console.log('Suggested random idea to user with 5-6h interval:', randomIdea.title);
                        }
                    } catch (e) {
                        console.error('Failed to handle free time idea suggestion', e);
                    }
                }
            }

            if (tasks && tasks.length > 0) {
                return BackgroundFetch?.BackgroundFetchResult?.NewData || 2;
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
