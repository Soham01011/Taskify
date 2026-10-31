import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  addTransaction,
  assignMerchantToGroup,
  clearAllTransactions,
  createCategoryGroup,
  deleteCategoryGroup,
  deleteTransaction,
  importTransactions,
  resetToDefaultSample,
  setFilterCategory,
  setFilterType,
  setSearchQuery,
  setSelectedMonth,
  updateCategoryGroup,
  updateTransactionCategory,
} from '../store/slices/expenseSlice';
import {
  BankAccountBreakdown,
  CategoryBreakdown,
  DailyCadencePoint,
  ExpenseTransaction,
  MonthSummary,
  MultiMonthSummary,
  SubCategoryBreakdown,
} from '../types/expense';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatMonthKey(monthKey: string): string {
  if (monthKey === 'all') return 'Multi-Month View';
  const parts = monthKey.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return monthKey;
}

export function useExpenses() {
  const dispatch = useDispatch<AppDispatch>();
  const expenseState = useSelector((state: RootState) => state.expense);

  const {
    transactions,
    categories,
    merchantRules,
    selectedMonth,
    searchQuery,
    filterType,
    filterCategory,
  } = expenseState;

  // 1. Available Months from Transactions
  const availableMonths = useMemo(() => {
    const monthCounts = new Map<string, number>();

    transactions.forEach((tx) => {
      const key = tx.date.substring(0, 7); // "YYYY-MM"
      monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    });

    const sortedKeys = Array.from(monthCounts.keys()).sort((a, b) => b.localeCompare(a));

    const list = sortedKeys.map((key) => ({
      key,
      label: formatMonthKey(key),
      count: monthCounts.get(key) || 0,
    }));

    if (sortedKeys.length > 1) {
      list.push({
        key: 'all',
        label: 'Multi-Month Trends',
        count: transactions.length,
      });
    }

    return list;
  }, [transactions]);

  // Determine current active month
  const activeMonthKey = useMemo(() => {
    if (selectedMonth && selectedMonth !== 'latest') {
      return selectedMonth;
    }
    if (availableMonths.length > 0 && availableMonths[0].key !== 'all') {
      return availableMonths[0].key;
    }
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${mm}`;
  }, [selectedMonth, availableMonths]);

  const isMultiMonthView = activeMonthKey === 'all';

  // Transactions belonging to the active month
  const monthTransactions = useMemo(() => {
    if (isMultiMonthView) {
      return transactions;
    }
    return transactions.filter((tx) => tx.date.startsWith(activeMonthKey));
  }, [transactions, activeMonthKey, isMultiMonthView]);

  // Discovered list of merchants that are currently uncategorized (for easy group creation suggestions)
  const uncategorizedMerchants = useMemo(() => {
    const counts = new Map<string, number>();
    transactions.forEach((tx) => {
      if (!tx.category || tx.category === 'Uncategorized') {
        const name = (tx.counterparty || '').trim();
        if (name) {
          counts.set(name, (counts.get(name) || 0) + 1);
        }
      }
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [transactions]);

  // 2. Month Summary Breakdown
  const monthSummary: MonthSummary = useMemo(() => {
    let totalSettledOutflow = 0;
    let totalInflow = 0;
    let categorizedTotal = 0;
    let uncategorizedTotal = 0;
    let uncategorizedCount = 0;

    const accountMap = new Map<string, { outflow: number; inflow: number; count: number }>();
    const categoryGroupMap = new Map<
      string,
      {
        total: number;
        subMap: Map<string, { amount: number; count: number; merchants: Set<string>; transactions: ExpenseTransaction[] }>;
      }
    >();
    const debitsList: ExpenseTransaction[] = [];

    // Day of week distribution map (Mon - Sun)
    const dayTotals: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };

    monthTransactions.forEach((tx) => {
      const acc = tx.account || 'Primary Account';
      const accData = accountMap.get(acc) || { outflow: 0, inflow: 0, count: 0 };
      accData.count++;

      if (tx.type === 'debit') {
        totalSettledOutflow += tx.amount;
        accData.outflow += tx.amount;
        debitsList.push(tx);

        // Day of week
        const d = new Date(tx.date);
        const dayOfWeek = d.getDay();
        dayTotals[dayOfWeek] = (dayTotals[dayOfWeek] || 0) + tx.amount;

        const catName = tx.category || 'Uncategorized';
        const subName = tx.subCategory || 'General';

        if (catName === 'Uncategorized') {
          uncategorizedTotal += tx.amount;
          uncategorizedCount++;
        } else {
          categorizedTotal += tx.amount;
        }

        if (!categoryGroupMap.has(catName)) {
          categoryGroupMap.set(catName, { total: 0, subMap: new Map() });
        }
        const grp = categoryGroupMap.get(catName)!;
        grp.total += tx.amount;

        if (!grp.subMap.has(subName)) {
          grp.subMap.set(subName, { amount: 0, count: 0, merchants: new Set(), transactions: [] });
        }
        const sub = grp.subMap.get(subName)!;
        sub.amount += tx.amount;
        sub.count++;
        sub.transactions.push(tx);
        if (tx.counterparty && sub.merchants.size < 4) {
          sub.merchants.add(tx.counterparty);
        }
      } else {
        totalInflow += tx.amount;
        accData.inflow += tx.amount;
      }

      accountMap.set(acc, accData);
    });

    // Bank Accounts breakdown
    const bankAccounts: BankAccountBreakdown[] = Array.from(accountMap.entries())
      .map(([account, data]) => ({
        account,
        totalOutflow: data.outflow,
        totalInflow: data.inflow,
        txCount: data.count,
        percentage: totalSettledOutflow > 0 ? Math.round((data.outflow / totalSettledOutflow) * 100) : 0,
      }))
      .sort((a, b) => b.totalOutflow - a.totalOutflow);

    // User Categories breakdown
    const categoryBreakdown: CategoryBreakdown[] = categories
      .map((cat) => {
        const grpData = categoryGroupMap.get(cat.name);
        const totalAmount = grpData ? grpData.total : 0;
        const subGroups: SubCategoryBreakdown[] = [];

        if (grpData) {
          grpData.subMap.forEach((subData, subName) => {
            subGroups.push({
              name: subName,
              amount: subData.amount,
              txCount: subData.count,
              percentageOfGroup: totalAmount > 0 ? Math.round((subData.amount / totalAmount) * 100) : 0,
              merchants: Array.from(subData.merchants),
              transactions: subData.transactions,
            });
          });
        }

        // Also ensure any declared sub-groups from the group config are present
        (cat.subCategories || []).forEach((subCatName) => {
          if (!subGroups.some((s) => s.name === subCatName)) {
            subGroups.push({
              name: subCatName,
              amount: 0,
              txCount: 0,
              percentageOfGroup: 0,
              merchants: [],
              transactions: [],
            });
          }
        });

        subGroups.sort((a, b) => b.amount - a.amount);

        return {
          category: cat,
          totalAmount,
          txCount: subGroups.reduce((acc, curr) => acc + curr.txCount, 0),
          percentageOfTotal: totalSettledOutflow > 0 ? Math.round((totalAmount / totalSettledOutflow) * 100) : 0,
          subGroups,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Top Settled Outflows
    const topSettledOutflows = [...debitsList]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    // Daily Cadence
    const dayLabels = [
      { day: 1, label: 'Mon' },
      { day: 2, label: 'Tue' },
      { day: 3, label: 'Wed' },
      { day: 4, label: 'Thu' },
      { day: 5, label: 'Fri' },
      { day: 6, label: 'Sat' },
      { day: 0, label: 'Sun' },
    ];
    const maxDayVal = Math.max(...Object.values(dayTotals), 1);
    const dailyCadence: DailyCadencePoint[] = dayLabels.map((item) => {
      const amt = dayTotals[item.day] || 0;
      return {
        dayLabel: item.label,
        amount: amt,
        percentage: Math.max(15, Math.round((amt / maxDayVal) * 100)),
      };
    });

    const debitCount = debitsList.length;
    const creditCount = monthTransactions.length - debitCount;
    const daysInMonth = 30;
    const dailyAverage = Math.round(totalSettledOutflow / Math.max(debitCount > 0 ? daysInMonth : 1, 1));

    return {
      monthKey: activeMonthKey,
      monthLabel: formatMonthKey(activeMonthKey),
      totalSettledOutflow,
      totalInflow,
      netSavings: totalInflow - totalSettledOutflow,
      txCount: monthTransactions.length,
      debitCount,
      creditCount,
      topSettledOutflows,
      bankAccounts,
      categoryBreakdown,
      dailyCadence,
      dailyAverage,
      uncategorizedCount,
      uncategorizedTotal,
      categorizedTotal,
      projection: {
        minOutflow: Math.round(totalSettledOutflow * 0.94),
        maxOutflow: Math.round(totalSettledOutflow * 1.06),
        confidence: 90,
        targetPerDay: Math.round(totalSettledOutflow / daysInMonth),
        forecastVariable: uncategorizedTotal,
        note: 'Median pacing window based on local on-device transactions.',
      },
    };
  }, [monthTransactions, activeMonthKey, categories]);

  // 3. Multi-Month Trends
  const multiMonthSummary: MultiMonthSummary = useMemo(() => {
    const monthMap = new Map<string, { outflow: number; inflow: number; count: number }>();
    const catTrendMap = new Map<string, Map<string, number>>();

    transactions.forEach((tx) => {
      const mKey = tx.date.substring(0, 7);
      const curr = monthMap.get(mKey) || { outflow: 0, inflow: 0, count: 0 };
      curr.count++;
      if (tx.type === 'debit') {
        curr.outflow += tx.amount;
        if (!catTrendMap.has(tx.category)) {
          catTrendMap.set(tx.category, new Map());
        }
        const mCatMap = catTrendMap.get(tx.category)!;
        mCatMap.set(mKey, (mCatMap.get(mKey) || 0) + tx.amount);
      } else {
        curr.inflow += tx.amount;
      }
      monthMap.set(mKey, curr);
    });

    const months = Array.from(monthMap.entries())
      .map(([monthKey, data]) => ({
        monthKey,
        monthLabel: formatMonthKey(monthKey),
        totalOutflow: data.outflow,
        totalInflow: data.inflow,
        txCount: data.count,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    const categoryTrends = categories
      .map((cat) => {
        const mCatMap = catTrendMap.get(cat.name);
        return {
          categoryName: cat.name,
          color: cat.color,
          monthlyData: months.map((m) => ({
            monthKey: m.monthKey,
            amount: mCatMap?.get(m.monthKey) || 0,
          })),
        };
      })
      .filter((ct) => ct.monthlyData.some((d) => d.amount > 0));

    const totalSpend = months.reduce((acc, m) => acc + m.totalOutflow, 0);
    const averageMonthlySpend = months.length > 0 ? Math.round(totalSpend / months.length) : 0;

    let highestSpendMonth: { monthLabel: string; amount: number } | null = null;
    let lowestSpendMonth: { monthLabel: string; amount: number } | null = null;

    if (months.length > 0) {
      const sortedBySpend = [...months].sort((a, b) => b.totalOutflow - a.totalOutflow);
      highestSpendMonth = {
        monthLabel: sortedBySpend[0].monthLabel,
        amount: sortedBySpend[0].totalOutflow,
      };
      lowestSpendMonth = {
        monthLabel: sortedBySpend[sortedBySpend.length - 1].monthLabel,
        amount: sortedBySpend[sortedBySpend.length - 1].totalOutflow,
      };
    }

    return {
      months,
      categoryTrends,
      averageMonthlySpend,
      highestSpendMonth,
      lowestSpendMonth,
    };
  }, [transactions, categories]);

  // 4. Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }
      if (filterCategory !== 'all') {
        const txCat = tx.category || 'Uncategorized';
        if (txCat.toLowerCase() !== filterCategory.toLowerCase()) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cp = (tx.counterparty || '').toLowerCase();
        const ref = (tx.refId || '').toLowerCase();
        const cat = (tx.category || '').toLowerCase();
        const sub = (tx.subCategory || '').toLowerCase();
        const acc = (tx.account || '').toLowerCase();
        if (!cp.includes(q) && !ref.includes(q) && !cat.includes(q) && !sub.includes(q) && !acc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [monthTransactions, filterType, filterCategory, searchQuery]);

  // Action Dispatchers
  const changeMonth = (mKey: string) => dispatch(setSelectedMonth(mKey));
  const changeSearchQuery = (q: string) => dispatch(setSearchQuery(q));
  const changeFilterType = (t: 'all' | 'debit' | 'credit') => dispatch(setFilterType(t));
  const changeFilterCategory = (c: string) => dispatch(setFilterCategory(c));
  const clearFilterCategory = () => dispatch(setFilterCategory('all'));

  const handleCreateGroup = (
    name: string,
    color: string,
    icon?: string,
    subCategories?: string[],
    merchants?: string[]
  ) => {
    dispatch(createCategoryGroup({ name, color, icon, subCategories, merchants }));
  };

  const handleUpdateGroup = (
    id: string,
    name: string,
    color: string,
    icon?: string,
    subCategories: string[] = [],
    merchants?: string[]
  ) => {
    dispatch(updateCategoryGroup({ id, name, color, icon, subCategories, merchants }));
  };

  const handleDeleteGroup = (id: string) => {
    dispatch(deleteCategoryGroup(id));
  };

  const handleAssignMerchant = (merchantKeyword: string, category: string, subCategory?: string) => {
    dispatch(assignMerchantToGroup({ merchantKeyword, category, subCategory }));
  };

  const handleUpdateTransactionCategory = (
    id: string,
    category: string,
    subCategory: string,
    applyToMerchant?: boolean,
    merchantName?: string
  ) => {
    dispatch(
      updateTransactionCategory({
        id,
        category,
        subCategory,
        applyToMerchant,
        merchantName,
      })
    );
  };

  const handleImportTransactions = (newTxs: ExpenseTransaction[]) => {
    dispatch(importTransactions({ transactions: newTxs }));
  };

  const handleAddTransaction = (tx: ExpenseTransaction) => {
    dispatch(addTransaction(tx));
  };

  const handleDeleteTransaction = (id: string) => {
    dispatch(deleteTransaction(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllTransactions());
  };

  const handleResetToDefaultSample = () => {
    dispatch(resetToDefaultSample());
  };

  return {
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
    // Actions
    changeMonth,
    changeSearchQuery,
    changeFilterType,
    changeFilterCategory,
    clearFilterCategory,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    assignMerchant: handleAssignMerchant,
    updateTransactionCategory: handleUpdateTransactionCategory,
    importTransactions: handleImportTransactions,
    addTransaction: handleAddTransaction,
    deleteTransaction: handleDeleteTransaction,
    clearAll: handleClearAll,
    resetToDefaultSample: handleResetToDefaultSample,
  };
}
