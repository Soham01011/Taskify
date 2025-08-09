import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [apiUrl, setApiUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreData = async () => {
      const storedAccessToken = await SecureStore.getItemAsync('accessToken');
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      const storedApiUrl = await SecureStore.getItemAsync('apiUrl');

      if (storedAccessToken) setAccessToken(storedAccessToken);
      if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      if (storedApiUrl) setApiUrl(storedApiUrl);

      setLoading(false);
    };
    restoreData();
  }, []);

  const saveApiUrl = async (url) => {
    await SecureStore.setItemAsync('apiUrl', url);
    setApiUrl(url);
  };

  const signIn = async (email, password, url) => {
    try {
      await saveApiUrl(url); // Save API URL for future
      const res = await axios.post(`${url}/auth/login`, { email, password });
      const { accessToken, refreshToken } = res.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.post(`${apiUrl}/auth/refresh`, { refreshToken });
      const { accessToken: newAccessToken } = res.data;
      await SecureStore.setItemAsync('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      signOut();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      accessToken,
      refreshToken,
      apiUrl,
      loading,
      signIn,
      signOut,
      refreshAccessToken,
      saveApiUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};
