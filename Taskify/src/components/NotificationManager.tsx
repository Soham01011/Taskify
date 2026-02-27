import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NotificationService } from '../utils/notificationService';
import { registerBackgroundFetch } from '../utils/backgroundTasks';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApi } from '../api/auth';

export const NotificationManager: React.FC = () => {
    const tasks = useSelector((state: RootState) => state.tasks.tasks);
    const groups = useSelector((state: RootState) => state.groups.groups);
    const { currentUserId, users } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);

    useEffect(() => {
        // Initialize permissions and get push token
        const setupNotifications = async () => {
            const token = await NotificationService.requestPermissions();
            if (token) {
                console.log('Registered for push notifications with token:', token);
                await AsyncStorage.setItem('pushToken', token);

                // Sync token with backend if user is logged in
                if (currentUserId) {
                    try {
                        await authApi.updatePushToken(token);
                        console.log('Push token synced with backend');
                    } catch (error) {
                        console.error('Failed to sync push token with backend:', error);
                    }
                }
            }
        };

        setupNotifications();

        // Register background fetch
        registerBackgroundFetch();

        // Handle notification selection (tapping on notification)
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data.taskId) {
                console.log('Notification tapped for task:', data.taskId, 'Type:', data.type);
            }
        });

        // Handle notification received while app is in foreground
        const notificationSubscription = Notifications.addNotificationReceivedListener(async notification => {
            const data = notification.request.content.data;

            // Check if this is a sync request from backend
            const needsSync = await NotificationService.handleSilentSync(data, tasks);
            if (needsSync) {
                console.log('Sync triggered by remote notification, refreshing data');
                // You would typically dispatch your fetch actions here
                // dispatch(fetchTasks());
                // dispatch(fetchGroups(currentUserId));
            }

            console.log('Notification received:', notification.request.content.title);
        });

        return () => {
            responseSubscription.remove();
            notificationSubscription.remove();
        };
    }, [currentUserId]); // Re-run when user logs in/out to sync token correctly


    useEffect(() => {
        // Sync both personal and group tasks whenever they change
        const sync = async () => {
            await NotificationService.syncTasksWithNotifications(tasks, groups);
        };
        sync();
    }, [tasks, groups]);


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
