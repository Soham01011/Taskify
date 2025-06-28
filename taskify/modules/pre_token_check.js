import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
export const preTokenCheck = async (refreshToken) => {
    try{
        const response = await fetch('http://192.168.1.2:5000/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        body: JSON.stringify({
                token: refreshToken,
            }),
        });
        const data = await response.json();

        if(response.ok) {
            const { accessToken , expiresIn } = data;
            await AsymcStorage.multiSet([
                ['@access_token', accessToken],
                ['@token_expires_at', (Date.now() + expiresIn * 1000).toString()], // Store exact expiry timestamp
            ]);
            return accessToken; 
        }
        else {
            await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@token_expires_at']);
            return null;
        }
    }
    catch (error) {
        console.error("Error during pre-token check:", error);
        Alert.alert("Error", "Something went wrong. Please try again later.");
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@token_expires_at']);
        return null;
    }
}