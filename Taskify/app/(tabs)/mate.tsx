import { styles } from '@/assets/styles/mateScreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import {
    Bot,
    CheckCircle2,
    ChevronDown,
    CircleDashed,
    Mic,
    RefreshCw,
    ScanLine,
    Send,
    Trash2,
    Volume2,
    X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { QWEN2_5_1_5B_QUANTIZED, ResourceFetcher, useLLM } from 'react-native-executorch';
import Animated, {
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomGenieIn, CustomGenieOut } from '@/src/components/GenieAnimation';


// Model Types & Constants
const MODEL_SECTIONS = [
    {
        title: 'Large Language Models',
        icon: <Bot size={18} color="#6366f1" />,
        type: 'llm',
        models: [
            { id: 'qwen_3_5_2b', name: 'Qwen 2.5 1.5B (Quantized)', config: QWEN2_5_1_5B_QUANTIZED }
        ]
    },
    {
        title: 'Voice to Text',
        icon: <Mic size={18} color="#10b981" />,
        type: 'vtt',
        models: []
    },
    {
        title: 'Text to Voice',
        icon: <Volume2 size={18} color="#f59e0b" />,
        type: 'ttv',
        models: []
    },
    {
        title: 'OCR Models',
        icon: <ScanLine size={18} color="#ec4899" />,
        type: 'ocr',
        models: []
    }
];

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export default function TaskMateScreen() {
    const { colors, isDark } = useAppTheme();
    const [selectedModelId, setSelectedModelId] = useState('qwen_3_5_2b');
    const [activeModel, setActiveModel] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const flatListRef = useRef<FlatList>(null);

    // Initialize LLM
    const llm = useLLM({
        model: activeModel || QWEN2_5_1_5B_QUANTIZED,
        preventLoad: !activeModel
    });

    // Check for downloaded models
    const updateDownloadedModels = useCallback(async () => {
        try {
            const models = await ResourceFetcher.listDownloadedModels();
            setDownloadedModels(models);
        } catch (error) {
            console.error('Failed to list models:', error);
        }
    }, []);

    useEffect(() => {
        updateDownloadedModels();
    }, [updateDownloadedModels]);

    // Handle Model Selection
    const handleSelectModel = (model: any) => {
        if (model.id === selectedModelId && activeModel) {
            setShowDropdown(false);
            return;
        }

        setSelectedModelId(model.id);
        setActiveModel(model.config);
        setShowDropdown(false);

        // Clear chat when model changes? (Optional)
        // setMessages([]);
    };

    // Delete Model
    const handleDeleteModel = async (model: any) => {
        Alert.alert(
            'Delete Model',
            `Are you sure you want to delete ${model.name}? You will need to download it again to use it.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // ResourceFetcher.deleteResources takes the model source/object
                            await ResourceFetcher.deleteResources(model.config.modelSource);
                            if (model.config.tokenizerSource) {
                                await ResourceFetcher.deleteResources(model.config.tokenizerSource);
                            }
                            if (model.config.tokenizerConfigSource) {
                                await ResourceFetcher.deleteResources(model.config.tokenizerConfigSource);
                            }

                            // If it's the current model, unload it
                            if (selectedModelId === model.id) {
                                setActiveModel(null);
                            }

                            updateDownloadedModels();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete model resources.');
                        }
                    }
                }
            ]
        );
    };

    // Send Message
    const handleSend = async () => {
        if (!input.trim() || !llm.isReady) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            // We use history for managed chat
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            history.push({ role: 'user', content: userMsg.content });

            await llm.generate(history);
        } catch (error) {
            console.error('Generation failed:', error);
        }
    };

    // Update messages when LLM response changes
    useEffect(() => {
        if (llm.response) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
                // Update existing assistant message
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastIndex = newMsgs.length - 1;
                    if (lastIndex >= 0 && newMsgs[lastIndex].role === 'assistant') {
                        newMsgs[lastIndex] = {
                            ...newMsgs[lastIndex],
                            content: llm.response
                        };
                    }
                    return newMsgs;
                });
            } else {
                // Add new assistant message
                setMessages(prev => [...prev, {
                    id: 'ai-' + Date.now(),
                    role: 'assistant',
                    content: llm.response,
                    timestamp: Date.now()
                }]);
            }
        }
    }, [llm.response]);

    const isDownloading = !llm.isReady && llm.downloadProgress > 0 && llm.downloadProgress < 1;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Custom Header */}
                <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={styles.headerTitleContainer}>
                        <Bot size={24} color={colors.primary} strokeWidth={2.5} />
                        <Text style={[styles.headerTitle, { color: colors.text }]}>TaskMate</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.modelSelector, { backgroundColor: colors.background }]}
                        onPress={() => setShowDropdown(!showDropdown)}
                    >
                        <Text style={[styles.modelName, { color: colors.text }]} numberOfLines={1}>
                            {MODEL_SECTIONS[0].models.find(m => m.id === selectedModelId)?.name || 'Select Model'}
                        </Text>
                        <ChevronDown size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={[styles.dropdownOverlay, { backgroundColor: colors.overlay }]}
                    >
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            onPress={() => setShowDropdown(false)}
                        />
                        <Animated.View
                            entering={CustomGenieIn}
                            exiting={CustomGenieOut}
                            style={[styles.dropdownMenu, { backgroundColor: colors.card }]}
                        >
                            <View style={styles.dropdownHeader}>
                                <Text style={[styles.dropdownTitle, { color: colors.text }]}>Intelligence Models</Text>
                                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                                    <X size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={MODEL_SECTIONS}
                                keyExtractor={item => item.type}
                                renderItem={({ item: section }) => (
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            {section.icon}
                                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
                                        </View>

                                        {section.models.length === 0 ? (
                                            <Text style={[styles.emptySection, { color: colors.textSecondary }]}>No models available</Text>
                                        ) : (
                                            section.models.map(model => {
                                                const isDownloaded = downloadedModels.some(m => m.includes(model.config.modelSource.split('/').pop() || ''));
                                                const isSelected = selectedModelId === model.id;

                                                return (
                                                    <TouchableOpacity
                                                        key={model.id}
                                                        style={[
                                                            styles.modelItem,
                                                            isSelected && { backgroundColor: colors.primary10 }
                                                        ]}
                                                        onPress={() => handleSelectModel(model)}
                                                    >
                                                        <View style={styles.modelItemInfo}>
                                                            <Text style={[
                                                                styles.modelItemName,
                                                                { color: isSelected ? colors.primary : colors.text }
                                                            ]}>
                                                                {model.name}
                                                            </Text>
                                                            {isDownloaded && <CheckCircle2 size={14} color={colors.primary} />}
                                                        </View>

                                                        {isDownloaded && (
                                                            <TouchableOpacity
                                                                onPress={() => handleDeleteModel(model)}
                                                                style={styles.deleteBtn}
                                                            >
                                                                <Trash2 size={18} color={colors.danger} />
                                                            </TouchableOpacity>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })
                                        )}
                                    </View>
                                )}
                            />
                        </Animated.View>
                    </Animated.View>
                )}

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageWrapper,
                            item.role === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper
                        ]}>
                            <View style={[
                                styles.messageBubble,
                                item.role === 'user' ?
                                    { backgroundColor: colors.primary } :
                                    { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                            ]}>
                                <Text style={[
                                    styles.messageText,
                                    { color: item.role === 'user' ? colors.white : colors.text }
                                ]}>
                                    {item.content}
                                </Text>
                            </View>
                        </View>
                    )}
                    ListHeaderComponent={() => (
                        <View style={styles.introContainer}>
                            <View style={[styles.welcomeIcon, { backgroundColor: colors.primary15 }]}>
                                <Bot size={40} color={colors.primary} />
                            </View>
                            <Text style={[styles.welcomeTitle, { color: colors.text }]}>I'm TaskMate</Text>
                            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                                Your local AI workspace assistant. I run completely on your device, keeping your data private.
                            </Text>

                            {!activeModel && (
                                <TouchableOpacity
                                    style={[styles.setupBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => setShowDropdown(true)}
                                >
                                    <CircleDashed size={20} color={colors.white} />
                                    <Text style={styles.setupBtnText}>Select a model to start</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Download Progress Overlay */}
                {isDownloading && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.progressOverlay, { backgroundColor: colors.card }]}>
                        <ActivityIndicator color={colors.primary} size="large" />
                        <Text style={[styles.progressText, { color: colors.text }]}>
                            Downloading Model... {Math.round(llm.downloadProgress * 100)}%
                        </Text>
                        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    { backgroundColor: colors.primary, width: `${llm.downloadProgress * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressSubtext, { color: colors.textSecondary }]}>
                            This may take a few minutes depending on your connection.
                        </Text>
                    </Animated.View>
                )}

                {/* LLM Status (Small) */}
                {activeModel && !isDownloading && (
                    <View style={styles.statusIndicator}>
                        {llm.isReady ? (
                            <View style={styles.statusRow}>
                                <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                                <Text style={[styles.statusText, { color: colors.textSecondary }]}>Model Ready</Text>
                            </View>
                        ) : llm.error ? (
                            <View style={styles.statusRow}>
                                <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                                <Text style={[styles.statusText, { color: colors.danger }]}>Error Loading Model</Text>
                                <TouchableOpacity onPress={() => llm.generate([])}>
                                    <RefreshCw size={14} color={colors.primary} style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.statusRow}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={[styles.statusText, { color: colors.textSecondary }]}>Initializing...</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                        placeholder="Ask TaskMate anything..."
                        placeholderTextColor={colors.textSecondary}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={1000}
                        editable={llm.isReady && !llm.isGenerating}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendBtn,
                            { backgroundColor: !input.trim() || !llm.isReady ? colors.border : colors.primary }
                        ]}
                        onPress={handleSend}
                        disabled={!input.trim() || !llm.isReady}
                    >
                        {llm.isGenerating ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Send size={20} color={colors.white} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

