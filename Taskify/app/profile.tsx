import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, Stack } from 'expo-router';
import { User, LogOut, UserPlus, CheckCircle2, ChevronRight, Settings, Bell, Shield, Info } from 'lucide-react-native';

import { RootState } from '../src/store';
import { switchUser, logout } from '../src/store/slices/authSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { Button } from '../src/components/ui/Button';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);

    const handleSwitchUser = (userId: string) => {
        if (userId === currentUserId) return;
        dispatch(switchUser(userId));
        router.back();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout from this account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(logout());
                        if (users.length <= 1) {
                            router.replace('/(auth)' as any);
                        } else {
                            // If there are other users, staying on profile screen or going back
                            // Since the user we logged out of is gone, switchUser will handle the next one
                        }
                    }
                },
            ]
        );
    };

    const renderMenuItem = (icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void, isLast = false) => (
        <TouchableOpacity
            style={[styles.menuItem, isLast && styles.lastMenuItem]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <View style={styles.menuIconContainer}>
                {icon}
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Profile',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: COLORS.white },
            }} />
            <StatusBar style="dark" />

            <View style={styles.mainContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <User size={40} color={COLORS.primary} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.profileName}>{currentUser?.username}</Text>
                    <Text style={styles.profileEmail}>Active Session</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Switch Account</Text>
                    <View style={styles.accountList}>
                        {users.map((user) => (
                            <TouchableOpacity
                                key={user.id}
                                style={[
                                    styles.accountItem,
                                    user.id === currentUserId && styles.activeAccountItem
                                ]}
                                onPress={() => handleSwitchUser(user.id)}
                            >
                                <View style={[styles.miniAvatar, user.id === currentUserId && styles.activeMiniAvatar]}>
                                    <User size={16} color={user.id === currentUserId ? COLORS.white : COLORS.primary} />
                                </View>
                                <Text style={[styles.accountName, user.id === currentUserId && styles.activeAccountName]}>
                                    {user.username}
                                </Text>
                                {user.id === currentUserId && (
                                    <CheckCircle2 size={18} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.addAccountBtn}
                            onPress={() => router.push('/(auth)' as any)}
                        >
                            <UserPlus size={18} color={COLORS.primary} />
                            <Text style={styles.addAccountText}>Add another account</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.menuCard}>
                        {renderMenuItem(<Bell size={20} color="#6366f1" />, 'Notifications', 'Manage alerts and updates')}
                        {renderMenuItem(<Shield size={20} color="#10b981" />, 'Privacy & Security', 'Password, biometric lock')}
                        {renderMenuItem(<Info size={20} color="#f59e0b" />, 'Help & Support', 'FAQ and contact us', undefined, true)}
                    </View>
                </View>

                <Button
                    title="Logout Current Account"
                    variant="danger"
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mainContent: {
        flex: 1,
        padding: SPACING.lg,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: COLORS.white,
        ...SHADOWS.md,
        marginBottom: SPACING.md,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
        marginLeft: 4,
    },
    accountList: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.sm,
        ...SHADOWS.sm,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    activeAccountItem: {
        backgroundColor: '#F8FAFC',
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activeMiniAvatar: {
        backgroundColor: COLORS.primary,
    },
    accountName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    activeAccountName: {
        color: COLORS.primary,
    },
    addAccountBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        marginTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    addAccountText: {
        marginLeft: SPACING.sm,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
    menuCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    logoutBtn: {
        marginTop: 'auto',
        marginBottom: SPACING.md,
    },
});
