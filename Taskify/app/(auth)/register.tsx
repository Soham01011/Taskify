import React, { useReducer, useState } from 'react';
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
import { ChevronLeft, User, Lock, Eye, EyeOff, Globe } from 'lucide-react-native';
import { authApi } from '@/src/api/auth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { getStyles } from '@/assets/styles/registerscreen.style';
import { useAppTheme } from '@/hooks/use-theme';

const initialState = {
    username: '',
    password: '',
    confirmPassword: '',
    apiEndpoint: '',
    loading: false,
    error: ''
};

function reducer(state: typeof initialState, action: { type: 'SET_FIELD', field: keyof typeof initialState, value: any }) {
    if (action.type === 'SET_FIELD') {
        return { ...state, [action.field]: action.value };
    }
    return state;
}

export default function RegisterScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const [state, dispatch] = useReducer(reducer, initialState);
    // keep showPassword as useState since it's transient UI state and not strictly form data
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!state.username || !state.password || !state.confirmPassword || !state.apiEndpoint) {
            dispatch({ type: 'SET_FIELD', field: 'error', value: 'Please fill in all fields' });
            return;
        }

        if (state.password !== state.confirmPassword) {
            dispatch({ type: 'SET_FIELD', field: 'error', value: 'Passwords do not match' });
            return;
        }

        dispatch({ type: 'SET_FIELD', field: 'loading', value: true });
        dispatch({ type: 'SET_FIELD', field: 'error', value: '' });

        const endpointStr = state.apiEndpoint.trim();
        const finalEndpoint = endpointStr ? endpointStr : undefined;

        try {
            await authApi.register(state.username, state.password, finalEndpoint);
            dispatch({ type: 'SET_FIELD', field: 'loading', value: false });
            router.replace('/(auth)' as any);
        } catch (err: any) {
            let errorMsg = 'Registration failed';
            if (err && err.response && err.response.data && err.response.data.message) {
                errorMsg = err.response.data.message;
            }
            dispatch({ type: 'SET_FIELD', field: 'error', value: errorMsg });
            dispatch({ type: 'SET_FIELD', field: 'loading', value: false });
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
                            value={state.username}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'username', value: val })}
                            autoCapitalize="none"
                            icon={<User size={18} color={colors.textSecondary} />}
                        />

                        <Text style={styles.label}>Password *</Text>
                        <Input
                            placeholder="Enter your password"
                            value={state.password}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'password', value: val })}
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
                            value={state.confirmPassword}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'confirmPassword', value: val })}
                            secureTextEntry={!showPassword}
                            icon={<Lock size={18} color={colors.textSecondary} />}
                        />

                        <Text style={styles.label}>Server Endpoint *</Text>
                        <Input
                            placeholder="e.g. http://localhost:3000/api"
                            value={state.apiEndpoint}
                            onChangeText={(val) => dispatch({ type: 'SET_FIELD', field: 'apiEndpoint', value: val })}
                            autoCapitalize="none"
                            keyboardType="url"
                            icon={<Globe size={18} color={colors.textSecondary} />}
                        />
                    </View>

                    {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}

                    <View style={styles.footer}>
                        <Button
                            title="Continue"
                            onPress={handleRegister}
                            loading={state.loading}
                            style={styles.submitBtn}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

