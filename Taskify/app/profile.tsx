import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, Stack } from 'expo-router';
import { User, LogOut, UserPlus, CheckCircle2, ChevronRight, Settings, Bell, Shield, Info, AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { GenieAnimation } from '@/src/components/GenieAnimation';

import { getStyles } from '@/assets/styles/profilescreen.styles';
import { RootState } from '@/src/store';
import { switchUser, logout } from '@/src/store/slices/authSlice';
import { useAppTheme } from '@/hooks/use-theme';
import { Button } from '@/src/components/ui/Button';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const styles = getStyles(colors);
    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleSwitchUser = (userId: string) => {
        if (userId === currentUserId) return;
        dispatch(switchUser(userId));
        router.back();
    };

    const confirmLogout = () => {
        dispatch(logout());
        setShowLogoutModal(false);
        if (users.length <= 1) {
            router.replace('/(auth)' as any);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
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
            <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Profile',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.card },
                headerTintColor: colors.text,
            }} />
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={styles.profileHeader}
                    onPress={() => router.push('/preferences')}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarLarge}>
                        <User size={40} color={colors.primary} strokeWidth={2.5} />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.profileName}>{currentUser?.username}</Text>
                        <Text style={styles.profileEmail}>Tap for Preferences</Text>
                    </View>
                    <View style={{ position: 'absolute', right: 20, top: 40 }}>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </View>
                </TouchableOpacity>

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
                                    <User size={16} color={user.id === currentUserId ? colors.white : colors.primary} />
                                </View>
                                <Text style={[styles.accountName, user.id === currentUserId && styles.activeAccountName]}>
                                    {user.username}
                                </Text>
                                {user.id === currentUserId && (
                                    <CheckCircle2 size={18} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.addAccountBtn}
                            onPress={() => router.push('/(auth)' as any)}
                        >
                            <UserPlus size={18} color={colors.primary} />
                            <Text style={styles.addAccountText}>Add another account</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.menuCard}>
                        {renderMenuItem(<Settings size={20} color={colors.primary} />, 'Preferences', 'Theme, language, and more', () => router.push('/preferences'))}
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
            </ScrollView>

            {/* Custom Logout Modal */}
            {showLogoutModal && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setShowLogoutModal(false)}
                    />
                    <View style={styles.modalContainer}>
                        <GenieAnimation>
                            <View style={styles.modalCard}>
                                <View style={styles.modalIconContainer}>
                                    <AlertTriangle size={32} color={colors.danger} />
                                </View>
                                <Text style={styles.logoutModalTitle}>Logout</Text>
                                <Text style={styles.logoutModalDesc}>
                                    Are you sure you want to logout from {currentUser?.username}'s account?
                                </Text>

                                <View style={styles.modalFooter}>
                                    <View style={styles.modalButton}>
                                        <Button
                                            title="Cancel"
                                            variant="secondary"
                                            onPress={() => setShowLogoutModal(false)}
                                        />
                                    </View>
                                    <View style={styles.modalButton}>
                                        <Button
                                            title="Logout"
                                            variant="danger"
                                            onPress={confirmLogout}
                                        />
                                    </View>
                                </View>
                            </View>
                        </GenieAnimation>
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

