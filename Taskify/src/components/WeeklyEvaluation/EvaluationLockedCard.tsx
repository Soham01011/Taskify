import React from 'react';
import { Text, View } from 'react-native';
import { Clock, Lock } from 'lucide-react-native';
import { WeeklyEvaluationLockedResponse } from '@/src/api/tasks';
import { formatDate, getCountdown } from './evaluationUtils';

interface EvaluationLockedCardProps {
    locked: WeeklyEvaluationLockedResponse;
    colors: any;
    styles: any;
}

export const EvaluationLockedCard: React.FC<EvaluationLockedCardProps> = ({ locked, colors, styles }) => {
    return (
        <View style={[styles.lockedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Lock size={40} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.lockedTitle}>Already Viewed</Text>
            <Text style={styles.lockedMsg}>{locked.message}</Text>
            <View style={[styles.countdownBadge, { backgroundColor: colors.primary + '18' }]}>
                <Clock size={14} color={colors.primary} />
                <Text style={[styles.countdownText, { color: colors.primary }]}>
                    Next report: {getCountdown(locked.next_available_after)}
                </Text>
            </View>
            <Text style={[styles.nextDate, { color: colors.textSecondary }]}>
                Available after {formatDate(locked.next_available_after)}
            </Text>
        </View>
    );
};
