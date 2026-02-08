import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    rightIcon,
    style,
    containerStyle,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                error ? styles.inputError : null,
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.placeholder}
                    {...props}
                />
                {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.sm,
        height: 50,
    },
    input: {
        flex: 1,
        height: '100%',
        color: COLORS.text,
        fontSize: 16,
        paddingHorizontal: SPACING.sm,
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    iconContainer: {
        paddingHorizontal: SPACING.xs,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 12,
        marginTop: SPACING.xs,
        marginLeft: SPACING.xs,
    },
});
