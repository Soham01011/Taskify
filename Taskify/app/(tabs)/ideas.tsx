import { Lightbulb, Plus } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInUp,
    FadeOut,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { getStyles } from '@/assets/styles/ideasscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { Idea } from '@/src/api/ideas';
import { AppHeader } from '@/src/components/AppHeader';
import { CreateIdeaForm } from '@/src/components/CreateIdeaForm';
import { IdeaCard } from '@/src/components/Ideas/IdeaCard';
import { ThreadModal } from '@/src/components/Ideas/ThreadModal';
import { SPACING } from '@/src/constants/theme';
import { useIdeas } from '@/src/hooks/useIdeas';
import { formatRelativeDate } from '@/src/utils/date';

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
    const { colors, isDark } = useAppTheme();
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

    const renderContent = () => (
        <View style={{ paddingBottom: 100 }}>
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

            {/* Ideas Grid */}
            {ideas.length > 0 ? (
                <View style={styles.gridContainer}>
                    {ideas.map((item, index) => (
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
            ) : (
                !isLoading && <EmptyState colors={colors} styles={styles} />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />

            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {renderContent()}
            </ScrollView>

            {/* Background Blur Overlay when creating */}
            {isCreating && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={[StyleSheet.absoluteFill, { zIndex: 98 }]}
                >
                    <BlurView
                        intensity={50}
                        tint={isDark ? 'dark' : 'default'}
                        experimentalBlurMethod="dimezisBlurView"
                        style={StyleSheet.absoluteFill}
                    >
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.25)',
                            }}
                            onPress={() => setIsCreating(false)}
                            activeOpacity={1}
                        />
                    </BlurView>
                </Animated.View>
            )}

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
                        onPress={() => setIsCreating(true)}
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
                    entering={FadeInUp.duration(300).springify()}
                    exiting={FadeOut.duration(200)}
                    style={[styles.compactModalContainer, { zIndex: 100 }]}
                    pointerEvents="box-none"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                        pointerEvents="box-none"
                    >
                        <CreateIdeaForm
                            onSuccess={() => setIsCreating(false)}
                            onCancel={() => setIsCreating(false)}
                        />
                    </KeyboardAvoidingView>
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
