import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { User, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { setLoading, setError, loginSuccess } from '../../src/store/slices/authSlice';
import { authApi } from '../../src/api/auth';

export default function LoginScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        try {
            dispatch(setLoading(true));
            setLocalError('');
            const response = await authApi.login(username, password);
            console.log("LOGIN RESPONSE RECEIVED:", response.data);

            const { accessToken, refreshToken, user } = response.data;

            // Fallback for ID if user object is missing (common with some JWT setups)
            let userId = user?.id || user?._id;
            let finalUsername = user?.username || username;

            if (!userId && accessToken) {
                try {
                    // Simple JWT payload extraction with base64url support
                    const base64Url = accessToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        (typeof atob !== 'undefined' ? atob(base64) : (typeof Buffer !== 'undefined' ? Buffer.from(base64, 'base64').toString() : ''))
                            .split('')
                            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );
                    const payload = JSON.parse(jsonPayload);
                    userId = payload.userId || payload.sub || payload.id;
                } catch (e) {
                    console.log("Error decoding token:", e);
                    userId = 'unknown-user';
                }
            }



            dispatch(loginSuccess({
                id: userId,
                username: finalUsername,
                accessToken,
                refreshToken
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
                        icon={<User size={20} color={COLORS.textSecondary} />}
                    />

                    <View style={styles.passwordHeader}>
                        <Text style={styles.label}>Password</Text>
                    </View>
                    <Input
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        icon={<Lock size={20} color={COLORS.textSecondary} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={COLORS.textSecondary} />
                                ) : (
                                    <Eye size={20} color={COLORS.textSecondary} />
                                )}
                            </TouchableOpacity>
                        }
                    />

                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 2,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#e1f5fe',
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.lg,
    },
    forgotText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
    },
    loginBtn: {
        marginTop: SPACING.sm,
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    registerText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});
