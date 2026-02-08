import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, Stack } from 'expo-router';
import { User, LogOut, UserPlus, CheckCircle2, ChevronRight, Settings, Bell, Shield, Info } from 'lucide-react-native';

import { styles } from '@/assets/styles/profilescreen.styles';
import { RootState } from '@/src/store';
import { switchUser, logout } from '@/src/store/slices/authSlice';
import { COLORS } from '@/src/constants/theme';
import { Button } from '@/src/components/ui/Button';

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

