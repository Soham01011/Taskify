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
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://81f07fb811891ce2d74da64451cccba5@o4510952845344768.ingest.de.sentry.io/4510952849342544',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

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

function RootLayout() {
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

export default Sentry.wrap(RootLayout);