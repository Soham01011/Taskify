import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_CATEGORY_GROUPS, DEFAULT_MERCHANT_RULES } from '../../constants/expenseCategories';
import { CategoryGroup, ExpenseTransaction, MerchantRule } from '../../types/expense';
import { SAMPLE_GPAY_TRANSACTIONS } from '../../utils/sampleExpenseData';

export interface ExpenseState {
  transactions: ExpenseTransaction[];
  categories: CategoryGroup[];
  merchantRules: MerchantRule[];
  selectedMonth: string; // 'latest' | 'YYYY-MM' | 'all'
  searchQuery: string;
  filterType: 'all' | 'debit' | 'credit';
  filterCategory: string; // 'all' or category group name
}

const initialState: ExpenseState = {
  transactions: SAMPLE_GPAY_TRANSACTIONS, // Pre-seeded with gpay.pdf data for out-of-the-box readiness
  categories: DEFAULT_CATEGORY_GROUPS,
  merchantRules: DEFAULT_MERCHANT_RULES,
  selectedMonth: 'latest',
  searchQuery: '',
  filterType: 'all',
  filterCategory: 'all',
};

export const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    importTransactions: (
      state,
      action: PayloadAction<{ transactions: ExpenseTransaction[] }>
    ) => {
      const existingIds = new Set(state.transactions.map((t) => t.id));
      const existingRefIds = new Set(
        state.transactions.filter((t) => t.refId).map((t) => t.refId)
      );

      const toAdd: ExpenseTransaction[] = [];
      for (const tx of action.payload.transactions) {
        const isDuplicate =
          existingIds.has(tx.id) || (tx.refId && existingRefIds.has(tx.refId));
        if (!isDuplicate) {
          toAdd.push(tx);
          existingIds.add(tx.id);
          if (tx.refId) existingRefIds.add(tx.refId);
        }
      }

      state.transactions = [...toAdd, ...state.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },

    addTransaction: (state, action: PayloadAction<ExpenseTransaction>) => {
      const exists = state.transactions.some(
        (t) => t.id === action.payload.id || (t.refId && t.refId === action.payload.refId)
      );
      if (!exists) {
        state.transactions.unshift(action.payload);
      }
    },

    updateTransactionCategory: (
      state,
      action: PayloadAction<{
        id: string;
        category: string;
        subCategory: string;
        applyToMerchant?: boolean;
        merchantName?: string;
      }>
    ) => {
      const { id, category, subCategory, applyToMerchant, merchantName } = action.payload;

      // 1. Update the single targeted transaction
      const targetTx = state.transactions.find((t) => t.id === id);
      if (targetTx) {
        targetTx.category = category;
        targetTx.subCategory = subCategory;
      }

      // 2. If user selected "Apply to all from this merchant"
      if (applyToMerchant && merchantName) {
        const cleanMerchant = merchantName.toLowerCase().trim();

        // Update all other transactions from this merchant
        state.transactions.forEach((tx) => {
          if (tx.counterparty.toLowerCase().trim() === cleanMerchant) {
            tx.category = category;
            tx.subCategory = subCategory;
          }
        });

        // Add or update persistent merchant rule
        const existingRuleIndex = state.merchantRules.findIndex(
          (r) => r.merchantKeyword.toLowerCase() === cleanMerchant
        );
        if (existingRuleIndex >= 0) {
          state.merchantRules[existingRuleIndex] = {
            merchantKeyword: cleanMerchant,
            category,
            subCategory,
          };
        } else {
          state.merchantRules.unshift({
            merchantKeyword: cleanMerchant,
            category,
            subCategory,
          });
        }
      }
    },

    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter((t) => t.id !== action.payload);
    },

    clearAllTransactions: (state) => {
      state.transactions = [];
    },

    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilterType: (state, action: PayloadAction<'all' | 'debit' | 'credit'>) => {
      state.filterType = action.payload;
    },

    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload;
    },

    addMerchantRule: (state, action: PayloadAction<MerchantRule>) => {
      const idx = state.merchantRules.findIndex(
        (r) => r.merchantKeyword.toLowerCase() === action.payload.merchantKeyword.toLowerCase()
      );
      if (idx >= 0) {
        state.merchantRules[idx] = action.payload;
      } else {
        state.merchantRules.unshift(action.payload);
      }
    },

    resetToDefaultSample: (state) => {
      state.transactions = SAMPLE_GPAY_TRANSACTIONS;
      state.categories = DEFAULT_CATEGORY_GROUPS;
      state.merchantRules = DEFAULT_MERCHANT_RULES;
      state.selectedMonth = 'latest';
    },
  },
});

export const {
  importTransactions,
  addTransaction,
  updateTransactionCategory,
  deleteTransaction,
  clearAllTransactions,
  setSelectedMonth,
  setSearchQuery,
  setFilterType,
  setFilterCategory,
  addMerchantRule,
  resetToDefaultSample,
} = expenseSlice.actions;

export default expenseSlice.reducer;
