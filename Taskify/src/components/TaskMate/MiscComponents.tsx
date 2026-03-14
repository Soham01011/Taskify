import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bot, CircleDashed, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { styles } from '@/assets/styles/mateScreen.styles';

// --- Welcome Section ---
interface WelcomeSectionProps {
    colors: any;
    hasActiveModel: boolean;
    onSetup: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ colors, hasActiveModel, onSetup }) => (
    <View style={styles.introContainer}>
        <View style={[styles.welcomeIcon, { backgroundColor: colors.primary15 }]}>
            <Bot size={40} color={colors.primary} />
        </View>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>I'm TaskMate</Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Your local AI workspace assistant. I run completely on your device, keeping your data private.
        </Text>
        
        {!hasActiveModel && (
            <TouchableOpacity 
                style={[styles.setupBtn, { backgroundColor: colors.primary }]}
                onPress={onSetup}
            >
                <CircleDashed size={20} color={colors.white} />
                <Text style={styles.setupBtnText}>Select a model to start</Text>
            </TouchableOpacity>
        )}
    </View>
);

// --- Download Overlay ---
interface DownloadOverlayProps {
    colors: any;
    progress: number;
}

export const DownloadOverlay: React.FC<DownloadOverlayProps> = ({ colors, progress }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.progressOverlay, { backgroundColor: colors.card }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.progressText, { color: colors.text }]}>
            Downloading Model... {Math.round(progress * 100)}%
        </Text>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <Animated.View 
                style={[
                    styles.progressBarFill, 
                    { backgroundColor: colors.primary, width: `${progress * 100}%` }
                ]} 
            />
        </View>
        <Text style={[styles.progressSubtext, { color: colors.textSecondary }]}>
            This may take a few minutes depending on your connection.
        </Text>
    </Animated.View>
);

// --- Status Indicator ---
interface StatusIndicatorProps {
    colors: any;
    isReady: boolean;
    error: any;
    status: string;
    onRetry: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ colors, isReady, error, status, onRetry }) => (
    <View style={styles.statusIndicator}>
        {status === 'error' || error ? (
            <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                <Text style={[styles.statusText, { color: colors.danger }]}>Error Loading Model</Text>
                <TouchableOpacity onPress={onRetry}>
                    <RefreshCw size={14} color={colors.primary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        ) : status === 'ready' && isReady ? (
            <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>Model Ready</Text>
            </View>
        ) : status === 'initializing' ? (
            <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>Initializing...</Text>
            </View>
        ) : (
            <View style={styles.statusRow}>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.statusText, { color: colors.primary, fontWeight: '700' }]}>
                        {status === 'working' ? 'Agent is working...' : status}
                    </Text>
                </Animated.View>
            </View>
        )}
    </View>
);

