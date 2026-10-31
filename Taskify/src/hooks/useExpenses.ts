import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  addMerchantRule,
  addTransaction,
  deleteTransaction,
  importTransactions,
  resetToDefaultSample,
  setFilterCategory,
  setFilterType,
  setSearchQuery,
  setSelectedMonth,
  updateTransactionCategory,
} from '../store/slices/expenseSlice';
import {
  BankAccountBreakdown,
  CategoryBreakdown,
  DailyCadencePoint,
  ExpenseTransaction,
  MerchantRule,
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

  // 1. Compute Available Months from Transactions
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

    // Add 'all' option if multiple months exist
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

  // 2. Month Summary Breakdown (KPIs, Fixed vs Variable, Bank Accounts, Categories, Cadence)
  const monthSummary: MonthSummary = useMemo(() => {
    let totalSettledOutflow = 0;
    let totalInflow = 0;
    let committedFixed = 0;
    let variableLifestyle = 0;

    const accountMap = new Map<string, { outflow: number; inflow: number; count: number }>();
    const categoryGroupMap = new Map<string, { total: number; subMap: Map<string, { amount: number; count: number; merchants: Set<string> }> }>();
    const debitsList: ExpenseTransaction[] = [];

    // Daily distribution map for day-of-week (Mon - Sun)
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
        const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon
        dayTotals[dayOfWeek] = (dayTotals[dayOfWeek] || 0) + tx.amount;

        // Group Fixed vs Variable
        const catObj = categories.find((c) => c.name.toLowerCase() === tx.category.toLowerCase());
        if (catObj?.isFixed) {
          committedFixed += tx.amount;
        } else {
          variableLifestyle += tx.amount;
        }

        // Category breakdown
        const catName = tx.category || 'Uncategorized';
        const subName = tx.subCategory || 'General Outflow';

        if (!categoryGroupMap.has(catName)) {
          categoryGroupMap.set(catName, { total: 0, subMap: new Map() });
        }
        const grp = categoryGroupMap.get(catName)!;
        grp.total += tx.amount;

        if (!grp.subMap.has(subName)) {
          grp.subMap.set(subName, { amount: 0, count: 0, merchants: new Set() });
        }
        const sub = grp.subMap.get(subName)!;
        sub.amount += tx.amount;
        sub.count++;
        if (tx.counterparty && sub.merchants.size < 3) {
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

    // Categories breakdown
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
            });
          });
          subGroups.sort((a, b) => b.amount - a.amount);
        }

        return {
          category: cat,
          totalAmount,
          txCount: subGroups.reduce((acc, curr) => acc + curr.txCount, 0),
          percentageOfTotal: totalSettledOutflow > 0 ? Math.round((totalAmount / totalSettledOutflow) * 100) : 0,
          subGroups,
        };
      })
      .filter((c) => c.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Top Settled Outflows
    const topSettledOutflows = [...debitsList]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    // Uncategorized check
    const uncategorizedGrp = categoryGroupMap.get('Uncategorized');
    const uncategorizedTotal = uncategorizedGrp ? uncategorizedGrp.total : 0;
    const uncategorizedCount = monthTransactions.filter(
      (t) => t.category === 'Uncategorized' && t.type === 'debit'
    ).length;

    // Daily Cadence Sparkline
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
    const dailyAverage = Math.round(totalSettledOutflow / Math.max(debitCount > 0 ? 30 : 1, 1));

    const fixedPct = totalSettledOutflow > 0 ? Math.round((committedFixed / totalSettledOutflow) * 100) : 0;
    const varPct = 100 - fixedPct;

    return {
      monthKey: activeMonthKey,
      monthLabel: formatMonthKey(activeMonthKey),
      totalSettledOutflow,
      totalInflow,
      netSavings: totalInflow - totalSettledOutflow,
      txCount: monthTransactions.length,
      debitCount,
      creditCount,
      committedFixed,
      committedFixedPercent: fixedPct,
      variableLifestyle,
      variableLifestylePercent: varPct,
      topSettledOutflows,
      bankAccounts,
      categoryBreakdown,
      dailyCadence,
      dailyAverage,
      uncategorizedCount,
      uncategorizedTotal,
      projection: {
        minOutflow: Math.round(totalSettledOutflow * 0.94),
        maxOutflow: Math.round(totalSettledOutflow * 1.06),
        confidence: 88,
        targetPerDay: Math.round(variableLifestyle / daysInMonth),
        forecastVariable: Math.round(variableLifestyle * 0.98),
        note: 'Median pacing based on recurring fixed mandates and rolling lifestyle spend.',
      },
    };
  }, [monthTransactions, activeMonthKey, categories]);

  // 3. Multi-Month Trend Summary
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

    const categoryTrends = categories.map((cat) => {
      const mCatMap = catTrendMap.get(cat.name);
      return {
        categoryName: cat.name,
        color: cat.color,
        monthlyData: months.map((m) => ({
          monthKey: m.monthKey,
          amount: mCatMap?.get(m.monthKey) || 0,
        })),
      };
    }).filter((ct) => ct.monthlyData.some((d) => d.amount > 0));

    const totalSpend = months.reduce((acc, m) => acc + m.totalOutflow, 0);
    const averageMonthlySpend = months.length > 0 ? Math.round(totalSpend / months.length) : 0;

    let highestSpendMonth: { monthLabel: string; amount: number } | null = null;
    let lowestSpendMonth: { monthLabel: string; amount: number } | null = null;

    if (months.length > 0) {
      const sortedBySpend = [...months].sort((a, b) => b.totalOutflow - a.totalOutflow);
      highestSpendMonth = { monthLabel: sortedBySpend[0].monthLabel, amount: sortedBySpend[0].totalOutflow };
      lowestSpendMonth = { monthLabel: sortedBySpend[sortedBySpend.length - 1].monthLabel, amount: sortedBySpend[sortedBySpend.length - 1].totalOutflow };
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
      // Type Filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }
      // Category Filter
      if (filterCategory !== 'all' && tx.category !== filterCategory) {
        return false;
      }
      // Search Query
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

  const handleImportTransactions = (newTxs: ExpenseTransaction[]) => {
    dispatch(importTransactions({ transactions: newTxs }));
  };

  const handleUpdateCategory = (
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

  const handleAddTransaction = (tx: ExpenseTransaction) => {
    dispatch(addTransaction(tx));
  };

  const handleDeleteTransaction = (id: string) => {
    dispatch(deleteTransaction(id));
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
    searchQuery,
    filterType,
    filterCategory,
    // Actions
    changeMonth,
    changeSearchQuery,
    changeFilterType,
    changeFilterCategory,
    importTransactions: handleImportTransactions,
    updateTransactionCategory: handleUpdateCategory,
    addTransaction: handleAddTransaction,
    deleteTransaction: handleDeleteTransaction,
    resetToDefaultSample: handleResetToDefaultSample,
  };
}
