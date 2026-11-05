import { styles } from "@/assets/styles/banckAccountcards.styles";
import { useAppTheme } from '@/hooks/use-theme';
import { Building, CreditCard } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
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


