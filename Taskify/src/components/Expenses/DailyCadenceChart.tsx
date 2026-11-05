import { styles } from '@/assets/styles/dailyCadenceChart.styles';
import { useAppTheme } from '@/hooks/use-theme';
import React from 'react';
import { Text, View } from 'react-native';
import { DailyCadencePoint } from '../../types/expense';
interface Props {
  cadence: DailyCadencePoint[];
  dailyAverage: number;
}

export const DailyCadenceChart: React.FC<Props> = ({ cadence, dailyAverage }) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Daily Outflow Cadence
        </Text>
        <Text style={[styles.averageLabel, { color: colors.textSecondary }]}>
          Avg: ₹{dailyAverage.toLocaleString('en-IN')} / day
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {cadence.map((item, idx) => {
          const isHighest = item.percentage >= 85;
          const isSecondary = item.percentage >= 60 && !isHighest;
          const barColor = isHighest
            ? colors.primary
            : isSecondary
              ? '#FF7A00'
              : isDark
                ? '#262A30'
                : '#E2E8F0';

          return (
            <View key={item.dayLabel || idx} style={styles.barColumn}>
              {/* Bar track and fill */}
              <View style={styles.track}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${item.percentage}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              {/* Day Label */}
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isHighest ? colors.primary : colors.textSecondary,
                    fontWeight: isHighest ? '700' : '500',
                  },
                ]}
              >
                {item.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

