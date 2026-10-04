import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bot, CircleDashed, Sparkles, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { styles } from '@/assets/styles/mateScreen.styles';
import { ChatMessage as ChatMessageType } from '@/src/hooks/TaskMate/types';

// ─── Welcome Section ──────────────────────────────────────────────────────────
export interface WelcomeSectionProps {
    colors: any;
    routerReady?: boolean;
    hasMainModel?: boolean;
    onSetup?: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
    colors,
    routerReady = false,
    hasMainModel = true,
    onSetup,
}) => (
    <View style={styles.introContainer}>
        <View style={[styles.welcomeIcon, { backgroundColor: colors.primary15 }]}>
            <Bot size={40} color={colors.primary} />
        </View>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>I'm TaskMate</Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Your local AI assistant. Powered by Hammer (tool routing) + Qwen3 (reasoning) — all on-device, no cloud needed.
        </Text>

        {routerReady && hasMainModel && (
            <View style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Text style={[styles.welcomeSubtitle, { color: colors.primary, fontWeight: '600', marginBottom: 0 }]}>
                    ✅ Ready — type to begin!
                </Text>
            </View>
        )}

        {!routerReady && hasMainModel && (
            <TouchableOpacity
                style={[styles.setupBtn, { backgroundColor: colors.primary, opacity: onSetup ? 1 : 0.8 }]}
                onPress={onSetup}
                disabled={!onSetup}
            >
                <CircleDashed size={20} color={colors.white} />
                <Text style={styles.setupBtnText}>Initializing AI…</Text>
            </TouchableOpacity>
        )}

        {!hasMainModel && (
            <TouchableOpacity
                style={[styles.setupBtn, { backgroundColor: colors.primary, opacity: onSetup ? 1 : 0.8 }]}
                onPress={onSetup}
                disabled={!onSetup}
            >
                <Sparkles size={16} color={colors.white} />
                <Text style={styles.setupBtnText}>Download AI models to begin</Text>
            </TouchableOpacity>
        )}
    </View>
);

// ─── Download Overlay ─────────────────────────────────────────────────────────
export interface DownloadOverlayProps {
    colors: any;
    progress: number;
    label: string;
}

export const DownloadOverlay: React.FC<DownloadOverlayProps> = ({ colors, progress, label }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.progressOverlay, { backgroundColor: colors.card }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.progressText, { color: colors.text }]}>
            {progress < 1 ? 'Downloading' : 'Loading'} {label}… {Math.round(progress * 100)}%
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
export interface StatusIndicatorProps {
    colors: any;
    routerReady?: boolean;
    mainLlmReady?: boolean;
    hasMainModel?: boolean;
    error?: any;
    status?: string;
    onRetry?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    analyzing: 'Analyzing prompt…',
    executing: 'Executing…',
    fetching: 'Fetching context…',
    thinking: 'Thinking…',
    working: 'Working…',
    initializing: 'Initializing AI…',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    colors,
    routerReady = false,
    mainLlmReady = false,
    hasMainModel = true,
    error,
    status = 'ready',
    onRetry,
}) => {
    const isActuallyReady = status === 'ready' && routerReady;

    return (
        <View style={styles.statusIndicator}>
            {error ? (
                <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                    <Text style={[styles.statusText, { color: colors.danger }]}>
                        {typeof error === 'string' ? error : error?.message || 'Model Error'}
                    </Text>
                    {onRetry && (
                        <TouchableOpacity onPress={onRetry}>
                            <RefreshCw size={14} color={colors.primary} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : isActuallyReady ? (
                <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                        AI Active
                    </Text>
                </View>
            ) : !hasMainModel ? (
                <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: colors.textSecondary + '50' }]} />
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>No model selected</Text>
                </View>
            ) : (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.statusRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.statusText, { color: colors.primary, fontWeight: '700' }]}>
                        {typeof status === 'string' && (status.includes('Downloading') || status.includes('Loading'))
                            ? status
                            : (STATUS_LABELS[status] || status || 'Loading…')}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

// ─── Chat Message Item ────────────────────────────────────────────────────────
export interface ChatMessageItemProps {
    item: ChatMessageType;
    colors: any;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(({ item, colors }) => (
    <View style={[
        styles.messageWrapper,
        item.role === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
    ]}>
        <View style={[
            styles.messageBubble,
            item.role === 'user'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        ]}>
            {item.role === 'user' ? (
                <Text style={[styles.messageText, { color: colors.white }]}>{item.content}</Text>
            ) : (
                <Markdown style={{
                    body: { color: colors.text, fontSize: 14, lineHeight: 21 },
                    strong: { color: colors.text, fontWeight: '700' },
                    em: { color: colors.textSecondary, fontStyle: 'italic' },
                    bullet_list: { marginVertical: 4 },
                    ordered_list: { marginVertical: 4 },
                    list_item: { marginVertical: 2 },
                    code_inline: { backgroundColor: colors.primary10, color: colors.primary, borderRadius: 4, paddingHorizontal: 4, fontFamily: 'monospace', fontSize: 12 },
                    fence: { backgroundColor: colors.primary10, borderRadius: 8, padding: 10, marginVertical: 6 },
                    code_block: { backgroundColor: colors.primary10, borderRadius: 8, padding: 10, fontFamily: 'monospace', fontSize: 12 },
                    heading1: { color: colors.text, fontWeight: '700', fontSize: 18, marginVertical: 6 },
                    heading2: { color: colors.text, fontWeight: '700', fontSize: 16, marginVertical: 4 },
                    heading3: { color: colors.text, fontWeight: '600', fontSize: 15, marginVertical: 3 },
                    hr: { borderColor: colors.border },
                    blockquote: { borderLeftColor: colors.primary, borderLeftWidth: 3, paddingLeft: 10, color: colors.textSecondary },
                }}>
                    {item.content}
                </Markdown>
            )}
        </View>
    </View>
));

export const ChatMessage = ChatMessageItem;

