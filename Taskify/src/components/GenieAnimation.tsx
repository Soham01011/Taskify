// src/components/GenieAnimation.tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface GenieAnimationProps {
    children: React.ReactNode;
    exiting?: boolean;
    onExited?: () => void;
}

export const GenieAnimation: React.FC<GenieAnimationProps> = ({
    children,
    exiting = false,
    onExited,
}) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        if (exiting) {
            progress.value = withTiming(
                0,
                { duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1) },
                (finished) => {
                    if (finished && onExited) runOnJS(onExited)();
                }
            );
        } else {
            progress.value = withSpring(1, {
                damping: 18,
                stiffness: 90,
                mass: 1.2,
            });
        }
    }, [exiting]);

    const animatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [300, 0], Extrapolation.CLAMP);
        const scaleY = interpolate(progress.value, [0, 1], [0.1, 1], Extrapolation.CLAMP);
        const scaleX = interpolate(progress.value, [0, 1], [0.2, 1], Extrapolation.CLAMP);
        const rotateX = interpolate(progress.value, [0, 1], [15, 0], Extrapolation.CLAMP);
        const opacity = interpolate(progress.value, [0, 0.25, 1], [0, 0.8, 1], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [
                { perspective: 1000 },
                { translateY },
                { scaleY },
                { scaleX },
                { rotateX: `${rotateX}deg` },
            ],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%' },
});