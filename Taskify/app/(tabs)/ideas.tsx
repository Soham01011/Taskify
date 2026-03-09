import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
    FlatList,
    View,
    Text,
    TouchableOpacity,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    X,
    Lightbulb,
    MessageSquare,
    Trash2,
    Send,
} from 'lucide-react-native';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';

import { AppHeader } from '@/src/components/AppHeader';
import { CreateIdeaForm } from '@/src/components/CreateIdeaForm';
import { RootState, AppDispatch } from '@/src/store';
import { fetchIdeas, updateIdea, removeIdea } from '@/src/store/slices/ideaSlice';
import { ideaApi, Idea } from '@/src/api/ideas';
import { getStyles } from '@/assets/styles/ideasscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function IdeasScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useAppTheme();
    const styles = getStyles(colors);

    const { ideas, isLoading } = useSelector((state: RootState) => state.ideas);
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const [isCreating, setIsCreating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Thread modal state
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [threadInput, setThreadInput] = useState('');
    const [threadSubmitting, setThreadSubmitting] = useState(false);

    // Track which ideas are "new" (arrived from background sync)
    const [newIdeaIds, setNewIdeaIds] = useState<Set<string>>(new Set());

    const hasAttemptedInitialSync = useRef(false);

    const getLatestTimestamp = useCallback((): string | null => {
        if (ideas.length === 0) return null;
        return ideas.reduce((latest, idea) => {
            if (!idea.created_at) return latest;
            return new Date(idea.created_at).getTime() > new Date(latest).getTime()
                ? idea.created_at
                : latest;
        }, ideas[0].created_at);
    }, [ideas]);

    const loadIdeas = useCallback((params?: object) => {
        if (currentUserId) {
            dispatch(fetchIdeas(params as any));
        }
    }, [currentUserId, dispatch]);

    // Background sync: show local ideas first, then fetch new ones
    const backgroundSync = useCallback(async () => {
        if (!currentUserId) return;
        const latest = getLatestTimestamp();
        if (!latest) return;

        setSyncing(true);
        try {
            const result = await dispatch(
                fetchIdeas({ created_at: latest, pageNumber: 1, pageSize: 50 })
            ).unwrap();
            // Mark newly-arrived ideas
            const data = result.data;
            const incoming: Idea[] = Array.isArray(data) ? data : data.ideas;
            if (incoming.length > 0) {
                const existingIds = new Set(ideas.map(i => i._id));
                const freshIds = incoming.filter(i => !existingIds.has(i._id)).map(i => i._id);
                if (freshIds.length > 0) {
                    setNewIdeaIds(new Set(freshIds));
                    // Clear the "new" highlight after 3 seconds
                    setTimeout(() => setNewIdeaIds(new Set()), 3000);
                }
            }
        } catch (_) {
            // Fail silently — local data is already shown
        } finally {
            setSyncing(false);
        }
    }, [currentUserId, dispatch, getLatestTimestamp, ideas]);

    useEffect(() => {
        if (currentUserId && !hasAttemptedInitialSync.current) {
            hasAttemptedInitialSync.current = true;
            const latest = getLatestTimestamp();
            if (latest) {
                // Show local first, then background sync
                backgroundSync();
            } else {
                loadIdeas({ pageNumber: 1, pageSize: 20 });
            }
        }
    }, [currentUserId, loadIdeas, getLatestTimestamp, backgroundSync]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(fetchIdeas({ pageNumber: 1, pageSize: 20 })).unwrap();
        } catch (_) { }
        setRefreshing(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await ideaApi.delete(id);
            dispatch(removeIdea(id));
            if (selectedIdea?._id === id) setSelectedIdea(null);
        } catch (_) { }
    };

    const handleAddThread = async () => {
        if (!selectedIdea || !threadInput.trim()) return;
        setThreadSubmitting(true);
        try {
            const response = await ideaApi.addThreadEntry(selectedIdea._id, threadInput.trim());
            dispatch(updateIdea(response.data));
            setSelectedIdea(response.data); // Refresh panel with latest thread
            setThreadInput('');
        } catch (_) { }
        setThreadSubmitting(false);
    };

    const handleDeleteThread = async (entryId: string) => {
        if (!selectedIdea) return;
        try {
            const response = await ideaApi.deleteThreadEntry(selectedIdea._id, entryId);
            dispatch(updateIdea(response.data));
            setSelectedIdea(response.data);
        } catch (_) { }
    };

    const renderIdeaCard = ({ item }: { item: Idea }) => {
        const isNew = newIdeaIds.has(item._id);
        return (
            <Animated.View
                entering={FadeIn.duration(300)}
                layout={undefined}
            >
                <TouchableOpacity
                    style={[styles.ideaCard, isNew && styles.ideaCardNew]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedIdea(item)}
                >
                    <View style={styles.ideaHeader}>
                        <View style={styles.ideaTitleContainer}>
                            <Text style={styles.ideaTitle}>{item.title}</Text>
                            {item.description ? (
                                <Text style={styles.ideaDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            ) : null}
                        </View>
                        <View style={styles.ideaActions}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => handleDelete(item._id)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Trash2 size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.ideaMeta}>
                        <Text style={styles.metaText}>{formatRelativeDate(item.created_at)}</Text>
                        {item.thread && item.thread.length > 0 && (
                            <View style={styles.threadBadge}>
                                <MessageSquare size={10} color={colors.primary} />
                                <Text style={styles.threadBadgeText}>
                                    {item.thread.length} note{item.thread.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />

            <View style={styles.subHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Ideas</Text>
                    <Text style={styles.subtitle}>
                        {ideas.length === 0 ? 'Capture your spark' : `${ideas.length} idea${ideas.length !== 1 ? 's' : ''} captured`}
                    </Text>
                </View>
                {syncing && (
                    <View style={styles.syncBanner}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.syncText}>Syncing…</Text>
                    </View>
                )}
            </View>

            <FlatList
                data={ideas}
                renderItem={renderIdeaCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Lightbulb size={32} color={colors.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Your idea board is empty</Text>
                            <Text style={styles.emptyText}>
                                Tap the + button to capture your next big idea — no deadlines, no pressure.
                            </Text>
                        </View>
                    ) : null
                }
            />

            {/* FAB */}
            {!isCreating && (
                <Animated.View
                    key="ideas-fab"
                    entering={ZoomIn.duration(400).springify()}
                    exiting={ZoomOut.duration(300).springify()}
                    style={[styles.fab, { zIndex: 99 }]}
                >
                    <TouchableOpacity
                        style={styles.fabTouch}
                        onPress={() => setTimeout(() => setIsCreating(true), 100)}
                        activeOpacity={0.6}
                    >
                        <Plus size={28} color={colors.white} />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Create Idea Modal (Genie) */}
            {isCreating && (
                <Animated.View
                    key="ideas-modal"
                    exiting={FadeOut.duration(400)}
                    style={[styles.compactModalContainer, { zIndex: 100 }]}
                    pointerEvents="box-none"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 40}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <CreateIdeaForm
                            onSuccess={() => setIsCreating(false)}
                            onCancel={() => setIsCreating(false)}
                        />
                    </KeyboardAvoidingView>
                </Animated.View>
            )}

            {/* Overlay behind create modal */}
            {isCreating && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.overlay}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setIsCreating(false)}
                        activeOpacity={1}
                    />
                </Animated.View>
            )}

            {/* Thread Detail Modal */}
            {selectedIdea && (
                <>
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={styles.threadModalOverlay}
                    >
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() => setSelectedIdea(null)}
                            activeOpacity={1}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={SlideInDown.duration(350).springify()}
                        exiting={SlideOutDown.duration(300)}
                        style={styles.threadModal}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                        >
                            <View style={styles.threadModalHeader}>
                                <Text style={styles.threadModalTitle} numberOfLines={2}>
                                    {selectedIdea.title}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={() => setSelectedIdea(null)}
                                >
                                    <X size={18} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {selectedIdea.description ? (
                                <Text style={styles.ideaDescription}>{selectedIdea.description}</Text>
                            ) : null}

                            <FlatList
                                data={selectedIdea.thread ?? []}
                                keyExtractor={(e) => e._id}
                                style={{ marginTop: 12, flex: 1 }}
                                renderItem={({ item: entry }) => (
                                    <View style={styles.threadEntry}>
                                        <Text style={styles.threadEntryContent}>{entry.content}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.threadEntryDate}>
                                                {formatRelativeDate(entry.created_at)}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteThread(entry._id)}
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

                            {/* Add thread entry */}
                            <View style={styles.addThreadRow}>
                                <TextInput
                                    style={styles.threadInput}
                                    placeholder="Add a note or progress update…"
                                    placeholderTextColor={colors.textSecondary}
                                    value={threadInput}
                                    onChangeText={setThreadInput}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, (!threadInput.trim() || threadSubmitting) && { opacity: 0.5 }]}
                                    onPress={handleAddThread}
                                    disabled={!threadInput.trim() || threadSubmitting}
                                >
                                    {threadSubmitting
                                        ? <ActivityIndicator size="small" color={colors.white} />
                                        : <Send size={16} color={colors.white} />
                                    }
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </>
            )}
        </SafeAreaView>
    );
}
