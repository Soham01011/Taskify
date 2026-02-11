import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    interpolate,
} from 'react-native-reanimated';

interface GenieAnimationProps {
    children: React.ReactNode;
    isVisible: boolean;
}

export const GenieAnimation: React.FC<GenieAnimationProps> = ({ children, isVisible }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            progress.value = withSpring(1, {
                damping: 18,
                stiffness: 90,
                mass: 1.2,
            });
        } else {
            progress.value = withTiming(0, {
                duration: 300,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            });
        }
    }, [isVisible, progress]);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        // Use sine curve for top edge (faster expansion)
        const topProgress = Math.sin(progress.value * Math.PI / 2);

        // Use cosine curve for bottom edge (slower catch-up)
        const bottomProgress = 1 - Math.cos(progress.value * Math.PI / 2);

        // Scale and translate transformations
        const scaleY = interpolate(progress.value, [0, 1], [0.1, 1]);
        const scaleX = interpolate(topProgress, [0, 1], [0.2, 1]);

        // Top moves faster (sine curve)
        const translateY = interpolate(topProgress, [0, 1], [300, 0]);

        // 3D rotation for genie effect (bottom catches up slower)
        const rotateX = interpolate(bottomProgress, [0, 1], [15, 0]);

        const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0.8, 1]);

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
    container: {
        width: '100%',
    },
});
