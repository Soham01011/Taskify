import { Plus } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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

import { getStyles } from '@/assets/styles/groupsscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { Group } from '@/src/api/groups';
import { AppHeader } from '@/src/components/AppHeader';
import { CreateGroupForm } from '@/src/components/Groups/CreateGroupForm';
import { GroupCard } from '@/src/components/Groups/GroupCard';
import { useGroups } from '@/src/hooks/useGroups';

export default function GroupsScreen() {
    const { colors, isDark } = useAppTheme();
    const styles = getStyles(colors);
    const [isCreating, setIsCreating] = useState(false);

    const {
        groups,
        isLoading,
        refreshing,
        syncing,
        onRefresh,
        loadGroups
    } = useGroups();

    const renderGroup = useCallback(({ item }: { item: Group }) => (
        <GroupCard group={item} />
    ), []);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />

            <View style={styles.subHeader}>
                <View>
                    <Text style={styles.title}>Groups</Text>
                    <Text style={styles.subtitle}>
                        {groups.length === 0 ? 'Collaborate with others' : `${groups.length} group${groups.length !== 1 ? 's' : ''} joined`}
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

            {/* FAB to Modal Morph */}
            {!isCreating ? (
                <Animated.View
                    key="fab-container"
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
            ) : (
                <Animated.View
                    key="modal-container"
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
                        <CreateGroupForm
                            onSuccess={() => {
                                setIsCreating(false);
                                loadGroups();
                            }}
                            onCancel={() => setIsCreating(false)}
                        />
                    </KeyboardAvoidingView>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}
