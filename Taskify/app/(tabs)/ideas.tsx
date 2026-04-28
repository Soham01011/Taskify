import React, { useCallback } from 'react';
import {
    FlatList,
    View,
    Text,
    TouchableOpacity,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Lightbulb, Clock, Folder, Trash2 } from 'lucide-react-native';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';

import { AppHeader } from '@/src/components/AppHeader';
import { CreateIdeaForm } from '@/src/components/CreateIdeaForm';
import { IdeaCard } from '@/src/components/Ideas/IdeaCard';
import { ThreadModal } from '@/src/components/Ideas/ThreadModal';
import { useIdeas } from '@/src/hooks/useIdeas';
import { formatRelativeDate } from '@/src/utils/date';
import { getStyles } from '@/assets/styles/ideasscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { Idea } from '@/src/api/ideas';
import { SPACING } from '@/src/constants/theme';

const EmptyState = ({ colors, styles }: { colors: any, styles: any }) => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
            <Lightbulb size={32} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your idea board is empty</Text>
        <Text style={styles.emptyText}>
            Tap the + button to capture your next big idea — no deadlines, no pressure.
        </Text>
    </View>
);

export default function IdeasScreen() {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const {
        ideas,
        isLoading,
        isCreating,
        refreshing,
        syncing,
        selectedIdea,
        newIdeaIds,
        setIsCreating,
        setSelectedIdea,
        handleRefresh,
        handleDelete,
        handleAddThread,
        handleDeleteThread,
    } = useIdeas();

    const mainIdeas = ideas.filter(idea => idea.thread && idea.thread.length > 0);
    const quickCaptures = ideas.filter(idea => !idea.thread || idea.thread.length === 0);

    const renderQuickCapture = useCallback(({ item }: { item: Idea }) => (
        <TouchableOpacity
            style={styles.quickCaptureCard}
            onPress={() => setSelectedIdea(item)}
            activeOpacity={0.8}
        >
            <View style={styles.quickCaptureLeftBar} />
            <View style={styles.quickCaptureContent}>
                <Text style={styles.quickCaptureTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <View style={styles.quickCaptureMeta}>
                    <Clock size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.quickCaptureTime}>{formatRelativeDate(item.created_at)}</Text>
                    <Folder size={12} color={colors.textSecondary} style={{ marginLeft: 12, marginRight: 4 }} />
                    <Text style={styles.quickCaptureTime}>Idea Note</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ justifyContent: 'center', paddingRight: SPACING.md }}
            >
                <Trash2 size={16} color={colors.textSecondary} opacity={0.6} />
            </TouchableOpacity>
        </TouchableOpacity>
    ), [setSelectedIdea, colors, styles]);

    const renderHeader = () => (
        <View>
            {/* Header Content */}
            <View style={styles.subHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Ideas & Hobbies</Text>
                    <Text style={styles.subtitle}>
                        Capture sparks before they fade.
                    </Text>
                </View>
                {syncing && (
                    <View style={styles.syncBanner}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                )}
            </View>

            {/* Main Ideas Grid */}
            <View style={styles.gridContainer}>
                {mainIdeas.map((item, index) => (
                    <IdeaCard
                        key={item._id}
                        item={item}
                        isNew={newIdeaIds.has(item._id)}
                        onPress={setSelectedIdea}
                        onDelete={handleDelete}
                        colors={colors}
                        formatDate={formatRelativeDate}
                        index={index}
                    />
                ))}
            </View>

            {/* Quick Captures Header */}
            {quickCaptures.length > 0 && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Captures</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>View all</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />

            <FlatList
                data={quickCaptures}
                renderItem={renderQuickCapture}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={!isLoading && mainIdeas.length === 0 ? <EmptyState colors={colors} styles={styles} /> : null}
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
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
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
                <ThreadModal
                    idea={selectedIdea}
                    onClose={() => setSelectedIdea(null)}
                    onAddThread={handleAddThread}
                    onDeleteThread={handleDeleteThread}
                    colors={colors}
                    styles={styles}
                    formatDate={formatRelativeDate}
                />
            )}
        </SafeAreaView>
    );
}
