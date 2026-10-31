import { DEFAULT_MERCHANT_RULES } from '../constants/expenseCategories';
import { ExpenseTransaction, MerchantRule } from '../types/expense';

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

/**
 * Normalizes date string into YYYY-MM-DD
 * e.g. "01 Sep, 2026" -> "2026-09-01"
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Format: "DD Mon, YYYY" or "DD Month YYYY"
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthName = match[2].toLowerCase();
    const month = MONTH_MAP[monthName] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Generates duplicate-proof unique hash ID for transaction
 */
export function generateTransactionId(date: string, amount: number, refId: string, counterparty: string): string {
  const cleanRef = (refId || '').trim();
  if (cleanRef) {
    return `upi_${cleanRef}`;
  }
  // Fallback hash based on date, amount and counterparty
  const cleanDate = (date || '').trim();
  const cleanAmt = amount.toFixed(2);
  const cleanCounterparty = (counterparty || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `tx_${cleanDate}_${cleanAmt}_${cleanCounterparty}`;
}

/**
 * Matches category and sub-group for counterparty
 */
export function categorizeTransaction(
  counterparty: string,
  type: 'debit' | 'credit',
  customRules: MerchantRule[] = []
): { category: string; subCategory: string } {
  const lowerCounterparty = counterparty.toLowerCase().trim();

  for (const rule of customRules) {
    if (lowerCounterparty.includes(rule.merchantKeyword.toLowerCase())) {
      return { category: rule.category, subCategory: rule.subCategory || 'General' };
    }
  }

  return { category: 'Uncategorized', subCategory: 'General' };
}

export interface ParseResult {
  transactions: ExpenseTransaction[];
  newTransactions: ExpenseTransaction[];
  duplicateCount: number;
  totalParsedCount: number;
  statementPeriod?: {
    raw: string;
    startDate?: string;
    endDate?: string;
  };
  summaryFromHeader?: {
    totalSent: number;
    totalReceived: number;
  };
}

/**
 * Parses raw text from Google Pay Transaction Statement PDF
 */
export function parseGPayStatementText(
  rawText: string,
  existingTransactions: ExpenseTransaction[] = [],
  merchantRules: MerchantRule[] = []
): ParseResult {
  const existingIdSet = new Set(existingTransactions.map(t => t.id));
  const existingRefIdSet = new Set(
    existingTransactions.filter(t => t.refId).map(t => t.refId)
  );

  let statementPeriod: { raw: string; startDate?: string; endDate?: string } | undefined;
  let summaryFromHeader: { totalSent: number; totalReceived: number } | undefined;

  // 1. Check for Statement Period
  const periodMatch = rawText.match(/Transaction statement period[\r\n]+([^\r\n]+)/i);
  if (periodMatch) {
    statementPeriod = { raw: periodMatch[1].trim() };
    const dateRange = periodMatch[1].split('-');
    if (dateRange.length === 2) {
      statementPeriod.startDate = normalizeDate(dateRange[0].trim());
      statementPeriod.endDate = normalizeDate(dateRange[1].trim());
    }
  }

  // 2. Check for Sent / Received summary in header
  const sentMatch = rawText.match(/Sent[\s\S]*?₹\s*([0-9,]+(?:\.[0-9]+)?)/i);
  const receivedMatch = rawText.match(/Received[\s\S]*?₹\s*([0-9,]+(?:\.[0-9]+)?)/i);
  if (sentMatch || receivedMatch) {
    summaryFromHeader = {
      totalSent: sentMatch ? parseFloat(sentMatch[1].replace(/,/g, '')) : 0,
      totalReceived: receivedMatch ? parseFloat(receivedMatch[1].replace(/,/g, '')) : 0,
    };
  }

  // 3. Extract transaction blocks using Date pattern
  const dateRegex = /(\d{1,2}\s+[A-Za-z]{3},\s+\d{4})/g;
  const dateMatches: { dateStr: string; index: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = dateRegex.exec(rawText)) !== null) {
    dateMatches.push({ dateStr: m[1], index: m.index });
  }

  const parsedTransactions: ExpenseTransaction[] = [];
  let duplicateCount = 0;

  for (let i = 0; i < dateMatches.length; i++) {
    const startIdx = dateMatches[i].index;
    const endIdx = i + 1 < dateMatches.length ? dateMatches[i + 1].index : rawText.length;
    let block = rawText.substring(startIdx, endIdx);

    // Filter out page footers / repeating headers
    block = block.replace(/Note: This statement reflects[\s\S]*?Page \d+ of \d+/gi, '');
    block = block.replace(/Transaction statement[\s\S]*?Amount/gi, '');

    const rawDate = dateMatches[i].dateStr;
    const date = normalizeDate(rawDate);

    // Time (e.g. 12:14 PM)
    const timeMatch = block.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
    const time = timeMatch ? timeMatch[1].trim() : '12:00 PM';

    // Type & Counterparty
    const typeMatch = block.match(/(Paid to|Received from)\s+([^\r\n]+)/i);
    let type: 'debit' | 'credit' = 'debit';
    let counterparty = 'Unknown';

    if (typeMatch) {
      type = typeMatch[1].toLowerCase().startsWith('paid') ? 'debit' : 'credit';
      counterparty = typeMatch[2].trim();
    }

    // UPI Transaction ID
    const refMatch = block.match(/UPI\s+Transaction\s+ID:\s*([A-Za-z0-9]+)/i);
    const refId = refMatch ? refMatch[1].trim() : '';

    // Amount (₹133.50 or ₹2,499)
    const amountMatch = block.match(/₹\s*([0-9,]+(?:\.[0-9]+)?)/);
    let amount = 0;
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Account (e.g. "Paid by Saraswat Bank 8847" or "Paid to Saraswat Bank 8847")
    let account = 'Primary Account';
    if (type === 'credit') {
      const accMatch = block.match(/(?:Paid to|Deposited to)\s+([A-Za-z0-9\s]+?)(?=\r?\n|$)/i);
      if (accMatch) account = accMatch[1].trim();
    } else {
      const accMatch = block.match(/(?:Paid by)\s+([A-Za-z0-9\s]+?)(?=\r?\n|$)/i);
      if (accMatch) account = accMatch[1].trim();
    }

    // Generate unique ID
    const txId = generateTransactionId(date, amount, refId, counterparty);

    // Auto-categorize
    const { category, subCategory } = categorizeTransaction(counterparty, type, merchantRules);

    const transaction: ExpenseTransaction = {
      id: txId,
      date,
      rawDate,
      time,
      type,
      counterparty,
      amount,
      refId,
      account,
      category,
      subCategory,
      source: 'gpay',
      createdAt: Date.now(),
    };

    parsedTransactions.push(transaction);

    // Duplicate check
    const isDuplicate = existingIdSet.has(txId) || (refId && existingRefIdSet.has(refId));
    if (isDuplicate) {
      duplicateCount++;
    }
  }

  // Filter out duplicates for newTransactions list
  const newTransactions = parsedTransactions.filter(
    tx => !existingIdSet.has(tx.id) && (!tx.refId || !existingRefIdSet.has(tx.refId))
  );

  return {
    transactions: parsedTransactions,
    newTransactions,
    duplicateCount,
    totalParsedCount: parsedTransactions.length,
    statementPeriod,
    summaryFromHeader,
  };
}
