import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface GenieAnimationProps {
    children: React.ReactNode;
}

export const CustomGenieIn = () => {
    'worklet';
    return {
        initialValues: {
            opacity: 0,
            transform: [
                { perspective: 1000 },
                { translateY: 300 },
                { scaleY: 0.1 },
                { scaleX: 0.2 },
                { rotateX: '15deg' },
            ],
        },
        animations: {
            opacity: withTiming(1, { duration: 350 }),
            transform: [
                { perspective: 1000 },
                { translateY: withSpring(0, { damping: 18, stiffness: 90, mass: 1.2 }) },
                { scaleY: withSpring(1, { damping: 18, stiffness: 90, mass: 1.2 }) },
                { scaleX: withSpring(1, { damping: 18, stiffness: 90, mass: 1.2 }) },
                { rotateX: withTiming('0deg', { duration: 350 }) },
            ],
        },
    };
};

export const CustomGenieOut = () => {
    'worklet';
    return {
        initialValues: {
            opacity: 1,
            transform: [
                { perspective: 1000 },
                { translateY: 0 },
                { scaleY: 1 },
                { scaleX: 1 },
                { rotateX: '0deg' },
            ],
        },
        animations: {
            opacity: withTiming(0, { duration: 250 }),
            transform: [
                { perspective: 1000 },
                { translateY: withTiming(300, { duration: 250, easing: Easing.bezier(0.4, 0.0, 0.2, 1) }) },
                { scaleY: withTiming(0.1, { duration: 250 }) },
                { scaleX: withTiming(0.2, { duration: 250 }) },
                { rotateX: withTiming('15deg', { duration: 250 }) },
            ],
        },
    };
};

export const GenieAnimation: React.FC<GenieAnimationProps> = ({ children }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withSpring(1, {
            damping: 18,
            stiffness: 90,
            mass: 1.2,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [300, 0], Extrapolation.CLAMP);
        const scaleY = interpolate(progress.value, [0, 1], [0.1, 1], Extrapolation.CLAMP);
        const scaleX = interpolate(progress.value, [0, 1], [0.2, 1], Extrapolation.CLAMP);
        const rotateXDeg = interpolate(progress.value, [0, 1], [15, 0], Extrapolation.CLAMP);
        const opacity = interpolate(progress.value, [0, 0.25, 1], [0, 0.8, 1], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [
                { perspective: 1000 },
                { translateY },
                { scaleY },
                { scaleX },
                { rotateX: `${rotateXDeg}deg` },
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
    container: {
        width: '100%',
    },
});
