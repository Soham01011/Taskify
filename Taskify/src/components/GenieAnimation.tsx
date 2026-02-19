import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    withTiming,
    withSpring,
    Easing,
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
            opacity: withTiming(1, { duration: 400 }),
            transform: [
                { perspective: withTiming(1000) },
                { translateY: withSpring(0, { damping: 18, stiffness: 90, mass: 1.2 }) },
                { scaleY: withSpring(1, { damping: 18, stiffness: 90, mass: 1.2 }) },
                { scaleX: withSpring(1, { damping: 18, stiffness: 90, mass: 1.2 }) },
                { rotateX: withSpring('0deg', { damping: 18, stiffness: 90 }) },
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
            opacity: withTiming(0, { duration: 300 }),
            transform: [
                { perspective: withTiming(1000) },
                { translateY: withTiming(300, { duration: 300, easing: Easing.bezier(0.4, 0.0, 0.2, 1) }) },
                { scaleY: withTiming(0.1, { duration: 300 }) },
                { scaleX: withTiming(0.2, { duration: 300 }) },
                { rotateX: withTiming('15deg', { duration: 300 }) },
            ],
        },
    };
};

export const GenieAnimation: React.FC<GenieAnimationProps> = ({ children }) => {
    return (
        <Animated.View
            entering={CustomGenieIn}
            exiting={CustomGenieOut}
            style={styles.container}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});
