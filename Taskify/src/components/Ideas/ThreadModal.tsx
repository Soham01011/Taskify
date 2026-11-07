import { Idea } from '@/src/api/ideas';
import { Send, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface ThreadModalProps {
    idea: Idea;
    onClose: () => void;
    onAddThread: (content: string) => Promise<void>;
    onDeleteThread: (entryId: string) => Promise<void>;
    colors: any;
    styles: any;
    formatDate: (dateStr: string) => string;
}

export const ThreadModal: React.FC<ThreadModalProps> = ({
    idea,
    onClose,
    onAddThread,
    onDeleteThread,
    colors,
    styles,
    formatDate,
}) => {
    const [threadInput, setThreadInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!threadInput.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onAddThread(threadInput.trim());
            setThreadInput('');
            setIsSubmitting(false);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (_) {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={!!idea}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={{ flex: 1 }}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.threadModalOverlay}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={onClose}
                        activeOpacity={1}
                    />
                </Animated.View>

                <Animated.View
                    entering={SlideInDown.duration(350).springify()}
                    exiting={SlideOutDown.duration(300)}
                    style={styles.threadModal}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                    >
                        <View style={styles.threadModalHeader}>
                            <Text style={styles.threadModalTitle} numberOfLines={2}>
                                {idea.title}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={onClose}
                            >
                                <X size={18} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {idea.description ? (
                            <Text style={styles.ideaDescription}>{idea.description}</Text>
                        ) : null}

                        <FlatList
                            ref={flatListRef}
                            data={idea.thread ?? []}
                            keyExtractor={(e) => e._id}
                            style={{ marginTop: 12, flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            renderItem={({ item: entry }) => (
                                <View style={styles.threadEntry}>
                                    <Text style={styles.threadEntryContent}>{entry.content}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.threadEntryDate}>
                                            {formatDate(entry.created_at)}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => onDeleteThread(entry._id)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <X size={13} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={[styles.metaText, { textAlign: 'center', paddingVertical: 24 }]}>
                                    No notes yet. Add one below!
                                </Text>
                            }
                        />

                        <View style={styles.addThreadRow}>
                            <TextInput
                                style={styles.threadInput}
                                placeholder="Add a note or progress update…"
                                placeholderTextColor={colors.textSecondary}
                                value={threadInput}
                                onChangeText={setThreadInput}
                                multiline
                                onFocus={() => {
                                    setTimeout(() => {
                                        flatListRef.current?.scrollToEnd({ animated: true });
                                    }, 150);
                                }}
                            />
                            <TouchableOpacity
                                style={[styles.sendBtn, (!threadInput.trim() || isSubmitting) && { opacity: 0.5 }]}
                                onPress={handleSend}
                                disabled={!threadInput.trim() || isSubmitting}
                            >
                                {isSubmitting
                                    ? <ActivityIndicator size="small" color={colors.white} />
                                    : <Send size={16} color={colors.white} />
                                }
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal>
    );
};
