import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Stack } from 'expo-router';
import { Sun, Moon, Monitor, Check } from 'lucide-react-native';
import { RootState } from '@/src/store';
import { updateUserPreferences } from '@/src/store/slices/authSlice';
import { useAppTheme } from '@/hooks/use-theme';
import { SPACING, RADIUS } from '@/src/constants/theme';

export default function PreferencesScreen() {
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const { currentUserId, users, globalPreferences } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);

    const currentTheme = currentUser?.preferences?.theme || globalPreferences.theme;

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        if (currentUserId) {
            dispatch(updateUserPreferences({
                userId: currentUserId,
                preferences: { theme }
            }));
        }
    };

    const ThemeOption = ({ id, label, icon: Icon }: { id: 'light' | 'dark' | 'system', label: string, icon: any }) => (
        <TouchableOpacity
            style={[
                styles.option,
                { backgroundColor: colors.card, borderBottomColor: colors.border },
                currentTheme === id && { borderColor: colors.primary, borderWidth: 1 }
            ]}
            onPress={() => handleThemeChange(id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F9FF' }]}>
                <Icon size={20} color={currentTheme === id ? colors.primary : colors.textSecondary} />
            </View>
            <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
            {currentTheme === id && (
                <Check size={20} color={colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Preferences',
                headerStyle: { backgroundColor: colors.card },
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
                    <View style={[styles.optionsCard, { backgroundColor: colors.card }]}>
                        <ThemeOption id="light" label="Light Mode" icon={Sun} />
                        <ThemeOption id="dark" label="Dark Mode" icon={Moon} />
                        <ThemeOption id="system" label="System Default" icon={Monitor} />
                    </View>
                    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
                        Choose how Taskify looks to you. System default will follow your phone's settings.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
        marginLeft: 4,
    },
    optionsCard: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    optionLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 12,
        marginTop: SPACING.sm,
        paddingHorizontal: 4,
        lineHeight: 18,
    }
});
