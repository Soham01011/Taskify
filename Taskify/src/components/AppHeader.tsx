import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Group, GroupTask } from '../api/groups';
import { SPACING, RADIUS } from '../constants/theme';
import { useAppTheme } from '@/hooks/use-theme';
import { MatrixText } from './MatrixText';

export const AppHeader = () => {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const personalTasks = useSelector((state: RootState) => state.tasks.tasks);
    const groups = useSelector((state: RootState) => state.groups.groups);

    const [viewMode, setViewMode] = useState<'personal' | 'group'>('personal');

    useEffect(() => {
        const timer = setInterval(() => {
            setViewMode(prev => prev === 'personal' ? 'group' : 'personal');
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const currentUser = users.find(u => u.id === currentUserId);

    const personalPending = personalTasks.filter(t => !t.completed).length;
    const groupPending = groups.flatMap((g: Group) =>
        (g.tasks || []).filter((t: GroupTask) => t.userId === currentUserId && !t.completed)
    ).length;

    const displayText = viewMode === 'personal'
        ? `You have ${personalPending} personal tasks`
        : `Group tasks pending: ${groupPending}`;

    return (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.greeting}>Hello, {currentUser?.username || 'Soham D'}</Text>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Settings size={22} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </View>
            <MatrixText
                key={displayText}
                text={displayText}
                style={styles.subtitle}
                duration={1000}
            />
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.xl,
        paddingBottom: SPACING.xs,
        backgroundColor: colors.background,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        marginTop: 4,
    },
    profileBtn: {
        borderRadius: 25,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
