import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateGroupTask } from '../store/slices/groupSlice';
import { NotificationService } from '../utils/notificationService';
import { registerBackgroundFetch } from '../utils/backgroundTasks';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApi } from '../api/auth';

export const NotificationManager: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
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
            }

            // Specific flow for GROUP_TASK_ASSIGNED
            if (data.type === 'GROUP_TASK_ASSIGNED') {
                // Update local store with the new task
                if (data.groupId) {
                    dispatch(updateGroupTask({
                        groupId: data.groupId as string,
                        task: data
                    }));
                }

                // If assigned to current user, give immediate feedback and schedule reminder
                const prefs = currentUser?.preferences;
                if (data.userId === currentUserId && prefs?.notificationsEnabled !== false && prefs?.groupNotificationsEnabled !== false) {
                    // Show immediate notification
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "📋 New Task Assigned",
                            body: `You've been assigned: ${data.task || data.title}`,
                            data: { ...data, type: 'ASSIGNMENT_NOTICE' },
                            sound: 'default',
                        },
                        trigger: null, // deliver immediately
                    });

                    // Schedule reminder for due date
                    await NotificationService.scheduleTaskNotification(data, true);
                }
            }

            console.log('Notification received:', notification.request.content.title);
        });

        return () => {
            responseSubscription.remove();
            notificationSubscription.remove();
        };
    }, [currentUserId]); // Re-run when user logs in/out to sync token correctly


    useEffect(() => {
        // Sync both personal and group tasks whenever they change or preferences change
        const sync = async () => {
            await NotificationService.syncTasksWithNotifications(
                tasks, 
                groups, 
                currentUser?.preferences
            );
        };
        sync();
    }, [tasks, groups, currentUser?.preferences, dispatch]);


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
