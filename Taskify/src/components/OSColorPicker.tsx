import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/use-theme';
import { SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import { ColorPicker } from '@/src/components/HoloColorPicker';
import {
    RGBColor,
    HSVColor,
    hsvToRgb,
    hsvToHex,
    hexToHsv,
    hexToRgb,
    parseColorToAllFormats,
} from '@/src/utils/colors';

interface OSColorPickerProps {
    color: string;
    onColorChange: (result: { hex: string; rgb: RGBColor; hsv: HSVColor }) => void;
    onColorComplete: (result: { hex: string; rgb: RGBColor; hsv: HSVColor }) => void;
    styles?: any;
}

export const OSColorPicker: React.FC<OSColorPickerProps> = ({
    color,
    onColorChange,
    onColorComplete,
}) => {
    const { colors } = useAppTheme();

    const initialParsed = parseColorToAllFormats(color || '#00AEEF');
    const [currentHsv, setCurrentHsv] = useState<HSVColor>(initialParsed.hsv);
    const [currentHex, setCurrentHex] = useState<string>(initialParsed.hex);
    const [currentRgb, setCurrentRgb] = useState<RGBColor>(initialParsed.rgb);

    const prevHexRef = useRef<string>(initialParsed.hex.toLowerCase());

    useEffect(() => {
        if (color && color.toLowerCase() !== prevHexRef.current) {
            prevHexRef.current = color.toLowerCase();
            const parsed = parseColorToAllFormats(color);
            setCurrentHex(parsed.hex);
            setCurrentRgb(parsed.rgb);
            setCurrentHsv(parsed.hsv);
        }
    }, [color]);

    const handleColorChange = useCallback((hsv: HSVColor) => {
        const hex = hsvToHex(hsv);
        if (hex.toLowerCase() === prevHexRef.current) return;

        prevHexRef.current = hex.toLowerCase();
        const rgb = hsvToRgb(hsv);

        setCurrentHsv(hsv);
        setCurrentHex(hex);
        setCurrentRgb(rgb);

        if (onColorChange) {
            onColorChange({ hex, rgb, hsv });
        }
    }, [onColorChange]);

    const handleColorSelected = useCallback((hex: string) => {
        const parsed = parseColorToAllFormats(hex);
        prevHexRef.current = parsed.hex.toLowerCase();
        setCurrentHex(parsed.hex);
        setCurrentRgb(parsed.rgb);
        setCurrentHsv(parsed.hsv);

        if (onColorComplete) {
            onColorComplete({ hex: parsed.hex, rgb: parsed.rgb, hsv: parsed.hsv });
        }
    }, [onColorComplete]);

    const handleSaveCurrent = useCallback(() => {
        if (onColorComplete) {
            onColorComplete({ hex: currentHex, rgb: currentRgb, hsv: currentHsv });
        }
    }, [currentHex, currentRgb, currentHsv, onColorComplete]);

    return (
        <View style={styles.container}>
            {/* Color metrics badge row */}
            <View style={[styles.metricsRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.metricBadge}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>HEX</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>{currentHex}</Text>
                </View>

                <View style={styles.metricBadge}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>RGB</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                        {currentRgb.r}, {currentRgb.g}, {currentRgb.b}
                    </Text>
                </View>

                <View style={styles.metricBadge}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>HSV</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                        {Math.round(currentHsv.h)}°, {Math.round(currentHsv.s * 100)}%, {Math.round(currentHsv.v * 100)}%
                    </Text>
                </View>
            </View>

            {/* Holo Color Picker */}
            <View style={styles.pickerWrapper}>
                <ColorPicker
                    color={currentHsv}
                    onColorChange={handleColorChange}
                    onColorSelected={handleColorSelected}
                    style={styles.picker}
                />
            </View>

            <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: currentHex }]}
                onPress={handleSaveCurrent}
                activeOpacity={0.8}
            >
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.saveBtnText}>Apply Color Everywhere</Text>
            </TouchableOpacity>

            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Tap the center circle or &ldquo;Apply Color Everywhere&rdquo; to set this theme across Taskify.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    metricsRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.sm,
    },
    metricBadge: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 12,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    pickerWrapper: {
        width: '100%',
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    picker: {
        width: '100%',
        height: 270,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginTop: SPACING.md,
        gap: 6,
        width: '100%',
        ...SHADOWS.sm,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    hintText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
});
