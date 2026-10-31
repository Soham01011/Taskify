import React, { useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  Filter,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { useExpenses } from '../src/hooks/useExpenses';
import { HeroSpendCard } from '../src/components/Expenses/HeroSpendCard';
import { BankAccountsCard } from '../src/components/Expenses/BankAccountsCard';
import { CategoryAccordion } from '../src/components/Expenses/CategoryAccordion';
import { DailyCadenceChart } from '../src/components/Expenses/DailyCadenceChart';
import { MultiMonthTrends } from '../src/components/Expenses/MultiMonthTrends';
import { TransactionList } from '../src/components/Expenses/TransactionList';
import { UploadStatementModal } from '../src/components/Expenses/UploadStatementModal';
import { RecategorizeModal } from '../src/components/Expenses/RecategorizeModal';
import { QuickAddModal } from '../src/components/Expenses/QuickAddModal';
import { ExpenseTransaction } from '../src/types/expense';

export default function ExpensesScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    transactions,
    categories,
    merchantRules,
    availableMonths,
    activeMonthKey,
    isMultiMonthView,
    monthSummary,
    multiMonthSummary,
    filteredTransactions,
    searchQuery,
    filterType,
    filterCategory,
    changeMonth,
    changeSearchQuery,
    changeFilterType,
    changeFilterCategory,
    importTransactions,
    updateTransactionCategory,
    addTransaction,
    deleteTransaction,
    resetToDefaultSample,
  } = useExpenses();

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<ExpenseTransaction | null>(null);

  // Distinct existing bank accounts for autocomplete
  const existingAccounts = Array.from(
    new Set(transactions.map((t) => t.account).filter(Boolean))
  );

  const handleReviewUncategorized = () => {
    changeFilterCategory('Uncategorized');
    // Scroll down to transaction list
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={26} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>TaskMate</Text>
            <Text style={[styles.appSub, { color: colors.textSecondary }]}>Spend Intelligence</Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}
            onPress={resetToDefaultSample}
            activeOpacity={0.7}
            accessibilityLabel="Reset to GPay Sample"
          >
            <RotateCcw size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header & Local Privacy Badge */}
        <View style={styles.heroHeaderBlock}>
          <Text style={[styles.mainHeading, { color: colors.text }]}>
            Expense & Spend Intelligence
          </Text>
          <View style={styles.privacyRow}>
            <ShieldCheck size={14} color="#2ECC71" style={{ marginTop: 1 }} />
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              Zero-knowledge tracking. Your financial transactions never leave this phone.
            </Text>
          </View>
        </View>

        {/* Month Selector Horizontal Strip */}
        <View style={styles.monthSelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthChipsRow}
          >
            {availableMonths.map((m) => {
              const isActive = activeMonthKey === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.monthChip,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : isDark
                        ? '#1B2026'
                        : '#FFFFFF',
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => changeMonth(m.key)}
                  activeOpacity={0.7}
                >
                  <Calendar
                    size={13}
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.monthChipText,
                      { color: isActive ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {m.label}
                  </Text>
                  <View
                    style={[
                      styles.monthCountBadge,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255,255,255,0.25)'
                          : isDark
                          ? '#262A30'
                          : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthCountText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {m.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Action Strip */}
        <View style={styles.actionStrip}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsUploadModalOpen(true)}
            activeOpacity={0.8}
          >
            <Upload size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Upload Statement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryActionBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setIsQuickAddModalOpen(true)}
            activeOpacity={0.7}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={[styles.secondaryActionText, { color: colors.text }]}>Quick Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryActionBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              changeFilterCategory(filterCategory === 'all' ? 'Food & Dining' : 'all');
            }}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={15} color={colors.textSecondary} />
            <Text style={[styles.secondaryActionText, { color: colors.text }]}>
              {filterCategory === 'all' ? 'Filter' : filterCategory}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Views: Multi-Month View vs Month View */}
        {isMultiMonthView ? (
          <MultiMonthTrends summary={multiMonthSummary} />
        ) : (
          <View style={styles.monthSections}>
            {/* 1. Hero 3D Flip Card */}
            <HeroSpendCard summary={monthSummary} />

            {/* 2. Bank Accounts Used Box */}
            <BankAccountsCard
              bankAccounts={monthSummary.bankAccounts}
              totalSettledOutflow={monthSummary.totalSettledOutflow}
            />

            {/* 3. Daily Outflow Cadence Sparkline */}
            <DailyCadenceChart
              cadence={monthSummary.dailyCadence}
              dailyAverage={monthSummary.dailyAverage}
            />

            {/* 4. Two-Level Category Breakdown */}
            <CategoryAccordion
              categories={monthSummary.categoryBreakdown}
              uncategorizedCount={monthSummary.uncategorizedCount}
              uncategorizedTotal={monthSummary.uncategorizedTotal}
              onReviewUncategorized={handleReviewUncategorized}
              onSelectCategoryFilter={changeFilterCategory}
            />
          </View>
        )}

        {/* 5. Transactions List */}
        <TransactionList
          transactions={filteredTransactions}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={changeSearchQuery}
          filterType={filterType}
          onFilterTypeChange={changeFilterType}
          filterCategory={filterCategory}
          onFilterCategoryChange={changeFilterCategory}
          onSelectTransaction={(tx) => setSelectedTxForEdit(tx)}
        />

        {/* Bottom padding for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) for Quick Add */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsQuickAddModalOpen(true)}
        activeOpacity={0.85}
        accessibilityLabel="Add Transaction"
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Upload Statement Modal */}
      <UploadStatementModal
        visible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingTransactions={transactions}
        merchantRules={merchantRules}
        onConfirmImport={(newTxs) => importTransactions(newTxs)}
      />

      {/* Recategorize Modal */}
      <RecategorizeModal
        visible={!!selectedTxForEdit}
        transaction={selectedTxForEdit}
        categories={categories}
        onClose={() => setSelectedTxForEdit(null)}
        onSave={(id, category, subCategory, applyToMerchant, merchantName) =>
          updateTransactionCategory(id, category, subCategory, applyToMerchant, merchantName)
        }
        onDelete={(id) => deleteTransaction(id)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        visible={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        categories={categories}
        existingAccounts={existingAccounts}
        onAddTransaction={(tx) => addTransaction(tx)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    padding: 2,
    marginLeft: -4,
  },
  appName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  appSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  heroHeaderBlock: {
    gap: 4,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  privacyText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  monthSelectorWrapper: {
    marginHorizontal: -16,
  },
  monthChipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  monthCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthSections: {
    gap: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
});
