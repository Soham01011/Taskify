import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '../api/tasks';

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
    static async requestPermissions() {
        if (!Device.isDevice) {
            console.log('Must use physical device for push notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return false;
        }

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
                sound: 'default', // In a real app, you'd use a louder sound file
                lightColor: '#FF0000',
            });
        }

        return true;
    }

    static async scheduleTaskNotification(task: Task) {
        if (!task.alarm_reminder_time) return;

        const triggerTime = new Date(task.alarm_reminder_time);
        if (triggerTime <= new Date()) return; // Don't schedule for past times

        // Cancel previous notification for this task if any
        await this.cancelTaskNotification(task._id)

        const isAlarm = task.alarm_type === 'alarm';

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: isAlarm ? `🚨 ALARM: ${task.title}` : task.title,
                body: task.description || 'Reminder for your task',
                data: { taskId: task._id },
                sound: isAlarm ? 'default' : 'default', // Custom sounds require assets
                priority: isAlarm ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
                date: triggerTime,
                type: Notifications.SchedulableTriggerInputTypes.DATE,
            } as any,
            identifier: task._id,
        });

        console.log(`Scheduled notification for task ${task.title} at ${triggerTime.toLocaleString()} (ID: ${id})`);
        return id;
    }

    static async cancelTaskNotification(taskId: string) {
        await Notifications.cancelScheduledNotificationAsync(taskId);
    }

    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    static async syncTasksWithNotifications(tasks: Task[]) {
        // Cancel all current notifications and reschedule based on current task list
        // This is a simple brute-force approach. For large task lists, you'd be more surgical.
        await this.cancelAllNotifications();

        for (const task of tasks) {
            if (!task.completed && task.alarm_reminder_time) {
                await this.scheduleTaskNotification(task);
            }
        }
    }
}
