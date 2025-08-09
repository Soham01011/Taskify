import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../auth/AuthContext';
import React from 'react';

const api = axios.create();

export const useAxiosWithAuth = () => {
  const { refreshAccessToken, signOut, apiUrl } = React.useContext(AuthContext);

  React.useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      let token = await SecureStore.getItemAsync('accessToken');
      if (!token || !apiUrl) return config;

      try {
        await axios.post(`${apiUrl}/auth/verify`, { accessToken: token });
      } catch (err) {
        try {
          token = await refreshAccessToken();
        } catch {
          signOut();
          return config;
        }
      }

      config.baseURL = apiUrl.replace(/\/$/, ''); // Ensure no trailing slash
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [refreshAccessToken, signOut, apiUrl]);

  return api;
};

export default api;
