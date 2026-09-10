import React from 'react';
import { Text, View } from 'react-native';
import { getRateColor } from './evaluationUtils';

interface EvaluationSubtasksCardProps {
    subtasks: {
        total: number;
        completed: number;
        completion_rate_percent: number;
    };
    colors: any;
    styles: any;
}

export const EvaluationSubtasksCard: React.FC<EvaluationSubtasksCardProps> = ({
    subtasks,
    colors,
    styles,
}) => {
    const rateColor = getRateColor(subtasks.completion_rate_percent, colors.primary);

    return (
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Subtasks</Text>
            <View style={styles.subtaskRow}>
                <Text style={[styles.subtaskStat, { color: colors.textSecondary }]}>
                    {subtasks.completed} / {subtasks.total} completed
                </Text>
                <Text style={[styles.subtaskPct, { color: rateColor }]}>
                    {subtasks.completion_rate_percent}%
                </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${subtasks.completion_rate_percent}%` as any,
                            backgroundColor: rateColor,
                        },
                    ]}
                />
            </View>
        </View>
    );
};
