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
import { COLORS } from '@/src/constants/theme';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { setLoading, setError, loginSuccess } from '@/src/store/slices/authSlice';
import { authApi } from '@/src/api/auth';
import { styles } from '@/assets/styles/loginscreen.style';

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

            const { accessToken, refreshToken, userId, finalUsername } = response.data;
            if (!accessToken || !refreshToken || !userId || !finalUsername) {
                throw new Error("Invalid response from server");
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

