import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Stack } from 'expo-router';
import { Sun, Moon, Monitor, Check, Palette, RefreshCcw } from 'lucide-react-native';
import { OSColorPicker } from '@/src/components/OSColorPicker';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { RootState } from '@/src/store';
import { updateUserPreferences } from '@/src/store/slices/authSlice';
import { useAppTheme } from '@/hooks/use-theme';
import { PALETTE } from '@/src/constants/theme';
import { styles } from '@/assets/styles/PreferanceScreen.styles';

const ThemeOption = ({ id, label, icon: Icon, colors, currentTheme, isDark, handleThemeChange }: { id: 'light' | 'dark' | 'system', label: string, icon: any, colors: any, currentTheme: string, isDark: boolean, handleThemeChange: (id: 'light' | 'dark' | 'system') => void }) => (
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

export default function PreferencesScreen() {
    const dispatch = useDispatch();
    const { colors, isDark, customPrimaryColor } = useAppTheme();
    const { currentUserId, users, globalPreferences } = useSelector((state: RootState) => state.auth);
    const currentUser = users.find(u => u.id === currentUserId);

    const currentTheme = currentUser?.preferences?.theme || globalPreferences.theme;
    const [selectedColor, setSelectedColor] = useState(customPrimaryColor || colors.primary);

    const handleThemeChange = React.useCallback((theme: 'light' | 'dark' | 'system') => {
        if (currentUserId) {
            dispatch(updateUserPreferences({
                userId: currentUserId,
                preferences: { theme }
            }));
        }
    }, [currentUserId, dispatch]);

    const handleActiveColorChange = React.useCallback((result: any) => {
        // Only update local state for the UI preview while picking
        if (result.hex) {
            setSelectedColor(result.hex);
        }
    }, []);

    const handleColorComplete = React.useCallback((result: any) => {
        const newColor = result.hex;
        if (!newColor) return;

        setSelectedColor(newColor);
        if (currentUserId) {
            dispatch(updateUserPreferences({
                userId: currentUserId,
                preferences: { primaryColor: newColor }
            }));
        }
    }, [currentUserId, dispatch]);

    const resetColor = React.useCallback(() => {
        const defaultColor = PALETTE[isDark ? 'dark' : 'light'].primary;
        setSelectedColor(defaultColor);
        if (currentUserId) {
            dispatch(updateUserPreferences({
                userId: currentUserId,
                preferences: { primaryColor: defaultColor }
            }));
        }
    }, [isDark, currentUserId, dispatch]);



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
                {/* Theme Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
                    <View style={[styles.optionsCard, { backgroundColor: colors.card }]}>
                        <ThemeOption id="light" label="Light Mode" icon={Sun} colors={colors} currentTheme={currentTheme} isDark={isDark} handleThemeChange={handleThemeChange} />
                        <ThemeOption id="dark" label="Dark Mode" icon={Moon} colors={colors} currentTheme={currentTheme} isDark={isDark} handleThemeChange={handleThemeChange} />
                        <ThemeOption id="system" label="System Default" icon={Monitor} colors={colors} currentTheme={currentTheme} isDark={isDark} handleThemeChange={handleThemeChange} />
                    </View>
                </View>

                {/* Accent Color Selection */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Accent Color</Text>
                        <TouchableOpacity onPress={resetColor} style={styles.resetBtn}>
                            <RefreshCcw size={14} color={colors.primary} />
                            <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.colorPickerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <OSColorPicker
                            color={selectedColor}
                            onColorChange={handleActiveColorChange}
                            onColorComplete={handleColorComplete}
                            styles={{
                                pickerStyle: styles.pickerStyle,
                                nativePickerRow: styles.nativePickerRow,
                                demoToken: styles.demoToken
                            }}
                        />

                        <View style={[styles.colorInfo, { borderTopColor: colors.border }]}>
                            <Palette size={16} color={colors.textSecondary} />
                            <Text style={[styles.colorValueText, { color: colors.text }]}>
                                {selectedColor.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                        This color will be used for buttons, icons, and highlights throughout the app.
                    </Text>
                </Animated.View>

                {/* UI Preview Card */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>UI Preview</Text>
                    <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.primary20 }]}>
                        <View style={[styles.previewHeader, { backgroundColor: colors.primary }]}>
                            <Text style={styles.previewHeaderText}>Preview Header</Text>
                        </View>
                        <View style={styles.previewContent}>
                            <View style={[styles.previewItem, { backgroundColor: colors.primary10 }]}>
                                <Check size={14} color={colors.primary} />
                                <Text style={[styles.previewItemText, { color: colors.text }]}>Selected state</Text>
                            </View>
                            <TouchableOpacity style={[styles.previewButton, { backgroundColor: colors.primary }]}>
                                <Text style={styles.previewButtonText}>Sample Button</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

