import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  averageLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 90,
    paddingTop: 10,
    gap: 6,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  track: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '75%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 6,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 6,
  },
});
