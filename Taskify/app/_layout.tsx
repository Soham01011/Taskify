import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-native-reanimated';
import { useEffect } from 'react';


import { store, persistor, RootState } from '../src/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { NotificationManager } from '../src/components/NotificationManager';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const systemColorScheme = useColorScheme();
  const { isChecking } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { currentUserId, users, globalPreferences } = useSelector((state: RootState) => state.auth);

  const currentUser = users.find(u => u.id === currentUserId);
  const themePreference = currentUser?.preferences?.theme || globalPreferences.theme;

  const activeColorScheme = themePreference === 'system'
    ? systemColorScheme
    : themePreference;

  useEffect(() => {
    if (isChecking) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (currentUserId && inAuthGroup) {
      // User is logged in but trying to access auth screens, redirect to dashboard
      router.replace('/(tabs)');
    } else if (!currentUserId && !inAuthGroup) {
      // User is not logged in but trying to access protected screens, redirect to login
      router.replace('/(auth)');
    }
  }, [currentUserId, isChecking, segments]);

  // Optionally show nothing or a splash screen while checking initial token
  if (isChecking) {
    return null;
  }

  return (
    <ThemeProvider value={activeColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationManager />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ presentation: 'card' }} />
        <Stack.Screen name="modal" options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="group-modal" options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="group-members-modal" options={{ presentation: 'transparentModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}



