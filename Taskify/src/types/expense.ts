export interface ExpenseTransaction {
  id: string; // Hash: `${date}_${amount}_${refId}`
  date: string; // "YYYY-MM-DD" e.g. "2026-09-01"
  rawDate: string; // "01 Sep, 2026"
  time: string; // "12:14 PM"
  type: 'debit' | 'credit';
  counterparty: string;
  amount: number;
  refId: string; // UPI Transaction ID
  account: string; // e.g. "Saraswat Bank 8847"
  category: string;
  subCategory: string;
  note?: string;
  isManual?: boolean;
  source?: 'gpay' | 'manual' | 'other';
  createdAt: number;
}

export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  isFixed: boolean; // Committed Fixed vs Variable Lifestyle
  subCategories: string[];
}

export interface MerchantRule {
  merchantKeyword: string; // Lowercase
  category: string;
  subCategory: string;
}

export interface BankAccountBreakdown {
  account: string;
  totalOutflow: number;
  totalInflow: number;
  txCount: number;
  percentage: number;
}

export interface SubCategoryBreakdown {
  name: string;
  amount: number;
  txCount: number;
  percentageOfGroup: number;
  merchants: string[];
}

export interface CategoryBreakdown {
  category: CategoryGroup;
  totalAmount: number;
  txCount: number;
  percentageOfTotal: number;
  subGroups: SubCategoryBreakdown[];
}

export interface DailyCadencePoint {
  dayLabel: string; // "Mon", "Tue", etc.
  dateStr?: string;
  amount: number;
  percentage: number;
}

export interface MonthSummary {
  monthKey: string; // "2026-09"
  monthLabel: string; // "September 2026"
  totalSettledOutflow: number;
  totalInflow: number;
  netSavings: number;
  txCount: number;
  debitCount: number;
  creditCount: number;
  committedFixed: number;
  committedFixedPercent: number;
  variableLifestyle: number;
  variableLifestylePercent: number;
  topSettledOutflows: ExpenseTransaction[];
  bankAccounts: BankAccountBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  dailyCadence: DailyCadencePoint[];
  dailyAverage: number;
  uncategorizedCount: number;
  uncategorizedTotal: number;
  projection: {
    minOutflow: number;
    maxOutflow: number;
    confidence: number;
    targetPerDay: number;
    forecastVariable: number;
    note: string;
  };
}

export interface MultiMonthSummary {
  months: {
    monthKey: string;
    monthLabel: string;
    totalOutflow: number;
    totalInflow: number;
    txCount: number;
  }[];
  categoryTrends: {
    categoryName: string;
    color: string;
    monthlyData: { monthKey: string; amount: number }[];
  }[];
  averageMonthlySpend: number;
  highestSpendMonth: { monthLabel: string; amount: number } | null;
  lowestSpendMonth: { monthLabel: string; amount: number } | null;
}
