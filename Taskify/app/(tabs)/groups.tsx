import { BlurTargetView } from 'expo-blur';
import { BlurBackdrop } from '@/src/components/BlurBackdrop';
import { Plus } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getStyles } from '@/assets/styles/groupsscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { Group } from '@/src/api/groups';
import { AppHeader } from '@/src/components/AppHeader';
import { GenieAnimation } from '@/src/components/GenieAnimation';
import { CreateGroupForm } from '@/src/components/Groups/CreateGroupForm';
import { GroupCard } from '@/src/components/Groups/GroupCard';
import { useGroups } from '@/src/hooks/useGroups';

export default function GroupsScreen() {
    const { colors, isDark } = useAppTheme();
    const styles = getStyles(colors);

    const [modalVisible, setModalVisible] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const blurTargetRef = useRef<View | null>(null);

    const {
        groups,
        isLoading,
        refreshing,
        syncing,
        onRefresh,
        loadGroups
    } = useGroups();

    const openCreate = () => {
        setModalVisible(true);
        setIsCreating(true);
    };

    const closeCreate = () => {
        setIsCreating(false);
        // modalVisible stays true until onExited fires
    };

    const renderGroup = useCallback(({ item }: { item: Group }) => (
        <GroupCard group={item} />
    ), []);

    return (
        <SafeAreaView style={styles.container}>
            <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
                <AppHeader />

                <View style={styles.subHeader}>
                    <View>
                        <Text style={styles.title}>Groups</Text>
                        <Text style={styles.subtitle}>
                            {groups.length === 0
                                ? 'Collaborate with others'
                                : `${groups.length} group${groups.length !== 1 ? 's' : ''} joined`}
                        </Text>
                    </View>
                    {syncing && (
                        <View style={styles.syncBanner}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                </View>

                <FlatList
                    data={groups}
                    renderItem={renderGroup}
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
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {isLoading ? 'Fetching groups...' : 'You are not in any groups yet.'}
                            </Text>
                        </View>
                    }
                />

                {/* FAB */}
                {!modalVisible && (
                    <Animated.View
                        key="fab-container"
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

            {/* Create Group Modal */}
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
                            <CreateGroupForm
                                onSuccess={() => {
                                    closeCreate();
                                    loadGroups();
                                }}
                                onCancel={closeCreate}
                            />
                        </GenieAnimation>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}