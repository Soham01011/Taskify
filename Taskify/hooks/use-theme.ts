import { useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';
import { RootState } from '../src/store';
import { PALETTE } from '../src/constants/theme';

export const useAppTheme = () => {
    const systemColorScheme = useColorScheme();
    const { currentUserId, users, globalPreferences } = useSelector((state: RootState) => state.auth);

    const currentUser = users.find(u => u.id === currentUserId);
    const themePreference = currentUser?.preferences?.theme || globalPreferences.theme;

    const activeColorScheme = themePreference === 'system'
        ? (systemColorScheme || 'light')
        : themePreference;

    return {
        colors: PALETTE[activeColorScheme as 'light' | 'dark'],
        isDark: activeColorScheme === 'dark',
        themePreference
    };
};
