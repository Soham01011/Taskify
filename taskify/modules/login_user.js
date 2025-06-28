import { Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const handleLogin = async (username, password, navigation) => {
    try {
      const response = await fetch('http://192.168.1.2:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { accessToken, refreshToken, expiresIn} = data;
        await AsyncStorage.multiSet([
          ['@username', username],
          ['@access_token', accessToken],
          ['@refresh_token', refreshToken],
          ['@token_expires_at', (Date.now() + expiresIn * 1000).toString()], // Store exact expiry timestamp
        ]);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });

      } else {
        Alert.alert("Login failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
};
