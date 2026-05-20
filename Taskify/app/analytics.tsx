// Analytics Screen
import { useAppTheme } from '@/hooks/use-theme';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, Flame, Clock } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const analytics = useAnalytics();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Top Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.iconBox, { backgroundColor: '#FF950020' }]}>
                            <Flame size={24} color="#FF9500" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{analytics.stats.currentStreak}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                            <CheckCircle2 size={24} color={colors.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{analytics.stats.totalCompleted}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.iconBox, { backgroundColor: '#FF3B3020' }]}>
                            <Clock size={24} color="#FF3B30" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{analytics.stats.lateCompleted}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Late</Text>
                    </View>
                </View>

                {/* 1. Hero: Weekly Productivity (Bar Chart) */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Productivity</Text>
                    <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Tasks completed over the last 7 days</Text>

                    <View style={styles.chartWrapper}>
                        <BarChart
                            stackData={analytics.weeklyProductivity}
                            barWidth={24}
                            spacing={(width - 80 - (24 * 7)) / 6} // Distribute evenly
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}
                            noOfSections={4}
                            maxValue={Math.max(...analytics.weeklyProductivity.map(d => d.value), 5)}
                            isAnimated
                            animationDuration={1000}
                        />
                    </View>

                    {/* Legend for Stacked Bar Chart */}
                    <View style={[styles.legendRow, { marginTop: 15 }]}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>On Time</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Late ({'>'}30m)</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Balance: Weekly Score (Donut Chart) */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Score</Text>
                    <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Completion rate for the last 7 days</Text>

                    <View style={[styles.chartWrapper, { alignItems: 'center', marginTop: 20 }]}>
                        <PieChart
                            donut
                            innerRadius={70}
                            radius={100}
                            data={
                                analytics.completionRate.total === 0
                                    ? [{ value: 1, color: colors.border }]
                                    : [
                                        { value: analytics.completionRate.completed, color: colors.primary },
                                        { value: Math.max(0, analytics.completionRate.total - analytics.completionRate.completed), color: colors.border }
                                    ]
                            }
                            centerLabelComponent={() => {
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 36, color: colors.secondary, fontWeight: 'bold' }}>
                                            {analytics.completionRate.percentage}%
                                        </Text>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Done</Text>
                                    </View>
                                );
                            }}
                            isAnimated
                        />
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Completed ({analytics.completionRate.completed})</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: colors.border }]} />
                                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Pending ({analytics.completionRate.total - analytics.completionRate.completed})</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 3. Forecast: Upcoming Workload (Line/Area Chart) */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.chartTitle, { color: colors.text }]}>Upcoming Workload</Text>
                    <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Pending tasks for the next 7 days</Text>

                    <View style={[styles.chartWrapper, { marginLeft: -10 }]}>
                        <LineChart
                            data={analytics.upcomingWorkload}
                            curved
                            areaChart
                            color={colors.primary}
                            startFillColor={colors.primary}
                            endFillColor={colors.background}
                            startOpacity={0.6}
                            endOpacity={0.1}
                            hideDataPoints
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}
                            noOfSections={3}
                            maxValue={Math.max(...analytics.upcomingWorkload.map(d => d.value), 5)}
                            isAnimated
                            animationDuration={1200}
                            width={width - 80}
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chartCard: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 13,
        marginBottom: 20,
    },
    chartWrapper: {
        marginTop: 10,
    },
    legendRow: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 13,
        fontWeight: '500',
    }
});
