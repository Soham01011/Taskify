import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, Pressable, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import MaskedView from '@react-native-masked-view/masked-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        navigation.replace('Home');
      } else {
        Alert.alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <MaskedView
        maskElement={<Text style={styles.title}>Taskify</Text>}
      >
        <LinearGradient
          colors={['#0B2F9F', '#7CF5FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.title, { opacity: 0 }]}>Taskify</Text>
        </LinearGradient>
      </MaskedView>

      <View style={styles.form}>
        <LinearGradient colors={['#0B2F9F', '#7CF5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputBorder}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
          />
        </LinearGradient>

        <LinearGradient colors={['#0B2F9F', '#7CF5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputBorder}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        </LinearGradient>

        <Pressable onPress={handleLogin}>
          <LinearGradient colors={['#0B2F9F', '#7CF5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    color: '#fff',
  },
  form: {
    marginTop: height * 0.15,
  },
  inputBorder: {
    borderRadius: 8,
    padding: 1.5,
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#272829',
    color: '#fff',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 40,
    color: '#A1E3F9',
    textAlign: 'center',
  },
});

export default LoginScreen;