import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Building, CreditCard } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { BankAccountBreakdown } from '../../types/expense';

interface Props {
  bankAccounts: BankAccountBreakdown[];
  totalSettledOutflow: number;
}

export const BankAccountsCard: React.FC<Props> = ({ bankAccounts, totalSettledOutflow }) => {
  const { colors, isDark } = useAppTheme();

  if (!bankAccounts || bankAccounts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
            <Building size={16} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Bank Accounts Used
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: isDark ? '#262A30' : '#E2E8F0' }]}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {bankAccounts.length} {bankAccounts.length === 1 ? 'Account' : 'Accounts'}
          </Text>
        </View>
      </View>

      {/* Account Items List */}
      <View style={styles.list}>
        {bankAccounts.map((item, idx) => (
          <View
            key={item.account || idx}
            style={[
              styles.accountRow,
              { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
            ]}
          >
            <View style={styles.topInfo}>
              <View style={styles.accNameRow}>
                <CreditCard size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
                  {item.account}
                </Text>
              </View>
              <Text style={[styles.accountAmount, { color: colors.text }]}>
                ₹{item.totalOutflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Sub details: tx count and percentage bar */}
            <View style={styles.bottomInfo}>
              <Text style={[styles.txCount, { color: colors.textSecondary }]}>
                {item.txCount} payments made
              </Text>
              <Text style={[styles.percentageText, { color: colors.primary }]}>
                {item.percentage}% of month
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: isDark ? '#262A30' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.min(Math.max(item.percentage, 5), 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  accountRow: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  accountAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  txCount: {
    fontSize: 11,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
