import { BlurBackdrop } from '@/src/components/BlurBackdrop';
import { BlurTargetView } from 'expo-blur';
import { Lightbulb, Plus } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getStyles } from '@/assets/styles/ideasscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { AppHeader } from '@/src/components/AppHeader';
import { CreateIdeaForm } from '@/src/components/CreateIdeaForm';
import { GenieAnimation } from '@/src/components/GenieAnimation';
import { IdeaCard } from '@/src/components/Ideas/IdeaCard';
import { ThreadModal } from '@/src/components/Ideas/ThreadModal';
import { useIdeas } from '@/src/hooks/useIdeas';
import { formatRelativeDate } from '@/src/utils/date';

const EmptyState = ({ colors, styles }: { colors: any; styles: any }) => (
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

    const blurTargetRef = useRef<View | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openCreate = () => {
        setModalVisible(true);
        setIsCreating(true);
    };

    const closeCreate = () => {
        setIsCreating(false);
        // modalVisible stays true until onExited fires
    };

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
            <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
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

                {/* FAB */}
                {!modalVisible && (
                    <Animated.View
                        key="ideas-fab"
                        entering={ZoomIn.duration(400).springify()}
                        exiting={ZoomOut.duration(300).springify()}
                        style={[styles.fab, { zIndex: 99 }]}
                    >
                        <TouchableOpacity
                            style={styles.fabTouch}
                            onPress={openCreate}
                            activeOpacity={0.6}
                        >
                            <Plus size={28} color={colors.white} />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </BlurTargetView>

            {/* Create Idea Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={closeCreate}
                statusBarTranslucent
            >
                <View style={{ flex: 1 }}>
                    {/* Blurred background */}
                    <BlurBackdrop
                        visible={isCreating}
                        target={blurTargetRef}
                        tint={isDark ? 'dark' : 'default'}
                        maxIntensity={50}
                        duration={250}
                    />

                    {/* Tap-to-close layer */}
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={closeCreate}
                        activeOpacity={1}
                    />

                    {/* Form */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                        pointerEvents="box-none"
                    >
                        <GenieAnimation
                            exiting={!isCreating}
                            onExited={() => setModalVisible(false)}
                        >
                            <CreateIdeaForm
                                onSuccess={closeCreate}
                                onCancel={closeCreate}
                            />
                        </GenieAnimation>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

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