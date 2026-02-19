import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { authApi } from '@/src/api/auth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { getStyles } from '@/assets/styles/registerscreen.style';
import { useAppTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await authApi.register(username, password);
            router.replace('/(auth)' as any);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>Registration</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Details</Text>

                        <Text style={styles.label}>Username *</Text>
                        <Input
                            placeholder="Enter username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            icon={<User size={18} color={colors.textSecondary} />}
                        />

                        <Text style={styles.label}>Password *</Text>
                        <Input
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            icon={<Lock size={18} color={colors.textSecondary} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff size={18} color={colors.textSecondary} />
                                    ) : (
                                        <Eye size={18} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            }
                        />

                        <Text style={styles.label}>Confirm Password *</Text>
                        <Input
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                            icon={<Lock size={18} color={colors.textSecondary} />}
                        />
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.footer}>
                        <Button
                            title="Continue"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.submitBtn}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

