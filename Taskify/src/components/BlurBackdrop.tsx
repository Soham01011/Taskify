import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface BlurBackdropProps {
    visible: boolean;
    target: React.RefObject<View | null>;
    tint: 'light' | 'dark' | 'default';
    maxIntensity?: number;
    duration?: number;
}

export const BlurBackdrop: React.FC<BlurBackdropProps> = ({
    visible,
    target,
    tint,
    maxIntensity = 50,
    duration = 250,
}) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(visible ? 1 : 0, {
            duration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
    }, [visible, duration]);

    const blurProps = useAnimatedProps(() => ({
        intensity: progress.value * maxIntensity,
    }));

    const tintStyle = useAnimatedStyle(() => {
        const alpha = interpolate(progress.value, [0, 1], [0, 0.4]);
        return {
            backgroundColor: `rgba(0, 0, 0, ${alpha})`,
        };
    });

    const androidProps = Platform.OS === 'android'
        ? { blurTarget: target, blurMethod: 'dimezisBlurView' as const }
        : {};

    return (
        <AnimatedBlurView
            {...androidProps}
            animatedProps={blurProps}
            tint={tint}
            style={StyleSheet.absoluteFill}
        >
            <Animated.View style={[StyleSheet.absoluteFill, tintStyle]} />
        </AnimatedBlurView>
    );
};