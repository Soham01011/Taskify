import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ setIsLoggedIn }) {
  const [apiUrl, setApiUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Load stored API URL if available
  useEffect(() => {
    const loadUrl = async () => {
      const storedUrl = await SecureStore.getItemAsync('apiUrl');
      if (storedUrl) setApiUrl(storedUrl);
    };
    loadUrl();
  }, []);

  const handleLogin = async () => {
    if (!apiUrl || !username || !password) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    // Save API URL for future logins
    await SecureStore.setItemAsync('apiUrl', apiUrl);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        setIsLoggedIn(true);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to API');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="API Base URL (e.g., http://192.168.x.x:port)"
        value={apiUrl}
        onChangeText={setApiUrl}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f5f5f5', padding: 20
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20
  },
  input: {
    width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 5, marginBottom: 15, backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#007bff', padding: 15, borderRadius: 5, width: '100%', alignItems: 'center'
  },
  buttonText: {
    color: '#fff', fontSize: 16
  }
});
