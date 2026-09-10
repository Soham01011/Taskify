import React from 'react';
import { Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

interface EvaluationInsightCardProps {
    mostProductiveDay: string | null;
    mostProductiveDayCompletions: number;
    colors: any;
    styles: any;
}

export const EvaluationInsightCard: React.FC<EvaluationInsightCardProps> = ({
    mostProductiveDay,
    mostProductiveDayCompletions,
    colors,
    styles,
}) => {
    if (!mostProductiveDay) return null;

    const formattedDay = new Date(mostProductiveDay).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    return (
        <View
            style={[
                styles.insightCard,
                { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' },
            ]}
        >
            <TrendingUp size={18} color={colors.primary} />
            <Text style={[styles.insightText, { color: colors.text }]}>
                Most productive day:{' '}
                <Text style={{ fontWeight: '700', color: colors.primary }}>
                    {formattedDay}
                </Text>{' '}
                with {mostProductiveDayCompletions} completion
                {mostProductiveDayCompletions !== 1 ? 's' : ''}.
            </Text>
        </View>
    );
};
