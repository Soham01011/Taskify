import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen.js'; // Example main screen
import { preTokenCheck } from './modules/pre_token_check';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      const accessToken = await AsyncStorage.getItem('@access_token');
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      const expiresAtStr = await AsyncStorage.getItem('@token_expires_at');

      const expiresAt = expiresAtStr ? parseInt(expiresAtStr) : 0;
      const now = Date.now();

      if (accessToken && expiresAt > now) {
        console.log("Token is active and sending the use to home.")
        // Access token still valid
        setInitialRoute('Home');
      } else if (refreshToken) {
        // Try refresh
        const newAccessToken = await preTokenCheck(refreshToken);
        if (newAccessToken) {
          console.log("Token refreshed successfully, sending the user to home.");
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } else {
        setInitialRoute('Login');
      }
    };

    bootstrapAsync();
  }, []);

  if (!initialRoute) return null; // or splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
