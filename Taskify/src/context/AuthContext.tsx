import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, updateTokens } from '../store/slices/authSlice';
import { authApi } from '../api/auth';

interface AuthContextType {
    isChecking: boolean;
}

const AuthContext = createContext<AuthContextType>({ isChecking: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    const { users, currentUserId } = useSelector((state: RootState) => state.auth);
    const [isChecking, setIsChecking] = useState(true);
    const appState = useRef(AppState.currentState);
    const backgroundTime = useRef<number | null>(null);

    const currentUser = users.find(u => u.id === currentUserId);

    const verifyCurrentToken = async () => {
        if (!currentUser?.accessToken) {
            console.log('No access token found, logging out...');
            dispatch(logout());
            setIsChecking(false);
            return;
        }

        let needsRefresh = false;

        try {
            await authApi.verify(currentUser.accessToken);
            console.log('Token verification successful');
            setIsChecking(false);
        } catch (error) {
            console.log('Token verification failed, attempting refresh...');
            needsRefresh = true;
        }

        if (needsRefresh) {
            if (currentUser.refreshToken) {
                let refreshData: any = null;
                try {
                    const response = await authApi.refresh(currentUser.refreshToken);
                    refreshData = response.data;
                } catch (refreshError) {
                    console.log('Token refresh failed, logging out...');
                    dispatch(logout());
                    setIsChecking(false);
                    return;
                }

                if (refreshData) {
                    const finalRefreshToken = refreshData.refreshToken || currentUser.refreshToken;

                    dispatch(updateTokens({
                        userId: currentUser.id,
                        accessToken: refreshData.accessToken,
                        refreshToken: finalRefreshToken
                    }));

                    console.log('Token refresh successful');
                    setIsChecking(false);
                }
            } else {
                console.log('No refresh token available, logging out...');
                dispatch(logout());
                setIsChecking(false);
            }
        }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            // App has come to the foreground
            if (backgroundTime.current) {
                const timeInBackground = Date.now() - backgroundTime.current;
                console.log(`App spent ${timeInBackground}ms in background`);

                // If spent more than 1 minute (60,000 ms) in background, verify token
                if (timeInBackground > 60000) {
                    console.log('Spending > 1 min in background, verifying token...');
                    await verifyCurrentToken();
                }
            }
            backgroundTime.current = null;
        } else if (nextAppState.match(/inactive|background/)) {
            // App has gone to the background
            backgroundTime.current = Date.now();
        }

        appState.current = nextAppState;
    };

    useEffect(() => {
        // 1. Check on app open (Initial mount)
        const timer = setTimeout(() => {
            verifyCurrentToken();
        }, 0);

        // 2. Setup AppState listener
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            clearTimeout(timer);
            subscription.remove();
        };
    }, [currentUserId]); // Re-run if user changes

    return (
        <AuthContext.Provider value={{ isChecking }}>
            {children}
        </AuthContext.Provider>
    );
};
