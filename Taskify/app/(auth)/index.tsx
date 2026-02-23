import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { User as UserIcon, Phone, Lock, Eye, EyeOff, X, LogIn, Globe, Trash2 } from 'lucide-react-native';
import { Modal } from 'react-native';
import { RootState } from '@/src/store';
import { RADIUS, SPACING } from '@/src/constants/theme';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { setLoading, setError, loginSuccess, removeAccount } from '@/src/store/slices/authSlice';
import { authApi } from '@/src/api/auth';
import { getStyles } from '@/assets/styles/loginscreen.style';
import { getAccountStyles } from '@/assets/styles/accountStyles.styles';
import { useAppTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const accountStyles = getAccountStyles(colors);
    const { users } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [showAccountSelector, setShowAccountSelector] = useState(users.length > 0);

    const handleLogin = async () => {
        if (!username || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        try {
            dispatch(setLoading(true));
            setLocalError('');
            const finalEndpoint = apiEndpoint.trim();
            const response = await authApi.login(username, password, finalEndpoint ? finalEndpoint : undefined);
            console.log("LOGIN RESPONSE RECEIVED:", response.data);

            const { accessToken, refreshToken, userId, finalUsername } = response.data;
            if (!accessToken || !refreshToken || !userId || !finalUsername) {
                throw new Error("Invalid response from server");
            }
            dispatch(loginSuccess({
                id: userId,
                username: finalUsername,
                accessToken,
                refreshToken,
                apiEndpoint: finalEndpoint || undefined
            }));

            router.replace('/(tabs)');
        } catch (err: any) {
            console.log("FRONTEND LOGIN ERROR:", err);
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setLocalError(msg);
            dispatch(setError(msg));
        } finally {
            dispatch(setLoading(false));
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {/* Using a placeholder for the logo as seen in screenshot */}
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoText}>T</Text>
                        </View>
                        <Text style={styles.brandName}>Taskify</Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Username</Text>
                    <Input
                        placeholder="Enter username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        icon={<UserIcon size={20} color={colors.textSecondary} />}
                    />

                    <View style={styles.passwordHeader}>
                        <Text style={styles.label}>Password</Text>
                    </View>
                    <Input
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        icon={<Lock size={20} color={colors.textSecondary} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.textSecondary} />
                                ) : (
                                    <Eye size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        }
                    />

                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <Text style={[styles.label, { marginTop: SPACING.md }]}>Server Endpoint (Optional)</Text>
                    <Input
                        placeholder="e.g. http://192.168.1.50:3000/api"
                        value={apiEndpoint}
                        onChangeText={setApiEndpoint}
                        autoCapitalize="none"
                        keyboardType="url"
                        icon={<Globe size={20} color={colors.textSecondary} />}
                    />

                    {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        style={styles.loginBtn}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                            <Text style={styles.registerText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showAccountSelector}
                transparent={true}
                animationType="fade"
            >
                <View style={accountStyles.overlay}>
                    <View style={accountStyles.modal}>
                        <View style={accountStyles.modalHeader}>
                            <Text style={accountStyles.modalTitle}>Choose Account</Text>
                            <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={accountStyles.accountList}>
                            {users.map((user) => (
                                <View key={user.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: 'hidden' }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14 }}
                                        onPress={() => {
                                            setUsername(user.username);
                                            setApiEndpoint(user.apiEndpoint || '');
                                            setShowAccountSelector(false);
                                        }}
                                    >
                                        <View style={accountStyles.accountAvatar}>
                                            <Text style={accountStyles.avatarText}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={accountStyles.accountName}>{user.username}</Text>
                                        <LogIn size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ padding: 14, borderLeftWidth: 1, borderLeftColor: colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.danger + '10' }}
                                        onPress={() => {
                                            Alert.alert(
                                                "Remove Account",
                                                `Are you sure you want to remove ${user.username} from this device?`,
                                                [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Remove", style: "destructive", onPress: () => {
                                                            dispatch(removeAccount(user.id));
                                                            if (users.length <= 1) setShowAccountSelector(false);
                                                        }
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <Trash2 size={20} color={colors.danger} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>

                        <Button
                            title="Login with another account"
                            variant="outline"
                            onPress={() => setShowAccountSelector(false)}
                            style={accountStyles.anotherBtn}
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}


