// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen({ navigation }) {
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('apiUrl');
        if (saved) setApiUrl(saved);
      } catch (e) {
        console.warn('Failed to load apiUrl', e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.label}>Saved API URL:</Text>
      <Text style={styles.url}>{apiUrl || 'Not set'}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.buttonText}>Back to Login / Edit URL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, marginBottom: 12 },
  label: { fontSize: 14, color: '#333', marginTop: 8 },
  url: { marginTop: 6, fontSize: 13, color: '#0a66c2' },
  button: { marginTop: 20, backgroundColor: '#e53935', padding: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
