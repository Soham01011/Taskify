import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bot, CircleDashed, Sparkles, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { styles } from '@/assets/styles/mateScreen.styles';

// ─── Welcome Section ──────────────────────────────────────────────────────────
interface WelcomeSectionProps {
    colors: any;
    routerReady: boolean;
    hasMainModel: boolean;
    onSetup: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ colors, routerReady, hasMainModel, onSetup }) => (
    <View style={styles.introContainer}>
        <View style={[styles.welcomeIcon, { backgroundColor: colors.primary15 }]}>
            <Bot size={40} color={colors.primary} />
        </View>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>I'm TaskMate</Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Your local AI workspace assistant. A fast regex router handles direct actions instantly — no LLM needed. Complex reasoning goes to your chosen model.
        </Text>

        {routerReady && !hasMainModel && (
            <View style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Text style={[styles.welcomeSubtitle, { color: colors.primary, fontWeight: '600', marginBottom: 0 }]}>
                    ✅ Router active — create tasks, ideas, and group tasks now!
                </Text>
                <TouchableOpacity 
                    style={[styles.setupBtn, { backgroundColor: colors.primary }]}
                    onPress={onSetup}
                >
                    <Sparkles size={16} color={colors.white} />
                    <Text style={styles.setupBtnText}>Add a reasoning model for complex questions</Text>
                </TouchableOpacity>
            </View>
        )}

        {!routerReady && (
            <TouchableOpacity 
                style={[styles.setupBtn, { backgroundColor: colors.primary }]}
                onPress={onSetup}
            >
                <CircleDashed size={20} color={colors.white} />
                <Text style={styles.setupBtnText}>Initializing AI Router…</Text>
            </TouchableOpacity>
        )}
    </View>
);

// ─── Download Overlay ─────────────────────────────────────────────────────────
interface DownloadOverlayProps {
    colors: any;
    progress: number;
    label: string;
}

export const DownloadOverlay: React.FC<DownloadOverlayProps> = ({ colors, progress, label }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.progressOverlay, { backgroundColor: colors.card }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.progressText, { color: colors.text }]}>
            Downloading {label}… {Math.round(progress * 100)}%
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

// ─── Status Indicator ─────────────────────────────────────────────────────────
interface StatusIndicatorProps {
    colors: any;
    routerReady: boolean;
    mainLlmReady: boolean;
    hasMainModel: boolean;
    error: any;
    status: string;
    onRetry: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    analyzing: 'Analyzing prompt…',
    executing: 'Executing…',
    fetching: 'Fetching context…',
    thinking: 'Thinking…',
    working: 'Working…',
    initializing: 'Initializing AI Router…',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    colors, routerReady, mainLlmReady, hasMainModel, error, status, onRetry
}) => (
    <View style={styles.statusIndicator}>
        {error ? (
            <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                <Text style={[styles.statusText, { color: colors.danger }]}>Model Error</Text>
                <TouchableOpacity onPress={onRetry}>
                    <RefreshCw size={14} color={colors.primary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        ) : status === 'ready' && routerReady ? (
            <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                    Router Ready{hasMainModel && mainLlmReady ? ' · Reasoning Model Ready' : hasMainModel ? ' · Loading reasoning model…' : ''}
                </Text>
            </View>
        ) : status === 'initializing' ? (
            <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>Initializing AI Router…</Text>
            </View>
        ) : (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.statusRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.primary, fontWeight: '700' }]}>
                    {STATUS_LABELS[status] || status}
                </Text>
            </Animated.View>
        )}
    </View>
);
