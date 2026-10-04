import React, { useCallback, useRef, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function TaskMateScreen() {
    const { colors } = useAppTheme();
    const flatListRef = useRef<FlatList>(null);

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
    } = useTaskMate();

    const renderMessageItem = useCallback(({ item }: { item: ChatMessage }) => (
        <ChatMessageItem item={item} colors={colors} />
    ), [colors]);

    const welcomeHeader = useMemo(() => (
        <WelcomeSection
            colors={colors}
            routerReady={isReady}
            hasMainModel={true}
        />
    ), [colors, isReady]);

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
                    routerReady={isReady}
                    mainLlmReady={isReady}
                    hasMainModel={true}
                    error={llm?.error}
                    status={agentStatus}
                />

                <ChatInput
                    colors={colors}
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    onInterrupt={handleInterrupt}
                    isReady={isReady}
                    isGenerating={llm?.isGenerating}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
