import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export const AppHeader = () => {
    const router = useRouter();
    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const { tasks } = useSelector((state: RootState) => state.tasks);

    const currentUser = users.find(u => u.id === currentUserId);
    const pendingTasksCount = tasks.filter(t => !t.completed).length;

    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hello, {currentUser?.username || 'Guest'}</Text>
                <Text style={styles.subtitle}>You have {pendingTasksCount} pending tasks</Text>
            </View>
            <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push('/profile')}
            >
                <View style={styles.avatarContainer}>
                    <User size={24} color={COLORS.primary} strokeWidth={2.5} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'android' ? SPACING.xl * 1.5 : SPACING.md,
        paddingBottom: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    profileBtn: {
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E1F5FE',
    },
});
