import { useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';
import { RootState } from '../src/store';
import { PALETTE } from '../src/constants/theme';
import { getOpacityVariant, getLighterShade } from '../src/utils/colors';

export const useAppTheme = () => {
    const systemColorScheme = useColorScheme();
    const { currentUserId, users, globalPreferences } = useSelector((state: RootState) => state.auth);

    const currentUser = users.find(u => u.id === currentUserId);
    const themePreference = currentUser?.preferences?.theme || globalPreferences.theme;
    const customPrimaryColor = currentUser?.preferences?.primaryColor || globalPreferences.primaryColor;

    const activeColorScheme = themePreference === 'system'
        ? (systemColorScheme || 'light')
        : themePreference;

    const baseColors = PALETTE[activeColorScheme as 'light' | 'dark'];

    // Override primary color if custom one exists
    const colors = {
        ...baseColors,
        primary: customPrimaryColor || baseColors.primary,
        primaryLight: getLighterShade(customPrimaryColor || baseColors.primary, 0.8),
        primary10: getOpacityVariant(customPrimaryColor || baseColors.primary, 0.1),
        primary15: getOpacityVariant(customPrimaryColor || baseColors.primary, 0.15),
        primary20: getOpacityVariant(customPrimaryColor || baseColors.primary, 0.2),
        primary50: getOpacityVariant(customPrimaryColor || baseColors.primary, 0.5),
        secondary20: getOpacityVariant(baseColors.secondary, 0.2),
        danger10: getOpacityVariant(baseColors.danger, 0.1),
    };

    return {
        colors,
        isDark: activeColorScheme === 'dark',
        themePreference,
        customPrimaryColor
    };
};
