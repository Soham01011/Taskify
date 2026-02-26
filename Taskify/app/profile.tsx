import { GenieAnimation } from '@/src/components/GenieAnimation';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from "expo-updates";
import { AlertTriangle, Bell, CheckCircle2, ChevronRight, Copy, Info, RefreshCw, Settings, Shield, User, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { getStyles } from '@/assets/styles/profilescreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { Button } from '@/src/components/ui/Button';
import { RootState } from '@/src/store';
import { logout, switchUser } from '@/src/store/slices/authSlice';

const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    isLast = false,
    rightIcon,
    colors,
    styles
}: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    isLast?: boolean;
    rightIcon?: React.ReactNode;
    colors: any;
    styles: any
}) => (
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
        {rightIcon || <ChevronRight size={18} color={colors.textSecondary} />}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const styles = getStyles(colors);
    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

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

    const handleCopyUserId = async () => {
        if (currentUserId) {
            await Clipboard.setStringAsync(currentUserId);
            Alert.alert('Copied!', 'Your User ID has been copied to the clipboard. Share it with others so they can add you to their groups.');
        }
    };

    const handleCheckUpdates = async () => {
        try {
            setIsCheckingUpdates(true);
            if (__DEV__) {
                // Simulate a delay for better UX feel during testing
                await new Promise(resolve => setTimeout(resolve, 1500));
                Alert.alert('Development Mode', 'OTA updates are not available in development mode.');
                setIsCheckingUpdates(false);
                return;
            }

            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    'Update Available',
                    'A new version of Taskify is available. The app will download the update and restart.',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => setIsCheckingUpdates(false)
                        },
                        {
                            text: 'Update Now',
                            onPress: async () => {
                                try {
                                    await Updates.fetchUpdateAsync();
                                    await Updates.reloadAsync();
                                } catch (error) {
                                    Alert.alert('Update Failed', 'Could not download the update. Please check your internet connection and try again.');
                                    setIsCheckingUpdates(false);
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Up to Date', 'You are already running the latest version of Taskify.');
                setIsCheckingUpdates(false);
            }
        } catch (error) {
            console.error('Update check error:', error);
            Alert.alert(
                'Check Failed',
                'An error occurred while checking for updates. Make sure you are using a build with OTA updates enabled.'
            );
            setIsCheckingUpdates(false);
        }
    };

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
                        <MenuItem icon={<Copy size={20} color={colors.primary} />} title="Copy User ID" subtitle={currentUserId || 'Not available'} onPress={handleCopyUserId} colors={colors} styles={styles} />
                        <MenuItem icon={<Settings size={20} color={colors.primary} />} title="Preferences" subtitle="Theme, language, and more" onPress={() => router.push('/preferences')} colors={colors} styles={styles} />
                        <MenuItem icon={<Bell size={20} color="#6366f1" />} title="Notifications" subtitle="Manage alerts and updates" colors={colors} styles={styles} />
                        <MenuItem icon={<Shield size={20} color="#10b981" />} title="Privacy & Security" subtitle="Password, biometric lock" colors={colors} styles={styles} />
                        <MenuItem icon={<Info size={20} color="#f59e0b" />} title="Help & Support" subtitle="FAQ and contact us" colors={colors} styles={styles} />
                        <MenuItem
                            icon={<RefreshCw size={20} color={colors.primary} />}
                            title="Check for Updates"
                            subtitle={isCheckingUpdates ? "Checking for updates..." : "Get the latest version"}
                            onPress={handleCheckUpdates}
                            isLast={true}
                            colors={colors}
                            styles={styles}
                        />
                    </View>
                </View>

                <Button
                    title="Logout Current Account"
                    variant="danger"
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                />

                {/* <Button
                    title="Test Sentry Error"
                    variant="outline"
                    onPress={() => {
                        Sentry.captureException(new Error('Sentry Test Error from Profile'));
                        Alert.alert('Sentry Event Sent', 'Check your Sentry dashboard for the "Sentry Test Error from Profile" exception.');
                    }}
                    style={{ marginTop: 12, marginHorizontal: 20, marginBottom: 20 }}
                /> */}
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

