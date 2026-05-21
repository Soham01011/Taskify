import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Network, BarChart2 } from 'lucide-react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/hooks/use-theme';
import { AppHeader } from '@/src/components/AppHeader';
import { useWorkflows } from '@/src/hooks/useWorkflows';
import { SPACING } from '@/src/constants/theme';
import { Workflow } from '@/src/api/workflows';
import { CreateWorkflowForm } from '@/src/components/Workflows/CreateWorkflowForm';
import { getStyles } from '@/assets/styles/mainscreen.styles';
import { localStyles } from '@/assets/styles/workflow.styles';

export default function WorkflowsScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const { workflows, isLoading, refreshing, handleRefresh } = useWorkflows();
    const [selectedTab, setSelectedTab] = useState('Active');
    const mainStyles = getStyles(colors);

    const STATUS_COLORS: Record<string, string> = {
        ACTIVE: colors.primary,
        COMPLETED: '#10B981',
        ARCHIVED: colors.textSecondary,
    };

    const [isCreating, setIsCreating] = useState(false);
    const TABS = ['Active', 'Due', 'Upcoming', 'Completed'];

    const renderHeader = () => (
        <View style={mainStyles.headerSection}>
            <View style={localStyles.subHeader}>
                <View style={localStyles.headerLeft}>
                    <Text style={mainStyles.greeting}>Active Workflows</Text>
                    <Text style={mainStyles.summary}>
                        Manage and monitor your automated DAG processes.
                    </Text>
                </View>
            </View>

            <View style={localStyles.tabsContainer}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            localStyles.tabButton,
                            selectedTab === tab && {
                                backgroundColor: colors.primary + '20',
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <Text
                            style={[
                                localStyles.tabText,
                                { color: selectedTab === tab ? colors.primary : colors.textSecondary },
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderWorkflowCard = ({ item }: { item: Workflow }) => (
        <TouchableOpacity
            style={[localStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/workflows/${item._id || (item as any).id}` as any)}
            activeOpacity={0.7}
        >
            <View style={localStyles.cardHeader}>
                <View>
                    <Text style={[localStyles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[localStyles.cardSubtitle, { color: colors.textSecondary }]}>
                        {item.description || 'No description'}
                    </Text>
                </View>
                <BarChart2 size={24} color={STATUS_COLORS[item.status] || colors.primary} />
            </View>

            <View style={localStyles.cardFooter}>
                <View style={localStyles.avatarsContainer}>
                    <View style={[localStyles.avatar, { backgroundColor: colors.border }]}>
                        <Text style={{ color: colors.text, fontSize: 10 }}>Me</Text>
                    </View>
                </View>

                <View style={localStyles.statusContainer}>
                    <View style={[localStyles.statusDot, { backgroundColor: STATUS_COLORS[item.status] || colors.primary }]} />
                    <Text style={[localStyles.statusText, { color: STATUS_COLORS[item.status] || colors.primary }]}>
                        {item.status === 'ACTIVE' ? 'Running' : item.status === 'COMPLETED' ? 'Completed' : 'Archived'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => (
        <TouchableOpacity style={[localStyles.templateCard, { borderColor: colors.border }]}>
            <Network size={24} color={colors.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={[localStyles.templateText, { color: colors.textSecondary }]}>View template library</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[localStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <AppHeader />

            <FlatList
                data={workflows}
                keyExtractor={(item) => item._id || (item as any).id}
                renderItem={renderWorkflowCard}
                contentContainerStyle={localStyles.listContent}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={localStyles.emptyContainer}>
                            <Text style={{ color: colors.textSecondary }}>No workflows found.</Text>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                    )
                }
            />

            {!isCreating ? (
                <Animated.View
                    entering={ZoomIn.duration(400).springify()}
                    exiting={ZoomOut.duration(300).springify()}
                    style={localStyles.fabContainer}
                >
                    <TouchableOpacity style={[localStyles.fab, { backgroundColor: colors.primary }]} onPress={() => setIsCreating(true)} activeOpacity={0.8}>
                        <Plus size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Animated.View
                    exiting={ZoomOut.duration(300).springify()}
                    style={[StyleSheet.absoluteFillObject, { justifyContent: 'flex-end', zIndex: 100 }]}
                    pointerEvents="box-none"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <CreateWorkflowForm
                            onSuccess={() => {
                                setIsCreating(false);
                                handleRefresh();
                            }}
                            onCancel={() => setIsCreating(false)}
                        />
                    </KeyboardAvoidingView>
                </Animated.View>
            )}

            {isCreating && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 98 }]}>
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


