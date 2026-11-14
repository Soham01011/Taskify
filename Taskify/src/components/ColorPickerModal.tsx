import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { ColorPicker } from '@/src/components/HoloColorPicker';
import Slider from '@react-native-community/slider';
import { X, Check, RefreshCcw, Palette, Sliders } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/use-theme';
import { SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import {
    RGBColor,
    HSVColor,
    hsvToRgb,
    hsvToHex,
    hexToHsv,
    hexToRgb,
    rgbToHex,
    rgbToHsv,
    formatRgb,
    formatHsv,
    parseColorToAllFormats
} from '@/src/utils/colors';

export const PRESET_COLORS = [
    { name: 'Sky Blue', hex: '#00AEEF' },
    { name: 'Indigo', hex: '#6366F1' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Rose', hex: '#F43F5E' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Coral', hex: '#FF6B6B' },
    { name: 'Teal', hex: '#14B8A6' },
    { name: 'Cyan', hex: '#06B6D4' },
    { name: 'Orange', hex: '#F97316' },
];

interface ColorPickerModalProps {
    visible: boolean;
    initialColor?: string;
    onClose: () => void;
    onSelectColor: (hexColor: string, rgb: RGBColor, hsv: HSVColor) => void;
    onResetColor?: () => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
    visible,
    initialColor = '#00AEEF',
    onClose,
    onSelectColor,
    onResetColor,
}) => {
    const { colors, isDark } = useAppTheme();

    const [activeHsv, setActiveHsv] = useState<HSVColor>(() => hexToHsv(initialColor));
    const [activeHex, setActiveHex] = useState<string>(() => initialColor);
    const [activeRgb, setActiveRgb] = useState<RGBColor>(() => hexToRgb(initialColor));
    const prevHexRef = useRef<string>(initialColor.toLowerCase());

    // Sync when initialColor changes or modal opens
    useEffect(() => {
        if (visible && initialColor) {
            prevHexRef.current = initialColor.toLowerCase();
            const parsed = parseColorToAllFormats(initialColor);
            setActiveHex(parsed.hex);
            setActiveRgb(parsed.rgb);
            setActiveHsv(parsed.hsv);
        }
    }, [visible, initialColor]);

    // Handle real-time color changes from the ColorPicker
    const handleColorChange = useCallback((hsv: any) => {
        const hex = hsvToHex(hsv);
        if (hex.toLowerCase() === prevHexRef.current) return;
        prevHexRef.current = hex.toLowerCase();

        const normalizedHsv: HSVColor = {
            h: Number(hsv.h || 0),
            s: Number(hsv.s || 0),
            v: Number(hsv.v || 0),
        };
        const rgb = hsvToRgb(normalizedHsv);

        setActiveHsv(normalizedHsv);
        setActiveHex(hex);
        setActiveRgb(rgb);
    }, []);

    // Handle center-circle tap in ColorPicker
    const handleColorSelected = useCallback((hex: string) => {
        const parsed = parseColorToAllFormats(hex);
        setActiveHex(parsed.hex);
        setActiveRgb(parsed.rgb);
        setActiveHsv(parsed.hsv);
        onSelectColor(parsed.hex, parsed.rgb, parsed.hsv);
        onClose();
    }, [onSelectColor, onClose]);

    // Handle selecting a preset chip
    const handleSelectPreset = useCallback((hex: string) => {
        const parsed = parseColorToAllFormats(hex);
        setActiveHex(parsed.hex);
        setActiveRgb(parsed.rgb);
        setActiveHsv(parsed.hsv);
    }, []);

    const handleApply = useCallback(() => {
        onSelectColor(activeHex, activeRgb, activeHsv);
        onClose();
    }, [activeHex, activeRgb, activeHsv, onSelectColor, onClose]);

    const handleReset = useCallback(() => {
        const defaultColor = '#00AEEF';
        const parsed = parseColorToAllFormats(defaultColor);
        setActiveHex(parsed.hex);
        setActiveRgb(parsed.rgb);
        setActiveHsv(parsed.hsv);
        if (onResetColor) {
            onResetColor();
        } else {
            onSelectColor(parsed.hex, parsed.rgb, parsed.hsv);
        }
    }, [onResetColor, onSelectColor]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.modalRoot}>
                {/* Backdrop */}
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.backdrop}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={onClose}
                        activeOpacity={1}
                    />
                </Animated.View>

                {/* Bottom Sheet Card */}
                <Animated.View
                    entering={SlideInDown.duration(300).springify()}
                    exiting={SlideOutDown.duration(250)}
                    style={[styles.sheetContainer, { backgroundColor: colors.card }]}
                >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerTitleRow}>
                            <Palette size={20} color={colors.primary} />
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Accent Color Picker</Text>
                        </View>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.border }]} onPress={onClose}>
                            <X size={18} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Live Color Swatch & Value Badges */}
                        <View style={[styles.previewSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={[styles.colorSwatch, { backgroundColor: activeHex }]}>
                                <Check size={20} color="#FFFFFF" strokeWidth={3} />
                            </View>

                            <View style={styles.metricsContainer}>
                                {/* HEX */}
                                <View style={styles.metricItem}>
                                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>HEX</Text>
                                    <Text style={[styles.metricValue, { color: colors.text }]}>{activeHex}</Text>
                                </View>

                                {/* RGB */}
                                <View style={styles.metricItem}>
                                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>RGB</Text>
                                    <Text style={[styles.metricValue, { color: colors.text }]}>
                                        {activeRgb.r}, {activeRgb.g}, {activeRgb.b}
                                    </Text>
                                </View>

                                {/* HSV */}
                                <View style={styles.metricItem}>
                                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>HSV</Text>
                                    <Text style={[styles.metricValue, { color: colors.text }]}>
                                        {Math.round(activeHsv.h)}°, {Math.round(activeHsv.s * 100)}%, {Math.round(activeHsv.v * 100)}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Holo Color Picker (Wheel + Sliders) */}
                        <View style={styles.pickerWrapper}>
                            <ColorPicker
                                color={activeHsv}
                                onColorChange={handleColorChange}
                                onColorSelected={handleColorSelected}
                                sliderComponent={Slider as any}
                                style={styles.colorPicker}
                            />
                        </View>

                        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                            Tap the center circle to select or drag the sliders below the wheel to adjust saturation & brightness.
                        </Text>

                        {/* Presets Row */}
                        <View style={styles.presetsSection}>
                            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Quick Presets</Text>
                            <View style={styles.presetsRow}>
                                {PRESET_COLORS.map((preset) => {
                                    const isSelected = activeHex.toLowerCase() === preset.hex.toLowerCase();
                                    return (
                                        <TouchableOpacity
                                            key={preset.hex}
                                            style={[
                                                styles.presetChip,
                                                { backgroundColor: preset.hex },
                                                isSelected && styles.presetChipSelected,
                                            ]}
                                            onPress={() => handleSelectPreset(preset.hex)}
                                            activeOpacity={0.8}
                                        >
                                            {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[styles.resetButton, { borderColor: colors.border }]}
                                onPress={handleReset}
                                activeOpacity={0.7}
                            >
                                <RefreshCcw size={16} color={colors.textSecondary} />
                                <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>Default</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.applyButton, { backgroundColor: activeHex }]}
                                onPress={handleApply}
                                activeOpacity={0.8}
                            >
                                <Check size={18} color="#FFFFFF" />
                                <Text style={styles.applyButtonText}>Apply Color</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    sheetContainer: {
        width: '100%',
        maxHeight: '90%',
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        paddingTop: SPACING.md,
        paddingBottom: Platform.OS === 'ios' ? 36 : SPACING.lg,
        ...SHADOWS.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 6,
        borderRadius: RADIUS.round,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    previewSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.md,
        gap: SPACING.md,
    },
    colorSwatch: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    metricsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    pickerWrapper: {
        height: 290,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SPACING.xs,
    },
    colorPicker: {
        width: '100%',
        height: 280,
    },
    hintText: {
        fontSize: 12,
        textAlign: 'center',
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    presetsSection: {
        marginBottom: SPACING.lg,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.sm,
    },
    presetsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    presetChip: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    presetChipSelected: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        transform: [{ scale: 1.15 }],
    },
    actionsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.xs,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        gap: 6,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
        gap: 6,
        ...SHADOWS.sm,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
