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
    //checkExistingToken();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);


  const checkExistingToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        const response = await fetch('https://taskify-eight-kohl.vercel.app/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: savedToken }),
        });
        const data = await response.json();
        if (response.ok && data.valid) {
          navigation.replace('Home'); // Token exists, go to Home
        }
      }
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setCheckingToken(false); // Done checking
    }
  };

  // In LoginScreen.js where you handle successful login:
  const handleLogin = async () => {
    try {
      if (!username || !password) {
        Alert.alert('Error', 'Please enter both username and password');
        return;
      }
  
      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }), // Fix: Stringify the body
      });
  
      // Get response text first for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      try {
        const data = JSON.parse(responseText);
        
        if (response.ok && data.accessToken) {
          await AsyncStorage.setItem('token', data.accessToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
          }
          navigation.replace('Home');
        } else {
          Alert.alert('Login failed', data.message || 'Unknown error occurred');
        }
      } catch (parseError) {
        console.error('Response parsing error:', parseError);
        console.error('Response text:', responseText);
        Alert.alert('Error', 'Server returned invalid data. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please check your internet connection.'
      );
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