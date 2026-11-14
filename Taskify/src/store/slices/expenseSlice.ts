import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryGroup, ExpenseTransaction, MerchantRule } from '../../types/expense';

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
  transactions: [], // Empty on fresh install — data comes from user uploads
  categories: [], // Starts empty! User creates and manages their own custom groups
  merchantRules: [],
  selectedMonth: 'latest',
  searchQuery: '',
  filterType: 'all',
  filterCategory: 'all',
};

export const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    // 1. Import parsed statements with duplicate protection & auto-matching against user's custom rules
    importTransactions: (
      state,
      action: PayloadAction<{ transactions: ExpenseTransaction[] }>
    ) => {
      const existingIds = new Set(state.transactions.map((t) => t.id));
      const existingRefIds = new Set(
        state.transactions.filter((t) => t.refId).map((t) => t.refId)
      );

      const toAdd: ExpenseTransaction[] = [];
      for (const rawTx of action.payload.transactions) {
        const isDuplicate =
          existingIds.has(rawTx.id) || (rawTx.refId && existingRefIds.has(rawTx.refId));

        if (!isDuplicate) {
          const tx = { ...rawTx };
          // If transaction is Uncategorized, check if any existing user rule matches
          if (!tx.category || tx.category === 'Uncategorized') {
            const cpLower = (tx.counterparty || '').toLowerCase();
            const matchedRule = state.merchantRules.find((r) =>
              cpLower.includes(r.merchantKeyword.toLowerCase())
            );
            if (matchedRule) {
              tx.category = matchedRule.category;
              tx.subCategory = matchedRule.subCategory || 'General';
            } else {
              tx.category = 'Uncategorized';
              tx.subCategory = 'General';
            }
          }
          toAdd.push(tx);
          existingIds.add(tx.id);
          if (tx.refId) existingRefIds.add(tx.refId);
        }
      }

      state.transactions = [...toAdd, ...state.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },

    // 2. Add single transaction
    addTransaction: (state, action: PayloadAction<ExpenseTransaction>) => {
      const exists = state.transactions.some(
        (t) => t.id === action.payload.id || (t.refId && t.refId === action.payload.refId)
      );
      if (!exists) {
        state.transactions.unshift(action.payload);
      }
    },

    // 3. User creates a new Category Group with sub-groups and optional merchant keywords
    createCategoryGroup: (
      state,
      action: PayloadAction<{
        name: string;
        color: string;
        icon?: string;
        subCategories?: string[];
        merchants?: string[];
      }>
    ) => {
      const { name, color, icon, subCategories = [], merchants = [] } = action.payload;
      const cleanName = name.trim();
      const id = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const cleanSubCategories = subCategories.map((s) => s.trim()).filter(Boolean);
      if (cleanSubCategories.length === 0) {
        cleanSubCategories.push('General');
      }

      const newGroup: CategoryGroup = {
        id,
        name: cleanName,
        color,
        icon: icon || 'Tag',
        subCategories: cleanSubCategories,
        merchants: merchants.map((m) => m.trim().toLowerCase()).filter(Boolean),
      };

      state.categories.push(newGroup);

      // If merchants were specified, map them and update any existing matching transactions
      if (newGroup.merchants && newGroup.merchants.length > 0) {
        newGroup.merchants.forEach((mKeyword) => {
          // Add merchant rule
          const existingRule = state.merchantRules.find(
            (r) => r.merchantKeyword.toLowerCase() === mKeyword.toLowerCase()
          );
          if (existingRule) {
            existingRule.category = cleanName;
            existingRule.subCategory = cleanSubCategories[0];
          } else {
            state.merchantRules.unshift({
              merchantKeyword: mKeyword.toLowerCase(),
              category: cleanName,
              subCategory: cleanSubCategories[0],
            });
          }

          // Move any matching transactions to this new group
          state.transactions.forEach((tx) => {
            if ((tx.counterparty || '').toLowerCase().includes(mKeyword.toLowerCase())) {
              tx.category = cleanName;
              tx.subCategory = cleanSubCategories[0];
            }
          });
        });
      }
    },

    // 4. Update existing Category Group (rename, change color, update sub-groups, update merchants)
    updateCategoryGroup: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        color: string;
        icon?: string;
        subCategories: string[];
        merchants?: string[];
      }>
    ) => {
      const { id, name, color, icon, subCategories, merchants = [] } = action.payload;
      const grpIndex = state.categories.findIndex((c) => c.id === id);
      if (grpIndex < 0) return;

      const oldName = state.categories[grpIndex].name;
      const newName = name.trim();
      const cleanSubCategories = subCategories.map((s) => s.trim()).filter(Boolean);
      if (cleanSubCategories.length === 0) {
        cleanSubCategories.push('General');
      }
      const cleanMerchants = merchants.map((m) => m.trim().toLowerCase()).filter(Boolean);

      state.categories[grpIndex] = {
        ...state.categories[grpIndex],
        name: newName,
        color,
        icon: icon || state.categories[grpIndex].icon || 'Tag',
        subCategories: cleanSubCategories,
        merchants: cleanMerchants,
      };

      // If name changed, update all transactions and rules using the old group name
      if (oldName !== newName) {
        state.transactions.forEach((tx) => {
          if (tx.category === oldName) {
            tx.category = newName;
            // Validate sub-category
            if (!cleanSubCategories.includes(tx.subCategory)) {
              tx.subCategory = cleanSubCategories[0];
            }
          }
        });

        state.merchantRules.forEach((rule) => {
          if (rule.category === oldName) {
            rule.category = newName;
            if (!cleanSubCategories.includes(rule.subCategory)) {
              rule.subCategory = cleanSubCategories[0];
            }
          }
        });
      }

      // Re-map merchants
      cleanMerchants.forEach((mKeyword) => {
        const existingRule = state.merchantRules.find(
          (r) => r.merchantKeyword.toLowerCase() === mKeyword
        );
        if (existingRule) {
          existingRule.category = newName;
          existingRule.subCategory = cleanSubCategories[0];
        } else {
          state.merchantRules.unshift({
            merchantKeyword: mKeyword,
            category: newName,
            subCategory: cleanSubCategories[0],
          });
        }

        state.transactions.forEach((tx) => {
          if ((tx.counterparty || '').toLowerCase().includes(mKeyword)) {
            tx.category = newName;
            tx.subCategory = cleanSubCategories[0];
          }
        });
      });
    },

    // 5. Delete Category Group (unassigns transactions back to Uncategorized)
    deleteCategoryGroup: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const grp = state.categories.find((c) => c.id === id);
      if (!grp) return;

      const groupName = grp.name;
      // Reset transactions in this group
      state.transactions.forEach((tx) => {
        if (tx.category === groupName) {
          tx.category = 'Uncategorized';
          tx.subCategory = 'General';
        }
      });

      // Remove merchant rules for this group
      state.merchantRules = state.merchantRules.filter((r) => r.category !== groupName);

      // Remove group from categories
      state.categories = state.categories.filter((c) => c.id !== id);

      // If active filter was this group, reset filter
      if (state.filterCategory === groupName) {
        state.filterCategory = 'all';
      }
    },

    // 6. Assign merchant's name directly to a group or sub-group
    assignMerchantToGroup: (
      state,
      action: PayloadAction<{
        merchantKeyword: string;
        category: string;
        subCategory?: string;
      }>
    ) => {
      const { merchantKeyword, category, subCategory } = action.payload;
      const cleanKeyword = merchantKeyword.trim().toLowerCase();
      const cleanSub = subCategory || 'General';

      // Update/add rule
      const ruleIdx = state.merchantRules.findIndex(
        (r) => r.merchantKeyword.toLowerCase() === cleanKeyword
      );
      if (ruleIdx >= 0) {
        state.merchantRules[ruleIdx] = {
          merchantKeyword: cleanKeyword,
          category,
          subCategory: cleanSub,
        };
      } else {
        state.merchantRules.unshift({
          merchantKeyword: cleanKeyword,
          category,
          subCategory: cleanSub,
        });
      }

      // Add merchant to group's merchants list if not present
      const targetGroup = state.categories.find((c) => c.name === category);
      if (targetGroup) {
        if (!targetGroup.merchants) targetGroup.merchants = [];
        if (!targetGroup.merchants.includes(cleanKeyword)) {
          targetGroup.merchants.push(cleanKeyword);
        }
      }

      // Immediately move all matching transactions
      state.transactions.forEach((tx) => {
        if ((tx.counterparty || '').toLowerCase().includes(cleanKeyword)) {
          tx.category = category;
          tx.subCategory = cleanSub;
        }
      });
    },

    // 7. Move transactions from one group to another (individual or merchant-wide)
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

      // Update the targeted transaction
      const targetTx = state.transactions.find((t) => t.id === id);
      if (targetTx) {
        targetTx.category = category;
        targetTx.subCategory = subCategory;
      }

      // If user selected "Apply to all from this merchant"
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

        // Also ensure merchant is tracked on target group
        const targetGroup = state.categories.find((c) => c.name === category);
        if (targetGroup) {
          if (!targetGroup.merchants) targetGroup.merchants = [];
          if (!targetGroup.merchants.includes(cleanMerchant)) {
            targetGroup.merchants.push(cleanMerchant);
          }
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

    resetToDefaultSample: (state) => {
      state.transactions = [];
      state.categories = [];
      state.merchantRules = [];
      state.selectedMonth = 'latest';
      state.filterCategory = 'all';
    },

    restoreExpenseData: (
      state,
      action: PayloadAction<{
        transactions?: ExpenseTransaction[];
        categories?: CategoryGroup[];
        merchantRules?: MerchantRule[];
        mode?: 'merge' | 'replace';
      }>
    ) => {
      const {
        transactions = [],
        categories = [],
        merchantRules = [],
        mode = 'merge',
      } = action.payload;

      if (mode === 'replace') {
        state.transactions = [...transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        state.categories = categories;
        state.merchantRules = merchantRules;
      } else {
        // Merge category groups (add if name doesn't exist)
        const existingCatNames = new Set(state.categories.map((c) => c.name.toLowerCase()));
        for (const cat of categories) {
          if (!existingCatNames.has(cat.name.toLowerCase())) {
            state.categories.push(cat);
            existingCatNames.add(cat.name.toLowerCase());
          }
        }

        // Merge merchant rules
        const existingKeywords = new Set(
          state.merchantRules.map((r) => r.merchantKeyword.toLowerCase())
        );
        for (const rule of merchantRules) {
          if (!existingKeywords.has(rule.merchantKeyword.toLowerCase())) {
            state.merchantRules.push(rule);
            existingKeywords.add(rule.merchantKeyword.toLowerCase());
          }
        }

        // Merge transactions with deduplication
        const existingIds = new Set(state.transactions.map((t) => t.id));
        const existingRefIds = new Set(
          state.transactions.filter((t) => t.refId).map((t) => t.refId)
        );

        const toAdd: ExpenseTransaction[] = [];
        for (const tx of transactions) {
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
      }
    },
  },
});

export const {
  importTransactions,
  addTransaction,
  createCategoryGroup,
  updateCategoryGroup,
  deleteCategoryGroup,
  assignMerchantToGroup,
  updateTransactionCategory,
  deleteTransaction,
  clearAllTransactions,
  setSelectedMonth,
  setSearchQuery,
  setFilterType,
  setFilterCategory,
  resetToDefaultSample,
  restoreExpenseData,
} = expenseSlice.actions;

export default expenseSlice.reducer;
