import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Car,
  CreditCard,
  HeartPulse,
  HelpCircle,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Utensils,
  Wallet,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { CategoryGroup, ExpenseTransaction } from '../../types/expense';

interface Props {
  transactions: ExpenseTransaction[];
  categories: CategoryGroup[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'all' | 'debit' | 'credit';
  onFilterTypeChange: (type: 'all' | 'debit' | 'credit') => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  onSelectTransaction: (tx: ExpenseTransaction) => void;
}

const getTxIcon = (category: string, type: 'debit' | 'credit', color: string) => {
  const cat = (category || '').toLowerCase();
  if (type === 'credit') return <ArrowDownLeft size={16} color="#2ECC71" />;
  if (cat.includes('food')) return <Utensils size={15} color={color} />;
  if (cat.includes('transport') || cat.includes('commute')) return <Car size={15} color={color} />;
  if (cat.includes('fixed') || cat.includes('bill') || cat.includes('subscription'))
    return <Calendar size={15} color={color} />;
  if (cat.includes('shopping') || cat.includes('lifestyle'))
    return <ShoppingBag size={15} color={color} />;
  if (cat.includes('health') || cat.includes('medical'))
    return <HeartPulse size={15} color={color} />;
  if (cat.includes('transfer') || cat.includes('personal'))
    return <Wallet size={15} color={color} />;
  return <HelpCircle size={15} color={color} />;
};

export const TransactionList: React.FC<Props> = ({
  transactions,
  categories,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  onSelectTransaction,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Header and Controls */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Transactions
        </Text>
        <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>
          {transactions.length} items
        </Text>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: isDark ? '#1B2026' : '#FFFFFF', borderColor: colors.border },
        ]}
      >
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by merchant, note, or UPI ID..."
          placeholderTextColor={colors.placeholder || colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Row */}
      <View style={styles.filterPillsRow}>
        {/* Type filters */}
        {(['all', 'debit', 'credit'] as const).map((t) => {
          const isActive = filterType === t;
          const label = t === 'all' ? 'All' : t === 'debit' ? 'Debits' : 'Credits';
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : isDark
                    ? '#1B2026'
                    : '#FFFFFF',
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onFilterTypeChange(t)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Category reset pill if category is active */}
        {filterCategory !== 'all' && (
          <TouchableOpacity
            style={[styles.activeCategoryPill, { backgroundColor: colors.primary + '20' }]}
            onPress={() => onFilterCategoryChange('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.activeCategoryText, { color: colors.primary }]}>
              {filterCategory} ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <HelpCircle size={28} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions found</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Try clearing filters or search keywords
          </Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {transactions.map((tx) => {
            const isDebit = tx.type === 'debit';
            const catObj = categories.find((c) => c.name.toLowerCase() === tx.category.toLowerCase());
            const catColor = catObj?.color || colors.primary;

            return (
              <TouchableOpacity
                key={tx.id}
                style={[
                  styles.txCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => onSelectTransaction(tx)}
                activeOpacity={0.7}
              >
                <View style={styles.cardLeft}>
                  {/* Category icon box */}
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDebit ? catColor + '18' : '#2ECC7118' },
                    ]}
                  >
                    {getTxIcon(tx.category, tx.type, catColor)}
                  </View>

                  {/* Merchant & details */}
                  <View style={styles.detailsCol}>
                    <Text style={[styles.merchantName, { color: colors.text }]} numberOfLines={1}>
                      {tx.counterparty || 'Unknown Counterparty'}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {tx.rawDate || tx.date} • {tx.time}
                      </Text>
                    </View>

                    {/* Category pill & Account badge */}
                    <View style={styles.tagsRow}>
                      <View style={[styles.tagBadge, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}>
                        <View style={[styles.tagDot, { backgroundColor: catColor }]} />
                        <Text style={[styles.tagText, { color: colors.text }]} numberOfLines={1}>
                          {tx.category} › {tx.subCategory}
                        </Text>
                      </View>
                      {tx.account && (
                        <View style={[styles.accountBadge, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}>
                          <CreditCard size={10} color={colors.textSecondary} style={{ marginRight: 3 }} />
                          <Text style={[styles.accountBadgeText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {tx.account}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Right Amount */}
                <View style={styles.cardRight}>
                  <Text
                    style={[
                      styles.amountText,
                      { color: isDebit ? colors.text : '#2ECC71' },
                    ]}
                  >
                    {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                  {tx.refId ? (
                    <Text style={[styles.refText, { color: colors.textSecondary }]}>
                      UPI: ...{tx.refId.slice(-6)}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activeCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 12,
  },
  itemsList: {
    gap: 8,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  merchantName: {
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '65%',
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountBadgeText: {
    fontSize: 10,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  refText: {
    fontSize: 10,
    marginTop: 2,
  },
});
