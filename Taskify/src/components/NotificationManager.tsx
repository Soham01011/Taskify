import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NotificationService } from '../utils/notificationService';
import { registerBackgroundFetch } from '../utils/backgroundTasks';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotificationManager: React.FC = () => {
    const tasks = useSelector((state: RootState) => state.tasks.tasks);
    const { currentUserId, users } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);
    const router = useRouter();

    useEffect(() => {
        // Initialize permissions
        NotificationService.requestPermissions();

        // Register background fetch
        registerBackgroundFetch();

        // Handle notification selection
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const taskId = response.notification.request.content.data.taskId;
            if (taskId) {
                console.log('Notification tapped for task:', taskId);
            }
        });

        const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received in foreground:', notification);
        });

        return () => {
            responseSubscription.remove();
            notificationSubscription.remove();
        };
    }, []);

    useEffect(() => {
        // Sync tasks whenever they change
        const sync = async () => {
            await NotificationService.syncTasksWithNotifications(tasks);
        };
        sync();
    }, [tasks]);

    useEffect(() => {
        // Persist currentUserId and accessToken for background task access
        if (currentUserId && currentUser?.accessToken) {
            AsyncStorage.setItem('currentUserId', currentUserId);
            AsyncStorage.setItem('accessToken', currentUser.accessToken);
        } else {
            AsyncStorage.removeItem('currentUserId');
            AsyncStorage.removeItem('accessToken');
        }
    }, [currentUserId, currentUser?.accessToken]);

    return null;
};
