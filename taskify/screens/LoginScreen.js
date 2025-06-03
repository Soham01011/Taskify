import React ,{ useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { handleLogin } from "../modules/login_user";

export default function LoginScreen(){

    const [username , setUsername] = useState("");
    const [password , setPassword] = useState("");

    const onLoginPress = () => {
        handleLogin(username, password);
    };

    return(
        <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
            style={styles.input}
            placeholder="Username"
            autoCapitalize="none" 
            value={username}
            onChangeText={setUsername} />
        <TextInput 
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true} 
            value={password}
            onChangeText={setPassword} />
            <Button 
                title="Login"
                onPress={onLoginPress}
            />
        <Text style={styles.footerText}>Don't have an account? Sign up</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});