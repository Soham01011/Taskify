import React from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, Clock, TrendingUp, XCircle } from 'lucide-react-native';
import { getRateColor } from './evaluationUtils';

interface StatRowProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value, color }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        {icon}
        <Text style={{ flex: 1, color: '#9CA3AF', fontSize: 13 }}>{label}</Text>
        <Text style={{ color, fontWeight: '700', fontSize: 15 }}>{value}</Text>
    </View>
);

interface EvaluationCompletionCardProps {
    summary: {
        completed: number;
        incomplete: number;
        overdue: number;
        on_time: number;
        completion_rate_percent: number;
    };
    colors: any;
    styles: any;
}

export const EvaluationCompletionCard: React.FC<EvaluationCompletionCardProps> = ({
    summary,
    colors,
    styles,
}) => {
    const rateColor = getRateColor(summary.completion_rate_percent, colors.primary);

    return (
        <View style={[styles.rateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rateCircleWrap}>
                <View style={[styles.rateCircle, { borderColor: rateColor }]}>
                    <Text style={[styles.ratePercent, { color: rateColor }]}>
                        {summary.completion_rate_percent}%
                    </Text>
                    <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>done</Text>
                </View>
            </View>
            <View style={styles.rateStats}>
                <StatRow
                    icon={<CheckCircle2 size={16} color="#10B981" />}
                    label="Completed"
                    value={summary.completed}
                    color="#10B981"
                />
                <StatRow
                    icon={<XCircle size={16} color="#EF4444" />}
                    label="Incomplete"
                    value={summary.incomplete}
                    color="#EF4444"
                />
                <StatRow
                    icon={<Clock size={16} color="#F59E0B" />}
                    label="Overdue"
                    value={summary.overdue}
                    color="#F59E0B"
                />
                <StatRow
                    icon={<TrendingUp size={16} color={colors.primary} />}
                    label="On Time"
                    value={summary.on_time}
                    color={colors.primary}
                />
            </View>
        </View>
    );
};
