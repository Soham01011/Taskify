import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    I18nManager,
    InteractionManager,
    StyleProp,
    ViewStyle,
} from 'react-native';
import Slider from '@react-native-community/slider';

import {
    HSVColor,
    hsvToHex,
    hexToHsv,
} from '@/src/utils/colors';

const COLOR_CIRCLE_IMG = require('react-native-color-picker/resources/color-circle.png');

export type HsvColor = HSVColor;

export interface IPickerProps {
    color?: string | HSVColor;
    defaultColor?: string | HSVColor;
    oldColor?: string;
    style?: StyleProp<ViewStyle>;
    onColorSelected?: (selectedColor: string) => void;
    onColorChange?: (selectedColor: HSVColor) => void;
    onOldColorSelected?: (oldColor: string) => void;
    hideSliders?: boolean;
    sliderComponent?: any;
}

/**
 * Modern React 19 compatible HoloColorPicker.
 * Fixes React 19 string ref deprecation by using React object refs.
 * Eliminates infinite update depth loops using gesture refs and value-based prop diffing.
 */
export const HoloColorPicker: React.FC<IPickerProps> = ({
    color: propColor,
    defaultColor,
    oldColor,
    style,
    onColorSelected,
    onColorChange,
    onOldColorSelected,
    hideSliders = false,
    sliderComponent: CustomSlider,
}) => {
    const isRTL = I18nManager.isRTL;
    const pickerContainerRef = useRef<View | null>(null);

    const parseHsv = useCallback((c?: string | HSVColor): HSVColor => {
        if (!c) return { h: 196, s: 1, v: 1 };
        if (typeof c === 'string') return hexToHsv(c);
        return {
            h: Number(c.h ?? 0),
            s: Number(c.s ?? 1),
            v: Number(c.v ?? 1),
        };
    }, []);

    const initialHsv = useMemo(() => {
        return parseHsv(propColor || defaultColor || oldColor || '#00AEEF');
    }, [propColor, defaultColor, oldColor, parseHsv]);

    const [color, setColor] = useState<HSVColor>(initialHsv);
    const [pickerSize, setPickerSize] = useState<number>(0);

    // Stable mutable refs to prevent PanResponder / Effect thrashing
    const colorRef = useRef<HSVColor>(initialHsv);
    colorRef.current = color;

    const onColorChangeRef = useRef(onColorChange);
    onColorChangeRef.current = onColorChange;

    const onColorSelectedRef = useRef(onColorSelected);
    onColorSelectedRef.current = onColorSelected;

    const onOldColorSelectedRef = useRef(onOldColorSelected);
    onOldColorSelectedRef.current = onOldColorSelected;

    const isInteractingRef = useRef<boolean>(false);
    const prevSyncedHexRef = useRef<string>(hsvToHex(initialHsv).toLowerCase());
    const prevNotifiedHueRef = useRef<number>(initialHsv.h);

    const layoutRef = useRef({ width: 0, height: 0 });
    const pagePosRef = useRef({ pageX: 0, pageY: 0 });
    const pickerSizeRef = useRef<number>(0);
    pickerSizeRef.current = pickerSize;

    // Sync external prop color changes ONLY when user is NOT actively dragging
    // and only when hex value has actually changed to prevent render loops.
    useEffect(() => {
        if (isInteractingRef.current || !propColor) return;

        const nextHsv = typeof propColor === 'string' ? hexToHsv(propColor) : propColor;
        const nextHex = hsvToHex(nextHsv).toLowerCase();

        if (nextHex !== prevSyncedHexRef.current) {
            prevSyncedHexRef.current = nextHex;
            colorRef.current = nextHsv;
            setColor(nextHsv);
        }
    }, [propColor]);

    const computeHValue = (x: number, y: number, size: number) => {
        const mx = size / 2;
        const my = size / 2;
        const dx = x - mx;
        const dy = y - my;
        const rad = Math.atan2(dx, dy) + Math.PI + Math.PI / 2;
        return ((rad * 180) / Math.PI) % 360;
    };

    const handleTouch = useCallback((pageX: number, pageY: number) => {
        const size = pickerSizeRef.current;
        if (!size) return;

        const marginLeft = (layoutRef.current.width - size) / 2;
        const marginTop = (layoutRef.current.height - size) / 2;
        const relativeX = pageX - pagePosRef.current.pageX - marginLeft;
        const relativeY = pageY - pagePosRef.current.pageY - marginTop;

        const h = Math.round(computeHValue(relativeX, relativeY, size) * 10) / 10;
        const current = colorRef.current;

        const newColor: HSVColor = {
            h,
            s: current.s ?? 1,
            v: current.v ?? 1,
        };

        colorRef.current = newColor;
        setColor(newColor);

        // Throttle minor hue oscillations to reduce upstream render noise
        if (Math.abs(h - prevNotifiedHueRef.current) >= 0.8) {
            prevNotifiedHueRef.current = h;
            prevSyncedHexRef.current = hsvToHex(newColor).toLowerCase();
            if (onColorChangeRef.current) {
                onColorChangeRef.current(newColor);
            }
        }
    }, []);

    // Create PanResponder ONCE so gesture handlers remain rock-solid during drag
    const panResponder = useMemo(() => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (evt) => {
                isInteractingRef.current = true;
                if (pickerContainerRef.current) {
                    pickerContainerRef.current.measure((_x, _y, _w, _h, px, py) => {
                        pagePosRef.current = { pageX: px, pageY: py };
                        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
                    });
                } else {
                    handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
                }
            },
            onPanResponderMove: (evt) => {
                handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
            },
            onPanResponderRelease: () => {
                isInteractingRef.current = false;
                if (onColorChangeRef.current) {
                    onColorChangeRef.current(colorRef.current);
                }
            },
            onPanResponderTerminate: () => {
                isInteractingRef.current = false;
            },
        });
    }, [handleTouch]);

    const onLayout = useCallback((event: any) => {
        const { width, height } = event.nativeEvent.layout;
        layoutRef.current = { width, height };
        const size = Math.min(width, height);
        if (size > 0 && Math.abs(size - pickerSizeRef.current) > 1) {
            setPickerSize(size);
        }

        InteractionManager.runAfterInteractions(() => {
            if (pickerContainerRef.current) {
                pickerContainerRef.current.measure((_x, _y, _w, _h, px, py) => {
                    pagePosRef.current = { pageX: px, pageY: py };
                });
            }
        });
    }, []);

    const onSValueChange = useCallback((s: number) => {
        isInteractingRef.current = true;
        const newColor: HSVColor = {
            ...colorRef.current,
            s: Math.round(s * 1000) / 1000,
        };
        colorRef.current = newColor;
        setColor(newColor);
        if (onColorChangeRef.current) {
            onColorChangeRef.current(newColor);
        }
    }, []);

    const onVValueChange = useCallback((v: number) => {
        isInteractingRef.current = true;
        const newColor: HSVColor = {
            ...colorRef.current,
            v: Math.round(v * 1000) / 1000,
        };
        colorRef.current = newColor;
        setColor(newColor);
        if (onColorChangeRef.current) {
            onColorChangeRef.current(newColor);
        }
    }, []);

    const onSlidingComplete = useCallback(() => {
        isInteractingRef.current = false;
        if (onColorChangeRef.current) {
            onColorChangeRef.current(colorRef.current);
        }
    }, []);

    const handleSelectCenter = useCallback(() => {
        const hex = hsvToHex(colorRef.current);
        if (onColorSelectedRef.current) {
            onColorSelectedRef.current(hex);
        }
    }, []);

    const handleSelectOldCenter = useCallback(() => {
        if (oldColor) {
            const parsed = hexToHsv(oldColor);
            colorRef.current = parsed;
            setColor(parsed);
            if (onOldColorSelectedRef.current) {
                onOldColorSelectedRef.current(oldColor);
            }
        }
    }, [oldColor]);

    // Computed visual positioning
    const h = color.h ?? 0;
    const s = color.s ?? 1;
    const v = color.v ?? 1;

    const angle = ((h * Math.PI) / 180) - Math.PI - Math.PI / 2;
    const selectedColor = hsvToHex(color);
    const indicatorColor = hsvToHex({ h, s: 1, v: 1 });

    const summarySize = 0.5 * pickerSize;
    const indicatorPickerRatio = 42 / 510;
    const indicatorSize = indicatorPickerRatio * pickerSize;
    const pickerPadding = indicatorSize / 3;
    const indicatorRadius = pickerSize / 2 - indicatorSize / 2 - pickerPadding;
    const mx = pickerSize / 2;
    const my = pickerSize / 2;
    const dx = Math.cos(angle) * indicatorRadius;
    const dy = Math.sin(angle) * indicatorRadius;

    const SliderComponent = CustomSlider || Slider;

    return (
        <View style={[styles.root, style]}>
            <View
                ref={pickerContainerRef}
                onLayout={onLayout}
                style={styles.pickerContainer}
            >
                {pickerSize > 0 && (
                    <View style={{ width: pickerSize, height: pickerSize }}>
                        {/* Wheel touch surface */}
                        <View
                            {...panResponder.panHandlers}
                            style={[
                                styles.pickerWheel,
                                {
                                    width: pickerSize,
                                    height: pickerSize,
                                    padding: pickerPadding,
                                },
                            ]}
                            collapsable={false}
                        >
                            <Image
                                source={COLOR_CIRCLE_IMG}
                                resizeMode="contain"
                                style={styles.pickerImage}
                            />
                            {/* Thumb indicator */}
                            <View
                                style={[
                                    styles.pickerIndicator,
                                    {
                                        top: my + dy - indicatorSize / 2,
                                        [isRTL ? 'right' : 'left']: mx + dx - indicatorSize / 2,
                                        width: indicatorSize,
                                        height: indicatorSize,
                                        borderRadius: indicatorSize / 2,
                                        backgroundColor: indicatorColor,
                                    },
                                ]}
                            />
                        </View>

                        {/* Center Circle Preview (Tap to select) */}
                        {oldColor ? (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.selectedHalfPreview,
                                        {
                                            width: summarySize / 2,
                                            height: summarySize,
                                            top: pickerSize / 2 - summarySize / 2,
                                            left: Math.floor(pickerSize / 2),
                                            borderTopRightRadius: summarySize / 2,
                                            borderBottomRightRadius: summarySize / 2,
                                            backgroundColor: selectedColor,
                                        },
                                    ]}
                                    onPress={handleSelectCenter}
                                    activeOpacity={0.7}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.originalHalfPreview,
                                        {
                                            width: Math.ceil(summarySize / 2),
                                            height: summarySize,
                                            top: pickerSize / 2 - summarySize / 2,
                                            left: pickerSize / 2 - summarySize / 2,
                                            borderTopLeftRadius: summarySize / 2,
                                            borderBottomLeftRadius: summarySize / 2,
                                            backgroundColor: oldColor,
                                        },
                                    ]}
                                    onPress={handleSelectOldCenter}
                                    activeOpacity={0.7}
                                />
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.selectedFullPreview,
                                    {
                                        width: summarySize,
                                        height: summarySize,
                                        top: pickerSize / 2 - summarySize / 2,
                                        left: pickerSize / 2 - summarySize / 2,
                                        borderRadius: summarySize / 2,
                                        backgroundColor: selectedColor,
                                    },
                                ]}
                                onPress={handleSelectCenter}
                                activeOpacity={0.7}
                            />
                        )}
                    </View>
                )}
            </View>

            {/* Sliders for Saturation & Brightness */}
            {!hideSliders && (
                <View style={styles.slidersContainer}>
                    <SliderComponent
                        value={s}
                        minimumValue={0}
                        maximumValue={1}
                        onValueChange={onSValueChange}
                        onSlidingComplete={onSlidingComplete}
                        minimumTrackTintColor={selectedColor}
                        thumbTintColor={selectedColor}
                        style={styles.slider}
                    />
                    <SliderComponent
                        value={v}
                        minimumValue={0}
                        maximumValue={1}
                        onValueChange={onVValueChange}
                        onSlidingComplete={onSlidingComplete}
                        minimumTrackTintColor={selectedColor}
                        thumbTintColor={selectedColor}
                        style={styles.slider}
                    />
                </View>
            )}
        </View>
    );
};

export const ColorPicker = HoloColorPicker;
export { hsvToHex as fromHsv, hexToHsv as toHsv };

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: '100%',
    },
    pickerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerWheel: {
        position: 'relative',
    },
    pickerImage: {
        width: '100%',
        height: '100%',
    },
    pickerIndicator: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 6,
    },
    selectedFullPreview: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    selectedHalfPreview: {
        position: 'absolute',
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 5,
    },
    originalHalfPreview: {
        position: 'absolute',
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 5,
    },
    slidersContainer: {
        width: '100%',
        paddingTop: 8,
        gap: 4,
    },
    slider: {
        width: '100%',
        height: 38,
    },
});
