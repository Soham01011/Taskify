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

    static async scheduleTaskNotification(task: any, isGroupTask: boolean = false) {
        // Handle field differences between Task and GroupTask
        const title = task.title || task.task; // GroupTask uses 'task' for title
        const description = task.description || (isGroupTask ? `Group Task: ${task.username}` : '');
        const dueDate = task.alarm_reminder_time || task.dueDate || task.duedate;

        if (!dueDate) return;

        const triggerTime = new Date(dueDate);
        if (triggerTime <= new Date()) return;

        await this.cancelTaskNotification(task._id);

        const isAlarm = task.alarm_type === 'alarm';

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: isAlarm ? `🚨 ALARM: ${title}` : title,
                body: description || 'Reminder for your task',
                data: {
                    taskId: task._id,
                    type: isGroupTask ? 'GROUP_TASK' : 'PERSONAL_TASK'
                },
                sound: isAlarm ? 'default' : 'default',
                priority: isAlarm ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerTime,
            },
            identifier: task._id,
        });

        return id;
    }

    static async cancelTaskNotification(taskId: string) {
        await Notifications.cancelScheduledNotificationAsync(taskId);
    }

    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    static async syncTasksWithNotifications(tasks: Task[], groups: any[] = []) {
        await this.cancelAllNotifications();

        // Sync personal tasks
        for (const task of tasks) {
            if (!task.completed) {
                await this.scheduleTaskNotification(task, false);
            }
        }

        // Sync group tasks assigned to the current user
        for (const group of groups) {
            if (group.tasks) {
                for (const gTask of group.tasks) {
                    if (!gTask.completed) {
                        await this.scheduleTaskNotification(gTask, true);
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


