import React, { useState, useEffect } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Check } from 'lucide-react-native';

interface OSColorPickerProps {
    color: string;
    onColorChange: (result: { hex: string }) => void;
    onColorComplete: (result: { hex: string }) => void;
    styles?: any;
}

// Convert hex/rgba string to individual r,g,b,a values
const parseColorString = (color: string) => {
    let r = 0, g = 0, b = 0, a = 1;
    if (color.startsWith('#')) {
        let cleanHex = color.replace('#', '');
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else if (cleanHex.length === 6) {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        } else if (cleanHex.length === 8) {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
            a = parseInt(cleanHex.substring(6, 8), 16) / 255;
        }
    } else if (color.startsWith('rgba')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
            r = parseInt(parts[0]);
            g = parseInt(parts[1]);
            b = parseInt(parts[2]);
            a = parseFloat(parts[3] || '1');
        }
    } else if (color.startsWith('rgb')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
            r = parseInt(parts[0]);
            g = parseInt(parts[1]);
            b = parseInt(parts[2]);
        }
    }
    return { r, g, b, a };
};

const rgbaToHex = (r: number, g: number, b: number, a: number) => {
    const toHex = (n: number) => {
        const h = Math.round(n).toString(16);
        return h.length === 1 ? '0' + h : h;
    };
    if (a >= 0.99) {
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
};

export const OSColorPicker: React.FC<OSColorPickerProps> = ({
    color,
    onColorChange,
    onColorComplete,
    styles: customStyles,
}) => {
    if (Platform.OS === 'ios') {
        const { Host, ColorPicker: NativePicker } = require('@expo/ui/swift-ui');
        return (
            <Host style={customStyles?.pickerStyle || styles.pickerStyle}>
                <View style={customStyles?.nativePickerRow || styles.nativePickerRow}>
                    <NativePicker
                        label="Choose Accent Color"
                        selection={color}
                        onValueChanged={(res: any) => {
                            // res is the native event or value depending on extraction, but based on use:
                            if (res && res.nativeEvent && res.nativeEvent.value) {
                                onColorComplete({ hex: res.nativeEvent.value });
                            } else if (typeof res === 'string') {
                                onColorComplete({ hex: res });
                            } else {
                                onColorComplete({ hex: res?.value || res?.hex || color });
                            }
                        }}
                        supportsOpacity={true}
                    />
                    <View style={[customStyles?.demoToken || styles.demoToken, { backgroundColor: color }]}>
                        <Check color="white" size={16} />
                    </View>
                </View>
            </Host>
        );
    }

    // Android / Default implementation using Sliders
    const [r, setR] = useState(0);
    const [g, setG] = useState(0);
    const [b, setB] = useState(0);
    const [a, setA] = useState(1);

    useEffect(() => {
        // Sync incoming color prop to local state
        const { r: initialR, g: initialG, b: initialB, a: initialA } = parseColorString(color);
        setR(initialR);
        setG(initialG);
        setB(initialB);
        setA(initialA);
    }, [color]);

    const handleValueChange = (newR: number, newG: number, newB: number, newA: number) => {
        setR(newR);
        setG(newG);
        setB(newB);
        setA(newA);
        const newHex = rgbaToHex(newR, newG, newB, newA);
        onColorChange({ hex: newHex });
    };

    const handleSlidingComplete = () => {
        const newHex = rgbaToHex(r, g, b, a);
        onColorComplete({ hex: newHex });
    };

    return (
        <View style={styles.androidContainer}>
            <View style={styles.previewRow}>
                <View style={[customStyles?.demoToken || styles.demoToken, { backgroundColor: color }]}>
                    <Check color="white" size={16} />
                </View>
            </View>

            <View style={styles.sliderGroup}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Red</Text>
                    <Text style={styles.sliderValue}>{Math.round(r)}</Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={r}
                    onValueChange={(val) => handleValueChange(val, g, b, a)}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor="#FF3B30"
                    maximumTrackTintColor="#E5E5EA"
                    thumbTintColor="#FF3B30"
                />
            </View>

            <View style={styles.sliderGroup}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Green</Text>
                    <Text style={styles.sliderValue}>{Math.round(g)}</Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={g}
                    onValueChange={(val) => handleValueChange(r, val, b, a)}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor="#34C759"
                    maximumTrackTintColor="#E5E5EA"
                    thumbTintColor="#34C759"
                />
            </View>

            <View style={styles.sliderGroup}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Blue</Text>
                    <Text style={styles.sliderValue}>{Math.round(b)}</Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={b}
                    onValueChange={(val) => handleValueChange(r, g, val, a)}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor="#007AFF"
                    maximumTrackTintColor="#E5E5EA"
                    thumbTintColor="#007AFF"
                />
            </View>

            <View style={styles.sliderGroup}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Opacity</Text>
                    <Text style={styles.sliderValue}>{Math.round(a * 100)}%</Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.01}
                    value={a}
                    onValueChange={(val) => handleValueChange(r, g, b, val)}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor="#8E8E93"
                    maximumTrackTintColor="#E5E5EA"
                    thumbTintColor="#8E8E93"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pickerStyle: {
        width: '100%',
    },
    nativePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    demoToken: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    androidContainer: {
        paddingVertical: 8,
        width: '100%',
        gap: 16,
    },
    previewRow: {
        alignItems: 'center',
        marginBottom: 8,
    },
    sliderGroup: {
        width: '100%',
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        paddingHorizontal: 8,
    },
    sliderLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sliderValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    slider: {
        width: '100%',
        height: 40,
    }
});
