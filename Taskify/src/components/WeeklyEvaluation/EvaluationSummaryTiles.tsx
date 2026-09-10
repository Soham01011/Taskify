import React from 'react';
import { Text, View } from 'react-native';
import { tileStyles } from '@/assets/styles/weekly-evaluation.styles';

interface TileProps {
    label: string;
    value: number;
    colors: any;
}

const Tile: React.FC<TileProps> = ({ label, value, colors }) => (
    <View
        style={[
            tileStyles.tile,
            { backgroundColor: colors.card, borderColor: colors.border },
        ]}
    >
        <Text style={[tileStyles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[tileStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
);

interface EvaluationSummaryTilesProps {
    summary: {
        total_tasks: number;
        recurring_tasks: number;
        one_off_tasks: number;
    };
    colors: any;
    styles: any;
}

export const EvaluationSummaryTiles: React.FC<EvaluationSummaryTilesProps> = ({
    summary,
    colors,
    styles,
}) => {
    return (
        <View style={styles.tilesRow}>
            <Tile label="Total Tasks" value={summary.total_tasks} colors={colors} />
            <Tile label="Recurring" value={summary.recurring_tasks} colors={colors} />
            <Tile label="One-off" value={summary.one_off_tasks} colors={colors} />
        </View>
    );
};
