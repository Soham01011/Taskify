import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/assets/styles/mateScreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { useTaskMate, ChatMessage } from '@/src/hooks/useTaskMate';
import { ChatHeader } from '@/src/components/TaskMate/ChatHeader';
import { ModelDropdown } from '@/src/components/TaskMate/ModelDropdown';
import { ChatInput } from '@/src/components/TaskMate/ChatInput';
import { WelcomeSection, DownloadOverlay, StatusIndicator } from '@/src/components/TaskMate/MiscComponents';
import { ControlCenter } from '@/src/components/TaskMate/ControlCenter';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

export default function TaskMateScreen() {
    const { colors } = useAppTheme();
    const { selectedReasoningModelId } = useSelector((s: RootState) => s.mateConfig);
    const [selectedModelId, setSelectedModelId] = useState(selectedReasoningModelId);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showControlCenter, setShowControlCenter] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const {
        llm,
        routerReady,
        mainLlmReady,
        phase,
        isDownloading,
        downloadProgress,
        messages,
        input,
        setInput,
        handleSend,
        handleSelectModel,
        handleDeleteModel,
        downloadedModels,
        activeModel,
        agentStatus,
        capability,
    } = useTaskMate(selectedModelId, setSelectedModelId);

    const renderMessageItem = useCallback(({ item }: { item: ChatMessage }) => (
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
    ), [colors]);

    const downloadLabel = phase === 'routing'
        ? 'AI Router (SmolLM2 360M)'
        : 'Reasoning Model';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ChatHeader
                    colors={colors}
                    selectedModelId={selectedModelId}
                    onToggleDropdown={() => setShowDropdown(!showDropdown)}
                    onToggleControlCenter={() => setShowControlCenter(!showControlCenter)}
                />

                {showDropdown && (
                    <ModelDropdown
                        colors={colors}
                        selectedModelId={selectedModelId}
                        downloadedModels={downloadedModels}
                        onClose={() => setShowDropdown(false)}
                        onSelect={(m) => { handleSelectModel(m); setShowDropdown(false); }}
                        onDelete={handleDeleteModel}
                    />
                )}

                {showControlCenter && (
                    <ControlCenter 
                        colors={colors} 
                        onClose={() => setShowControlCenter(false)} 
                    />
                )}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    renderItem={renderMessageItem}
                    ListHeaderComponent={() => (
                        <WelcomeSection
                            colors={colors}
                            routerReady={routerReady}
                            hasMainModel={!!activeModel}
                            onSetup={() => setShowDropdown(true)}
                        />
                    )}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {isDownloading && (
                    <DownloadOverlay
                        colors={colors}
                        progress={downloadProgress}
                        label={downloadLabel}
                    />
                )}

                <StatusIndicator
                    colors={colors}
                    routerReady={routerReady}
                    mainLlmReady={mainLlmReady}
                    hasMainModel={!!activeModel}
                    error={llm.error}
                    status={agentStatus}
                    onRetry={() => setShowDropdown(true)}
                />

                <ChatInput
                    colors={colors}
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    isReady={routerReady}
                    isGenerating={llm.isGenerating}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
