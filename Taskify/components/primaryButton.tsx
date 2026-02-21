import React from 'react';
import {
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/theme';
import { ThemedText } from './themed-text';

type PrimaryButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  children,
  onPress,
  disabled = false,
  loading = false,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
}) => {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  const backgroundColor = disabled ? '#9BA1A6' : theme.tint;
  const textColor = disabled ? '#ECEFF1' : '#fff';

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={disabled || loading ? undefined : onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, ...(Platform.OS === 'web' ? { cursor: (disabled ? 'not-allowed' : 'pointer') as any } : {}) },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <ThemedText style={[styles.text, { color: textColor }, contentStyle]}>
        {loading ? 'Loading...' : title ?? children}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%', // will fill parent container
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.997 }],
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PrimaryButton;