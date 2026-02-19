import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAppTheme } from '@/hooks/use-theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading,
    disabled,
    variant = 'primary',
    style,
    textStyle
}) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary': return styles.secondary;
            case 'outline': return styles.outline;
            case 'danger': return styles.danger;
            default: return styles.primary;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline': return styles.outlineText;
            default: return styles.buttonText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    button: {
        height: 50,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        ...SHADOWS.sm,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    danger: {
        backgroundColor: colors.danger,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    outlineText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.5,
    },
});
