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
  ChevronLeft,
  CreditCard,
  HelpCircle,
  Search,
  Tag,
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

      {/* Prominent Active Filter Banner with 1-tap "Back to All" */}
      {filterCategory !== 'all' && (
        <View
          style={[
            styles.activeFilterBanner,
            {
              backgroundColor: isDark ? '#261F18' : '#FFF7ED',
              borderColor: '#FF7A0040',
            },
          ]}
        >
          <View style={styles.activeFilterLeft}>
            <Tag size={15} color="#FF7A00" />
            <Text style={[styles.activeFilterTitle, { color: colors.text }]} numberOfLines={1}>
              Filtered by: <Text style={{ fontWeight: '700', color: '#FF7A00' }}>{filterCategory}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.clearFilterBtn, { backgroundColor: colors.primary }]}
            onPress={() => onFilterCategoryChange('all')}
            activeOpacity={0.8}
          >
            <ChevronLeft size={14} color="#FFFFFF" />
            <Text style={styles.clearFilterBtnText}>Back to All</Text>
          </TouchableOpacity>
        </View>
      )}

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
          placeholder="Search merchant, category, or UPI ID..."
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

        {/* Clear category chip if active */}
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
          {filterCategory !== 'all' && (
            <TouchableOpacity
              style={[styles.clearFilterEmptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => onFilterCategoryChange('all')}
            >
              <Text style={styles.clearFilterEmptyText}>Reset Filter to All</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.itemsList}>
          {transactions.map((tx) => {
            const isDebit = tx.type === 'debit';
            const catObj = categories.find(
              (c) => c.name.toLowerCase() === (tx.category || '').toLowerCase()
            );
            const catColor = catObj?.color || (tx.category === 'Uncategorized' ? '#FF7A00' : colors.primary);

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
                  {/* Category icon circle */}
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDebit ? catColor + '18' : '#2ECC7118' },
                    ]}
                  >
                    {isDebit ? (
                      <Tag size={15} color={catColor} />
                    ) : (
                      <ArrowDownLeft size={16} color="#2ECC71" />
                    )}
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

                    {/* Category tag pill & Account badge */}
                    <View style={styles.tagsRow}>
                      <View style={[styles.tagBadge, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}>
                        <View style={[styles.tagDot, { backgroundColor: catColor }]} />
                        <Text style={[styles.tagText, { color: colors.text }]} numberOfLines={1}>
                          {tx.category || 'Uncategorized'} › {tx.subCategory || 'General'}
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
  activeFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  activeFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  activeFilterTitle: {
    fontSize: 12,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  clearFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
  clearFilterEmptyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  clearFilterEmptyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
