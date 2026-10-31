import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { MultiMonthSummary } from '../../types/expense';

interface Props {
  summary: MultiMonthSummary;
}

export const MultiMonthTrends: React.FC<Props> = ({ summary }) => {
  const { colors, isDark } = useAppTheme();

  if (!summary.months || summary.months.length === 0) {
    return null;
  }

  const maxMonthSpend = Math.max(...summary.months.map((m) => m.totalOutflow), 1);

  return (
    <View style={styles.container}>
      {/* High-level KPI stat row */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Average Spend</Text>
          <Text style={[styles.kpiValue, { color: colors.text }]}>
            ₹{summary.averageMonthlySpend.toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>per active month</Text>
        </View>

        {summary.highestSpendMonth && (
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Peak Month</Text>
            <Text style={[styles.kpiValue, { color: colors.primary }]}>
              ₹{summary.highestSpendMonth.amount.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {summary.highestSpendMonth.monthLabel}
            </Text>
          </View>
        )}
      </View>

      {/* Month-by-Month Card Progression */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Month-by-Month Totals
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Outflow vs inflow comparison across statements
        </Text>

        <View style={styles.monthList}>
          {summary.months.map((m) => {
            const barWidth = Math.min(Math.max(Math.round((m.totalOutflow / maxMonthSpend) * 100), 8), 100);
            return (
              <View
                key={m.monthKey}
                style={[
                  styles.monthRow,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <View style={styles.monthHeaderRow}>
                  <View style={styles.monthNameBox}>
                    <Calendar size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.monthLabelText, { color: colors.text }]}>
                      {m.monthLabel}
                    </Text>
                  </View>
                  <Text style={[styles.monthOutflowText, { color: colors.text }]}>
                    ₹{m.totalOutflow.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Relative outflow bar */}
                <View style={[styles.barTrack, { backgroundColor: isDark ? '#262A30' : '#E2E8F0' }]}>
                  <View
                    style={[
                      styles.barProgress,
                      { width: `${barWidth}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>

                {/* Sub details: Inflow & Tx Count */}
                <View style={styles.monthFooterRow}>
                  <Text style={[styles.footerSubText, { color: colors.textSecondary }]}>
                    {m.txCount} transactions
                  </Text>
                  {m.totalInflow > 0 && (
                    <Text style={[styles.footerInflowText, { color: '#2ECC71' }]}>
                      +₹{m.totalInflow.toLocaleString('en-IN')} received
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category Trends Across Months */}
      {summary.categoryTrends.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Category Trends Over Time
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Shifts in major spending groups month-over-month
          </Text>

          <View style={styles.trendList}>
            {summary.categoryTrends.map((trend) => (
              <View
                key={trend.categoryName}
                style={[
                  styles.trendCard,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <View style={styles.trendTop}>
                  <View style={styles.trendLeft}>
                    <View style={[styles.colorDot, { backgroundColor: trend.color }]} />
                    <Text style={[styles.trendCatName, { color: colors.text }]}>
                      {trend.categoryName}
                    </Text>
                  </View>
                </View>

                <View style={styles.monthlyTrendRow}>
                  {trend.monthlyData.map((d) => (
                    <View key={d.monthKey} style={styles.trendMonthItem}>
                      <Text style={[styles.trendMonthLabel, { color: colors.textSecondary }]}>
                        {d.monthKey.slice(5)}/{d.monthKey.slice(2, 4)}
                      </Text>
                      <Text style={[styles.trendMonthAmount, { color: colors.text }]}>
                        ₹{d.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 3,
  },
  kpiSub: {
    fontSize: 10,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  monthList: {
    gap: 8,
  },
  monthRow: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  monthNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  monthOutflowText: {
    fontSize: 14,
    fontWeight: '800',
  },
  barTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    marginVertical: 4,
  },
  barProgress: {
    height: '100%',
    borderRadius: 999,
  },
  monthFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerSubText: {
    fontSize: 11,
  },
  footerInflowText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trendList: {
    gap: 8,
  },
  trendCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  trendTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendCatName: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthlyTrendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendMonthItem: {
    flexDirection: 'column',
  },
  trendMonthLabel: {
    fontSize: 10,
  },
  trendMonthAmount: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
});
