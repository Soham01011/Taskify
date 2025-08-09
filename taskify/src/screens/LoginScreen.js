import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from 'expo-linear-gradient';

// Your awesome new color scheme
const colors = {
  darkPurple: "#22092C",
  darkMaroon: "#872341",
  boldRed: "#BE3144",
  vibrantOrange: "#F05941",
  white: "#FFFFFF",
  placeholder: "rgba(190, 49, 68, 0.7)", // A semi-transparent version of boldRed for placeholder text
};

export default function LoginScreen({ navigation }) {
  const [apiUrl, setApiUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Load stored API URL if available
  useEffect(() => {
    const loadUrl = async () => {
      try {
        const storedUrl = await SecureStore.getItemAsync("apiUrl");
        if (storedUrl) {
          setApiUrl(storedUrl);
        }
      } catch (e) {
        console.error("Failed to load API URL from secure store", e);
      }
    };
    loadUrl();
  }, []);

  // The login handler function remains the same
  const handleLogin = async () => {
    if (!apiUrl || !username || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Save the API URL for future sessions
    try {
        await SecureStore.setItemAsync("apiUrl", apiUrl);
    } catch (e) {
        console.error("Failed to save API URL", e);
        Alert.alert("Error", "Could not save API URL for next time.");
    }


    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        await SecureStore.setItemAsync("accessToken", data.accessToken);
        navigation.replace("Home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login API Error:", error);
      Alert.alert("Connection Error", "Unable to connect to the server. Please check the API URL and your network connection.");
    }
  };

  return (
    // Use a LinearGradient for a rich, modern background
    <LinearGradient
      colors={[colors.darkMaroon, colors.darkPurple]}
      style={styles.container}
    >
      {/* Set the status bar to light-content for better visibility on dark backgrounds */}
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="API Base URL (e.g., http://...)"
          placeholderTextColor={colors.placeholder}
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// The new, "cooler" stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.vibrantOrange,
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'left',
    marginBottom: 50,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    width: "100%",
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.darkMaroon,
    color: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 5,
    fontSize: 16,
    marginBottom: 25,
  },
  button: {
    backgroundColor: colors.boldRed,
    padding: 20,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    // Add a subtle shadow for depth and a premium feel
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
