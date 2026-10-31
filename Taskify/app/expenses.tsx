import { useAppTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  FolderPlus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Upload
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BankAccountsCard } from '../src/components/Expenses/BankAccountsCard';
import { CategoryAccordion } from '../src/components/Expenses/CategoryAccordion';
import { CreateMenuSheet } from '../src/components/Expenses/CreateMenuSheet';
import { ExpenseSkeleton } from '../src/components/Expenses/ExpenseSkeleton';
import { GroupManagerModal } from '../src/components/Expenses/GroupManagerModal';
import { HeroSpendCard } from '../src/components/Expenses/HeroSpendCard';
import { MultiMonthTrends } from '../src/components/Expenses/MultiMonthTrends';
import { QuickAddModal } from '../src/components/Expenses/QuickAddModal';
import { RecategorizeModal } from '../src/components/Expenses/RecategorizeModal';
import { TransactionList } from '../src/components/Expenses/TransactionList';
import { UploadStatementModal } from '../src/components/Expenses/UploadStatementModal';
import { useExpenses } from '../src/hooks/useExpenses';
import { CategoryGroup, ExpenseTransaction } from '../src/types/expense';

export default function ExpensesScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Skeletal loading state for immediate visual feedback
  const [isLoading, setIsLoading] = useState(true);

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
    uncategorizedMerchants,
    searchQuery,
    filterType,
    filterCategory,
    changeMonth,
    changeSearchQuery,
    changeFilterType,
    changeFilterCategory,
    clearFilterCategory,
    createGroup,
    updateGroup,
    deleteGroup,
    assignMerchant,
    updateTransactionCategory,
    importTransactions,
    addTransaction,
    deleteTransaction,
    resetToDefaultSample,
  } = useExpenses();

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<CategoryGroup | null>(null);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<ExpenseTransaction | null>(null);

  // Smooth loading simulation on month change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [activeMonthKey]);

  // Distinct existing bank accounts for autocomplete
  const existingAccounts = Array.from(
    new Set(transactions.map((t) => t.account).filter(Boolean))
  );

  const handleReviewUncategorized = () => {
    changeFilterCategory('Uncategorized');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleOpenCreateGroup = () => {
    setGroupToEdit(null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: CategoryGroup) => {
    setGroupToEdit(group);
    setIsGroupModalOpen(true);
  };

  const handleBackPress = () => {
    if (filterCategory !== 'all') {
      clearFilterCategory();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
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
          {/* Quick Create Group Button in Header */}
          <TouchableOpacity
            style={[styles.headerActionPill, { backgroundColor: colors.primary + '18' }]}
            onPress={handleOpenCreateGroup}
            activeOpacity={0.7}
          >
            <FolderPlus size={14} color={colors.primary} />
            <Text style={[styles.headerActionPillText, { color: colors.primary }]}>Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}
            onPress={resetToDefaultSample}
            activeOpacity={0.7}
            accessibilityLabel="Reset transactions"
          >
            <RotateCcw size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Prominent Sticky Banner when Filtered by Uncategorized or Category */}
      {filterCategory !== 'all' && (
        <View style={[styles.globalFilterBanner, { backgroundColor: isDark ? '#261F18' : '#FFF7ED' }]}>
          <TouchableOpacity
            style={[styles.backToExpensesBtn, { backgroundColor: colors.primary }]}
            onPress={clearFilterCategory}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} color="#FFFFFF" />
            <Text style={styles.backToExpensesText}>Back to All Expenses</Text>
          </TouchableOpacity>
          <Text style={[styles.globalFilterLabel, { color: colors.text }]} numberOfLines={1}>
            Viewing: <Text style={{ fontWeight: '700', color: '#FF7A00' }}>{filterCategory}</Text>
          </Text>
        </View>
      )}

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
            onPress={handleOpenCreateGroup}
            activeOpacity={0.7}
          >
            <FolderPlus size={16} color={colors.primary} />
            <Text style={[styles.secondaryActionText, { color: colors.text }]}>New Group</Text>
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
        </View>

        {/* Skeletal Loading or Main Content */}
        {isLoading ? (
          <ExpenseSkeleton />
        ) : isMultiMonthView ? (
          <View style={{ gap: 14 }}>
            <MultiMonthTrends summary={multiMonthSummary} />
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
          </View>
        ) : (
          <View style={styles.monthSections}>
            {/* 1. Hero Spend Card */}
            <HeroSpendCard
              summary={monthSummary}
              onReviewUncategorized={handleReviewUncategorized}
            />

            {/* 2. Bank Accounts Used Box */}
            <BankAccountsCard
              bankAccounts={monthSummary.bankAccounts}
              totalSettledOutflow={monthSummary.totalSettledOutflow}
            />

            {/* 4. Two-Level User Category Accordion */}
            <CategoryAccordion
              categories={monthSummary.categoryBreakdown}
              uncategorizedCount={monthSummary.uncategorizedCount}
              uncategorizedTotal={monthSummary.uncategorizedTotal}
              onReviewUncategorized={handleReviewUncategorized}
              onCreateGroup={handleOpenCreateGroup}
              onEditGroup={handleOpenEditGroup}
              onSelectTransaction={(tx) => setSelectedTxForEdit(tx)}
            />

            {/* 5. Transactions List with Filters & 1-tap Back */}
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
          </View>
        )}

        {/* Bottom spacer for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) -> Opens Create Menu Sheet */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsCreateMenuOpen(true)}
        activeOpacity={0.85}
        accessibilityLabel="Create options"
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* FAB Create Menu Sheet */}
      <CreateMenuSheet
        visible={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
        onCreateGroup={handleOpenCreateGroup}
        onAddTransaction={() => setIsQuickAddModalOpen(true)}
        onUploadStatement={() => setIsUploadModalOpen(true)}
      />

      {/* Group Manager Modal (Create & Edit groups, sub-groups & merchants) */}
      <GroupManagerModal
        visible={isGroupModalOpen}
        groupToEdit={groupToEdit}
        uncategorizedMerchants={uncategorizedMerchants}
        onClose={() => {
          setIsGroupModalOpen(false);
          setGroupToEdit(null);
        }}
        onSave={(name, color, icon, subCats, mList) => {
          if (groupToEdit) {
            updateGroup(groupToEdit.id, name, color, icon, subCats || [], mList);
          } else {
            createGroup(name, color, icon, subCats, mList);
          }
        }}
        onDelete={(id) => deleteGroup(id)}
      />

      {/* Recategorize & Move Transaction Modal */}
      <RecategorizeModal
        visible={!!selectedTxForEdit}
        transaction={selectedTxForEdit}
        categories={categories}
        onClose={() => setSelectedTxForEdit(null)}
        onRequestCreateGroup={handleOpenCreateGroup}
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

      {/* Upload Statement Modal */}
      <UploadStatementModal
        visible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingTransactions={transactions}
        merchantRules={merchantRules}
        onConfirmImport={(newTxs) => importTransactions(newTxs)}
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
  headerActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  headerActionPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FF7A0040',
  },
  backToExpensesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 2,
  },
  backToExpensesText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  globalFilterLabel: {
    fontSize: 12,
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
