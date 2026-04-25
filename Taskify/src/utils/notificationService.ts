import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '../api/tasks';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    static async registerForPushNotificationsAsync() {
        if (!Device.isDevice) {
            console.log('Must use physical device for push notifications');
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            console.error('Project ID not found in app config');
            return null;
        }

        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log('Expo Push Token:', pushTokenString);
            return pushTokenString;
        } catch (e) {
            console.error('Error getting push token:', e);
            return null;
        }
    }

    static async requestPermissions() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });

            await Notifications.setNotificationChannelAsync('alarm', {
                name: 'Alarm',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 500, 500, 500],
                sound: 'default',
                lightColor: '#FF0000',
            });
        }

        return await this.registerForPushNotificationsAsync();
    }

    static async scheduleTaskNotification(task: any, isGroupTask: boolean = false, presentedIds: string[] = []) {
        // Handle field differences between Task and GroupTask
        const title = task.title || task.task; // GroupTask uses 'task' for title
        const description = task.description || (isGroupTask ? `Group Task: ${task.username}` : '');
        const dueDate = task.alarm_reminder_time || task.dueDate || task.duedate;
        const taskId = task._id || task.taskId || task.id;

        if (!dueDate || !taskId) return;

        const triggerTime = new Date(dueDate);
        const now = new Date();
        const isPast = triggerTime <= now;

        // If it's in the past and already presented, don't repeat/re-vibrate
        if (isPast && presentedIds.includes(taskId)) {
            return;
        }

        // If it's in the future, we'll schedule it (this replaces any existing schedule for this ID)
        // If it's in the past and NOT presented, we'll show it immediately (re-notify)
        
        const isAlarm = task.alarm_type === 'alarm';
        
        // Define category for actions
        const categoryId = 'TASK_REMINDER';
        await Notifications.setNotificationCategoryAsync(categoryId, [
            {
                identifier: 'MARK_COMPLETED',
                buttonTitle: '✅ Mark as Completed',
                options: {
                    opensAppToForeground: false,
                },
            },
        ]);

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: isAlarm ? `🚨 ALARM: ${title}` : title,
                body: description || 'Reminder for your task',
                data: {
                    taskId: taskId,
                    type: isGroupTask ? 'GROUP_TASK' : 'PERSONAL_TASK'
                },
                categoryIdentifier: categoryId,
                sound: isAlarm ? 'default' : 'default',
                priority: isAlarm ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: isPast ? null : {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerTime,
            },
            identifier: taskId,
        });

        return id;
    }

    static async cancelTaskNotification(taskId: string) {
        await Notifications.cancelScheduledNotificationAsync(taskId);
    }

    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    static async syncTasksWithNotifications(
        tasks: Task[], 
        groups: any[] = [], 
        preferences?: { 
            notificationsEnabled: boolean; 
            taskNotificationsEnabled: boolean; 
            groupNotificationsEnabled: boolean; 
        }
    ) {
        // If master switch is off, cancel all and return
        if (preferences && preferences.notificationsEnabled === false) {
            await this.cancelAllNotifications();
            await Notifications.dismissAllNotificationsAsync();
            return;
        }

        // Get currently presented notifications to avoid duplicates/unnecessary re-notifying
        const presented = await Notifications.getPresentedNotificationsAsync();
        const presentedIds = presented.map(n => n.request.identifier);

        // Cancel all FUTURE scheduled notifications to avoid duplicates and clean up
        // Note: This does NOT clear already presented notifications
        await this.cancelAllNotifications();

        // Sync personal tasks if enabled
        if (!preferences || preferences.taskNotificationsEnabled !== false) {
            for (const task of tasks) {
                const taskId = task._id || task.taskId || task.id;
                if (!task.completed) {
                    await this.scheduleTaskNotification(task, false, presentedIds);
                } else if (taskId && presentedIds.includes(taskId)) {
                    // If completed, make sure any presented notification is cleared
                    await Notifications.dismissNotificationAsync(taskId);
                }
            }
        }

        // Sync group tasks if enabled
        if (!preferences || preferences.groupNotificationsEnabled !== false) {
            for (const group of groups) {
                if (group.tasks) {
                    for (const gTask of group.tasks) {
                        const taskId = gTask._id || gTask.taskId || gTask.id;
                        if (!gTask.completed) {
                            await this.scheduleTaskNotification(gTask, true, presentedIds);
                        } else if (taskId && presentedIds.includes(taskId)) {
                            await Notifications.dismissNotificationAsync(taskId);
                        }
                    }
                }
            }
        }
    }

    // New method to handle silent pushes from backend
    static async handleSilentSync(data: any, currentTasks: Task[]) {
        const syncTypes = ['SYNC_TASKS', 'TASK_SYNC', 'GROUP_TASK_ASSIGNED'];
        if (syncTypes.includes(data.type)) {
            console.log('Performing silent sync for task:', data.taskId);
            return true;
        }
        return false;
    }
}


