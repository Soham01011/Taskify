import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, Sparkles } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { useTaskMate, type ChatMessage } from '@/src/hooks/useTaskMate';
import { ChatHeader } from '@/src/components/TaskMate/ChatHeader';
import { ChatInput } from '@/src/components/TaskMate/ChatInput';
import {
    WelcomeSection,
    DownloadOverlay,
    StatusIndicator,
    ChatMessageItem,
} from '@/src/components/TaskMate/MiscComponents';

const CONSENT_STORAGE_KEY = '@taskmate_model_consent';
type ConsentStatus = 'loading' | 'undecided' | 'granted' | 'declined';

export default function TaskMateScreen() {
    const { colors } = useAppTheme();
    const flatListRef = useRef<FlatList>(null);
    const [consentStatus, setConsentStatus] = useState<ConsentStatus>('loading');

    // Load persisted consent on mount
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
                if (!isMounted) return;
                if (stored === 'granted') {
                    setConsentStatus('granted');
                } else if (stored === 'declined') {
                    setConsentStatus('declined');
                } else {
                    setConsentStatus('undecided');
                }
            } catch {
                if (isMounted) setConsentStatus('undecided');
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    const promptConsent = useCallback(() => {
        Alert.alert(
            'Download TaskMate AI Model?',
            'TaskMate runs completely on your device for total privacy and offline use. To use TaskMate, you must download the local AI model (~400 MB).\n\nWould you like to download it now?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                    onPress: async () => {
                        setConsentStatus('declined');
                        try {
                            await AsyncStorage.setItem(CONSENT_STORAGE_KEY, 'declined');
                        } catch (e) {
                            console.error('[MATE] Failed to save consent', e);
                        }
                    },
                },
                {
                    text: 'Yes, Download',
                    onPress: async () => {
                        setConsentStatus('granted');
                        try {
                            await AsyncStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
                        } catch (e) {
                            console.error('[MATE] Failed to save consent', e);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    }, []);

    // Ask user when first entering if consent is not yet decided
    useEffect(() => {
        if (consentStatus === 'undecided') {
            promptConsent();
        }
    }, [consentStatus, promptConsent]);

    const isModelEnabled = consentStatus === 'granted';

    const {
        llm,
        isReady,
        isDownloading,
        downloadProgress,
        messages,
        input,
        setInput,
        handleSend,
        handleInterrupt,
        agentStatus,
    } = useTaskMate(isModelEnabled);

    const renderMessageItem = useCallback(({ item }: { item: ChatMessage }) => (
        <ChatMessageItem item={item} colors={colors} />
    ), [colors]);

    const welcomeHeader = useMemo(() => (
        <View>
            <WelcomeSection
                colors={colors}
                routerReady={isReady && isModelEnabled}
                hasMainModel={isModelEnabled}
                onSetup={promptConsent}
            />

            {consentStatus === 'declined' && (
                <View
                    style={{
                        marginHorizontal: 16,
                        marginTop: 8,
                        marginBottom: 16,
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: colors.primary15,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <AlertCircle size={24} color={colors.primary} />
                    </View>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: colors.text,
                            marginBottom: 4,
                            textAlign: 'center',
                        }}
                    >
                        TaskMate is Disabled
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: colors.textSecondary,
                            textAlign: 'center',
                            lineHeight: 18,
                            marginBottom: 14,
                        }}
                    >
                        You chose not to download the local AI model (~400 MB). Without it, TaskMate cannot process or answer requests.
                    </Text>
                    <TouchableOpacity
                        style={[styles.setupBtn, { backgroundColor: colors.primary }]}
                        onPress={promptConsent}
                        activeOpacity={0.8}
                    >
                        <Sparkles size={16} color={colors.white} />
                        <Text style={styles.setupBtnText}>Download Model (~400 MB)</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    ), [colors, isReady, isModelEnabled, consentStatus, promptConsent]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
                style={{ flex: 1 }}
            >
                <ChatHeader colors={colors} />

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    renderItem={renderMessageItem}
                    ListHeaderComponent={welcomeHeader}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {isDownloading && (
                    <DownloadOverlay
                        colors={colors}
                        progress={downloadProgress}
                        label="Intelligence Model"
                    />
                )}

                <StatusIndicator
                    colors={colors}
                    routerReady={isReady && isModelEnabled}
                    mainLlmReady={isReady && isModelEnabled}
                    hasMainModel={isModelEnabled}
                    error={llm?.error}
                    status={consentStatus === 'declined' ? 'AI model download declined' : agentStatus}
                />

                <ChatInput
                    colors={colors}
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    onInterrupt={handleInterrupt}
                    isReady={isReady && isModelEnabled}
                    isGenerating={llm?.isGenerating}
                    placeholder={
                        isModelEnabled
                            ? isReady
                                ? 'Ask TaskMate anything...'
                                : 'Initializing AI…'
                            : 'Download AI model to use TaskMate'
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
