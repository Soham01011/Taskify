import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SPACING, RADIUS } from '../constants/theme';
import { useAppTheme } from '@/hooks/use-theme';

export const AppHeader = () => {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
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
                    <User size={24} color={colors.primary} strokeWidth={2.5} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.xl,
        paddingBottom: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
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
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
});
