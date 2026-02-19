import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Stack } from 'expo-router';
import { Sun, Moon, Monitor, Check, Palette, RefreshCcw } from 'lucide-react-native';
import ColorPicker, { Panel1, HueSlider, OpacitySlider, Swatches, Preview } from 'reanimated-color-picker';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { RootState } from '@/src/store';
import { updateUserPreferences } from '@/src/store/slices/authSlice';
import { useAppTheme } from '@/hooks/use-theme';
import { SPACING, RADIUS, PALETTE } from '@/src/constants/theme';

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
                {/* Theme Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
                    <View style={[styles.optionsCard, { backgroundColor: colors.card }]}>
                        <ThemeOption id="light" label="Light Mode" icon={Sun} />
                        <ThemeOption id="dark" label="Dark Mode" icon={Moon} />
                        <ThemeOption id="system" label="System Default" icon={Monitor} />
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
                        {Platform.OS === 'ios' ? (
                            // Use Native Expo UI Color Picker for iOS as requested
                            (() => {
                                const { Host, ColorPicker: NativePicker } = require('@expo/ui/swift-ui');
                                return (
                                    <Host style={styles.pickerStyle}>
                                        <View style={styles.nativePickerRow}>
                                            <NativePicker
                                                label="Choose Accent Color"
                                                selection={selectedColor}
                                                onValueChanged={handleColorComplete}
                                                supportsOpacity={true}
                                            />
                                            <View style={[styles.demoToken, { backgroundColor: selectedColor }]}>
                                                <Check color="white" size={16} />
                                            </View>
                                        </View>
                                    </Host>
                                );
                            })()
                        ) : (
                            <ColorPicker
                                value={selectedColor}
                                onComplete={handleColorComplete}
                                onChange={handleActiveColorChange}
                                style={styles.pickerStyle}
                            >
                                <View style={styles.pickerMainRow}>
                                    <Panel1 style={styles.panelStyle} />
                                    <View style={styles.previewColumn}>
                                        <Preview style={styles.previewStyle} hideText />
                                        <View style={[styles.demoToken, { backgroundColor: selectedColor }]}>
                                            <Check color="white" size={16} />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.slidersContainer}>
                                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Hue</Text>
                                    <HueSlider style={styles.slider} />
                                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Opacity</Text>
                                    <OpacitySlider style={styles.slider} />
                                </View>

                                <Swatches
                                    colors={['#00AEEF', '#2ECC71', '#E74C3C', '#F39C12', '#9B59B6', '#34495E']}
                                    style={styles.swatches}
                                />
                            </ColorPicker>
                        )}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 40,
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
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    optionsCard: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
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
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resetText: {
        fontSize: 12,
        fontWeight: '600',
    },
    colorPickerCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        padding: SPACING.md,
        ...StyleSheet.flatten({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
        }),
    },
    pickerStyle: {
        gap: 16,
    },
    pickerMainRow: {
        flexDirection: 'row',
        gap: 16,
    },
    nativePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    panelStyle: {
        flex: 1,
        height: 150,
        borderRadius: RADIUS.lg,
    },
    previewColumn: {
        gap: 12,
        alignItems: 'center',
    },
    previewStyle: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    demoToken: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slidersContainer: {
        gap: 8,
    },
    sliderLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    slider: {
        height: 20,
        borderRadius: 10,
    },
    swatches: {
        justifyContent: 'space-between',
        marginTop: 8,
    },
    colorInfo: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorValueText: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    helpText: {
        fontSize: 12,
        marginTop: SPACING.sm,
        paddingHorizontal: 4,
        lineHeight: 18,
    },
    previewCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    previewHeader: {
        padding: SPACING.md,
    },
    previewHeaderText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    previewContent: {
        padding: SPACING.md,
        gap: 12,
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: RADIUS.md,
        gap: 8,
    },
    previewItemText: {
        fontSize: 13,
        fontWeight: '600',
    },
    previewButton: {
        paddingVertical: 10,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    previewButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
