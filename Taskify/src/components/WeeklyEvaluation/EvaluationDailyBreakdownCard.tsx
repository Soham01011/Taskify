import React from 'react';
import { Text, View } from 'react-native';
import { shortDay } from './evaluationUtils';

interface EvaluationDailyBreakdownCardProps {
    dailyBreakdown: Record<string, { due: number; completed: number }>;
    mostProductiveDay: string | null;
    colors: any;
    styles: any;
}

export const EvaluationDailyBreakdownCard: React.FC<EvaluationDailyBreakdownCardProps> = ({
    dailyBreakdown,
    mostProductiveDay,
    colors,
    styles,
}) => {
    const maxDayCompleted = Math.max(
        ...Object.values(dailyBreakdown).map((d) => d.completed),
        1
    );

    return (
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Breakdown</Text>
            <View style={styles.barsContainer}>
                {Object.entries(dailyBreakdown).map(([date, day]) => (
                    <View key={date} style={styles.dayCol}>
                        <Text style={[styles.dayCompletedLabel, { color: colors.primary }]}>
                            {day.completed > 0 ? day.completed : ''}
                        </Text>
                        <View style={[styles.dayBarTrack, { backgroundColor: colors.border }]}>
                            {day.due > 0 && (
                                <View
                                    style={[
                                        styles.dayBarFill,
                                        {
                                            height: `${Math.round((day.completed / maxDayCompleted) * 100)}%` as any,
                                            backgroundColor:
                                                mostProductiveDay === date
                                                    ? '#10B981'
                                                    : colors.primary,
                                        },
                                    ]}
                                />
                            )}
                        </View>
                        <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{shortDay(date)}</Text>
                        {mostProductiveDay === date && (
                            <Text style={[styles.starLabel, { color: '#10B981' }]}>★</Text>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};
