import React, { useState, useCallback } from 'react';
import {
    FlatList,
    View,
    Text,
    TouchableOpacity,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import Animated, {
    FadeOut,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';

import { useGroups } from '@/src/hooks/useGroups';
import { GroupCard } from '@/src/components/Groups/GroupCard';
import { CreateGroupForm } from '@/src/components/Groups/CreateGroupForm';
import { AppHeader } from '@/src/components/AppHeader';
import { useAppTheme } from '@/hooks/use-theme';
import { getStyles } from '@/assets/styles/groupsscreen.styles';
import { Group } from '@/src/api/groups';

export default function GroupsScreen() {
    const { colors } = useAppTheme();
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
                        onPress={() => setTimeout(() => setIsCreating(true), 100)}
                        activeOpacity={0.6}
                    >
                        <Plus size={28} color={colors.white} />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Animated.View
                    key="modal-container"
                    exiting={FadeOut.duration(400)}
                    style={[styles.compactModalContainer, { zIndex: 100 }]}
                    pointerEvents="box-none"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
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

            {/* Background Overlay when creating */}
            {isCreating && (
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setIsCreating(false)}
                        activeOpacity={1}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
