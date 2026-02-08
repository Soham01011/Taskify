import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
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
            setIsChecking(false);
            return;
        }

        try {
            await authApi.verify(currentUser.accessToken);
        } catch (error) {
            console.log('Token verification failed, logging out...');
            dispatch(logout());
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        // 1. Check on app open (Initial mount)
        verifyCurrentToken();

        // 2. Setup AppState listener
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [currentUserId]); // Re-run if user changes

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

    return (
        <AuthContext.Provider value={{ isChecking }}>
            {children}
        </AuthContext.Provider>
    );
};
