import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AlertCircle,
    BarChart2,
    Calendar,
    RefreshCw,
} from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

import { useAppTheme } from '@/hooks/use-theme';
import { AppHeader } from '@/src/components/AppHeader';
import {
    taskApi,
    WeeklyEvaluationLockedResponse,
    WeeklyEvaluationResponse,
} from '@/src/api/tasks';
import { getWeeklyEvaluationStyles } from '@/assets/styles/weekly-evaluation.styles';
import {
    formatDate,
    EvaluationLockedCard,
    EvaluationCompletionCard,
    EvaluationSummaryTiles,
    EvaluationSubtasksCard,
    EvaluationDailyBreakdownCard,
    EvaluationInsightCard,
} from '@/src/components/WeeklyEvaluation';

export default function WeeklyEvaluationScreen() {
    const { colors } = useAppTheme();
    const styles = getWeeklyEvaluationStyles(colors);

    const [report, setReport] = useState<WeeklyEvaluationResponse | null>(null);
    const [locked, setLocked] = useState<WeeklyEvaluationLockedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvaluation = useCallback(async () => {
        try {
            setError(null);
            const response = await taskApi.getWeeklyEvaluation();
            setReport(response.data);
            setLocked(null);
        } catch (err: any) {
            if (err?.response?.status === 423) {
                setLocked(err.response.data as WeeklyEvaluationLockedResponse);
                setReport(null);
            } else {
                const msg =
                    err?.response?.data?.error ||
                    err?.message ||
                    'Something went wrong. Please try again.';
                setError(msg);
            }
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const load = async () => {
                setLoading(true);
                await fetchEvaluation();
                if (mounted) setLoading(false);
            };
            load();
            return () => {
                mounted = false;
            };
        }, [fetchEvaluation])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEvaluation();
        setRefreshing(false);
    };

    // ─── Loading State ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Fetching your weekly report…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ─── Error State ─────────────────────────────────────────────────────────
    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />
                <View style={styles.center}>
                    <AlertCircle size={48} color="#EF4444" />
                    <Text style={styles.errorTitle}>Oops!</Text>
                    <Text style={styles.errorMsg}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                        onPress={handleRefresh}
                    >
                        <RefreshCw size={16} color="#fff" />
                        <Text style={styles.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ─── Locked State (423) ──────────────────────────────────────────────────
    if (locked) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AppHeader />
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                >
                    <View style={styles.pageHeader}>
                        <BarChart2 size={28} color={colors.primary} />
                        <Text style={styles.pageTitle}>Weekly Evaluation</Text>
                        <Text style={styles.weekBadge}>{locked.week}</Text>
                    </View>

                    <EvaluationLockedCard locked={locked} colors={colors} styles={styles} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ─── Report State (200) ──────────────────────────────────────────────────
    if (!report) return null;

    const { summary, subtasks, daily_breakdown, insights, evaluation_window, week } = report;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AppHeader />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Header with week identifier */}
                <View style={styles.pageHeader}>
                    <BarChart2 size={28} color={colors.primary} />
                    <Text style={styles.pageTitle}>Weekly Evaluation</Text>
                    <Text style={styles.weekBadge}>{week}</Text>
                </View>

                {/* Evaluation Window */}
                <View style={[styles.windowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text style={[styles.windowText, { color: colors.textSecondary }]}>
                        {formatDate(evaluation_window.from)} — {formatDate(evaluation_window.to)}
                    </Text>
                </View>

                {/* Completion rate progress and status counts */}
                <EvaluationCompletionCard summary={summary} colors={colors} styles={styles} />

                {/* Task category counts */}
                <EvaluationSummaryTiles summary={summary} colors={colors} styles={styles} />

                {/* Subtask completion */}
                <EvaluationSubtasksCard subtasks={subtasks} colors={colors} styles={styles} />

                {/* Daily completion breakdown */}
                <EvaluationDailyBreakdownCard
                    dailyBreakdown={daily_breakdown}
                    mostProductiveDay={insights.most_productive_day}
                    colors={colors}
                    styles={styles}
                />

                {/* Most productive day insight */}
                <EvaluationInsightCard
                    mostProductiveDay={insights.most_productive_day}
                    mostProductiveDayCompletions={insights.most_productive_day_completions}
                    colors={colors}
                    styles={styles}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
