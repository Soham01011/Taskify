import { styles } from "@/assets/styles/uploadStatementModal.styles";
import { useAppTheme } from '@/hooks/use-theme';
import * as DocumentPicker from 'expo-document-picker';
import {
  extractTextWithInfo,
  isPasswordProtected,
  isAvailable as isPdfExtractAvailable,
} from 'expo-pdf-text-extract';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Sparkles,
  Upload,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ExpenseTransaction, MerchantRule } from '../../types/expense';
import { parseGPayStatementText, ParseResult } from '../../utils/expenseParser';
import { SAMPLE_GPAY_TRANSACTIONS } from '../../utils/sampleExpenseData';

interface Props {
  visible: boolean;
  onClose: () => void;
  existingTransactions: ExpenseTransaction[];
  merchantRules: MerchantRule[];
  onConfirmImport: (transactions: ExpenseTransaction[]) => void;
}

export const UploadStatementModal: React.FC<Props> = ({
  visible,
  onClose,
  existingTransactions,
  merchantRules,
  onConfirmImport,
}) => {
  const { colors, isDark } = useAppTheme();

  // Step states: 'idle' | 'loading' | 'password_prompt' | 'preview'
  const [step, setStep] = useState<'idle' | 'loading' | 'password_prompt' | 'preview'>('idle');
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Processing statement...');

  // Parsed result state
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  const resetState = () => {
    setStep('idle');
    setSelectedFileUri(null);
    setSelectedFileName('');
    setPassword('');
    setPasswordError(null);
    setParseResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // 1. Pick PDF File using DocumentPicker
  const handlePickDocument = async () => {
    try {
      setPasswordError(null);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return;
      }

      const file = res.assets[0];
      setSelectedFileUri(file.uri);
      setSelectedFileName(file.name || 'Statement.pdf');
      processPdfFile(file.uri);
    } catch (err: any) {
      Alert.alert('Error picking file', err?.message || 'Could not access document.');
    }
  };

  // 2. Process PDF: Check encryption & extract text
  const processPdfFile = async (uri: string, customPassword?: string) => {
    setStep('loading');
    setLoadingMessage('Checking PDF security...');

    try {
      const nativeAvailable = isPdfExtractAvailable();
      if (!nativeAvailable) {
        // Fallback for environment without native build: offer pre-parsed sample statement
        setStep('idle');
        Alert.alert(
          'Native PDF Module in Dev Build',
          'Native PDF extraction runs on Android/iOS build. To test right now, you can load the sample GPay statement (Sep 2026) directly!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Load GPay Sample', onPress: handleLoadSampleStatement },
          ]
        );
        return;
      }

      // Check if password protected
      if (!customPassword) {
        const protectedCheck = await isPasswordProtected(uri);
        if (protectedCheck) {
          setStep('password_prompt');
          return;
        }
      }

      setLoadingMessage('Extracting & parsing transactions...');
      const extractRes = await extractTextWithInfo(uri, customPassword);

      if (!extractRes.success) {
        if (extractRes.passwordRequired || extractRes.errorCode === 'PASSWORD_REQUIRED') {
          setPasswordError('This PDF is password protected. Enter password below.');
          setStep('password_prompt');
          return;
        }
        if (extractRes.errorCode === 'INCORRECT_PASSWORD') {
          setPasswordError('Incorrect password. Please verify and try again.');
          setStep('password_prompt');
          return;
        }
        throw new Error(extractRes.error || 'Failed to extract text from PDF.');
      }

      // Parse text into structured transactions
      const parsed = parseGPayStatementText(extractRes.text, existingTransactions, merchantRules);
      setParseResult(parsed);
      setStep('preview');
    } catch (err: any) {
      if (err?.code === 'PASSWORD_REQUIRED' || err?.code === 'INCORRECT_PASSWORD') {
        setPasswordError(
          err.code === 'INCORRECT_PASSWORD'
            ? 'Incorrect password. Try again.'
            : 'Password required to unlock PDF.'
        );
        setStep('password_prompt');
      } else {
        setStep('idle');
        Alert.alert('Parsing Error', err?.message || 'Unable to parse statement.');
      }
    }
  };

  // 3. Unlock with entered password
  const handleUnlockPassword = () => {
    if (!password.trim()) {
      setPasswordError('Please enter the password.');
      return;
    }
    if (selectedFileUri) {
      processPdfFile(selectedFileUri, password.trim());
    }
  };

  // 4. One-Tap Demo Load of Sample GPay statement (from gpay.pdf)
  const handleLoadSampleStatement = () => {
    // Check duplicates against existing transactions
    const existingIds = new Set(existingTransactions.map((t) => t.id));
    const duplicates = SAMPLE_GPAY_TRANSACTIONS.filter((t) => existingIds.has(t.id));
    const newItems = SAMPLE_GPAY_TRANSACTIONS.filter((t) => !existingIds.has(t.id));

    setParseResult({
      transactions: SAMPLE_GPAY_TRANSACTIONS,
      newTransactions: newItems,
      duplicateCount: duplicates.length,
      totalParsedCount: SAMPLE_GPAY_TRANSACTIONS.length,
      statementPeriod: {
        raw: '01 September 2026 - 30 September 2026',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      },
      summaryFromHeader: {
        totalSent: 7425.3,
        totalReceived: 457.0,
      },
    });
    setSelectedFileName('gpay_statement_september_2026.pdf');
    setStep('preview');
  };

  // 5. Confirm and Save
  const handleConfirmSave = () => {
    if (!parseResult) return;
    onConfirmImport(parseResult.newTransactions);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primary + '18' }]}>
                <Upload size={18} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Upload Statement
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* STEP 1: Idle Pick Screen */}
          {step === 'idle' && (
            <View style={styles.stepContent}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Pick your Google Pay PDF statement. Parsing runs locally on-device — no data leaves your phone.
              </Text>

              {/* Main Document Picker Button */}
              <TouchableOpacity
                style={[styles.dropZone, { borderColor: colors.primary, backgroundColor: colors.primary + '0A' }]}
                onPress={handlePickDocument}
                activeOpacity={0.8}
              >
                <View style={[styles.cloudIconBox, { backgroundColor: colors.primary + '20' }]}>
                  <FileText size={32} color={colors.primary} />
                </View>
                <Text style={[styles.dropTitle, { color: colors.text }]}>
                  Choose Statement PDF
                </Text>
                <Text style={[styles.dropSub, { color: colors.textSecondary }]}>
                  Supports Google Pay (GPay) exports
                </Text>
              </TouchableOpacity>

              {/* Quick Sample Loader Button */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[
                  styles.sampleBtn,
                  { backgroundColor: isDark ? '#262A30' : '#F1F5F9', borderColor: colors.border },
                ]}
                onPress={handleLoadSampleStatement}
                activeOpacity={0.7}
              >
                <Sparkles size={16} color={colors.primary} />
                <Text style={[styles.sampleBtnText, { color: colors.text }]}>
                  Load Sample GPay Statement (Sep 2026)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Loading State */}
          {step === 'loading' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {loadingMessage}
              </Text>
              <Text style={[styles.loadingSub, { color: colors.textSecondary }]}>
                Deduplicating and matching keyword rules locally
              </Text>
            </View>
          )}

          {/* STEP 3: Password Prompt */}
          {step === 'password_prompt' && (
            <View style={styles.stepContent}>
              <View style={[styles.lockIconBox, { backgroundColor: '#FF7A0020' }]}>
                <Lock size={28} color="#FF7A00" />
              </View>
              <Text style={[styles.passwordTitle, { color: colors.text }]}>
                Document is Protected
              </Text>
              <Text style={[styles.passwordSub, { color: colors.textSecondary }]}>
                Enter the password for {selectedFileName || 'this PDF'} to decrypt text.
              </Text>

              {passwordError && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={14} color="#E74C3C" />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              )}

              <View
                style={[
                  styles.passwordInputRow,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Enter PDF password"
                  placeholderTextColor={colors.placeholder || colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btnSecondary, { borderColor: colors.border }]}
                  onPress={() => setStep('idle')}
                >
                  <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                  onPress={handleUnlockPassword}
                >
                  <Text style={styles.btnPrimaryText}>Unlock & Parse</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 4: Preview Before Saving */}
          {step === 'preview' && parseResult && (
            <View style={styles.previewContainer}>
              {/* Summary Banner */}
              <View
                style={[
                  styles.previewSummaryCard,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <View style={styles.previewTopRow}>
                  <Text style={[styles.previewPeriod, { color: colors.text }]}>
                    {parseResult.statementPeriod?.raw || 'Statement Summary'}
                  </Text>
                  <View style={[styles.previewBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.previewBadgeText, { color: colors.primary }]}>
                      {parseResult.totalParsedCount} Parsed
                    </Text>
                  </View>
                </View>

                {/* Amounts Preview */}
                <View style={styles.previewAmountsRow}>
                  <View style={styles.previewAmtCol}>
                    <Text style={[styles.previewAmtLabel, { color: colors.textSecondary }]}>Total Sent</Text>
                    <Text style={[styles.previewAmtVal, { color: colors.text }]}>
                      ₹{parseResult.summaryFromHeader?.totalSent.toLocaleString('en-IN') ||
                        parseResult.transactions
                          .filter((t) => t.type === 'debit')
                          .reduce((acc, t) => acc + t.amount, 0)
                          .toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.previewAmtCol}>
                    <Text style={[styles.previewAmtLabel, { color: colors.textSecondary }]}>Received</Text>
                    <Text style={[styles.previewAmtVal, { color: '#2ECC71' }]}>
                      +₹{parseResult.summaryFromHeader?.totalReceived.toLocaleString('en-IN') ||
                        parseResult.transactions
                          .filter((t) => t.type === 'credit')
                          .reduce((acc, t) => acc + t.amount, 0)
                          .toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Duplicate Protection Status Banner */}
                <View style={styles.duplicateStatusRow}>
                  <CheckCircle2 size={14} color="#2ECC71" />
                  <Text style={[styles.duplicateText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>
                      {parseResult.newTransactions.length} new
                    </Text>{' '}
                    transactions to import
                    {parseResult.duplicateCount > 0 && (
                      <Text style={{ color: '#E74C3C' }}>
                        {' '}({parseResult.duplicateCount} duplicates skipped)
                      </Text>
                    )}
                  </Text>
                </View>
              </View>

              {/* Transactions Preview List - Horizontally Scrollable */}
              <View style={styles.previewHeadingRow}>
                <Text style={[styles.previewListHeading, { color: colors.textSecondary }]}>
                  Preview parsed transactions ({parseResult.transactions.length})
                </Text>
                <Text style={[styles.swipeHint, { color: colors.primary }]}>
                  Swipe →
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalPreviewList}
              >
                {parseResult.transactions.map((tx, idx) => {
                  const isExisting = existingTransactions.some((t) => t.id === tx.id);
                  const isCredit = tx.type === 'credit';
                  return (
                    <View
                      key={tx.id || idx}
                      style={[
                        styles.previewHorizontalCard,
                        {
                          backgroundColor: isDark ? '#171C22' : '#FFFFFF',
                          borderColor: isExisting ? '#FF7A0060' : colors.border,
                        },
                      ]}
                    >
                      {/* Top Badges */}
                      <View style={styles.cardTopRow}>
                        <View
                          style={[
                            styles.indexPill,
                            { backgroundColor: isDark ? '#262A30' : '#E2E8F0' },
                          ]}
                        >
                          <Text style={[styles.indexPillText, { color: colors.textSecondary }]}>
                            #{idx + 1}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.typePill,
                            {
                              backgroundColor: isCredit ? '#2ECC7120' : colors.primary + '18',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.typePillText,
                              { color: isCredit ? '#2ECC71' : colors.primary },
                            ]}
                          >
                            {tx.type.toUpperCase()}
                          </Text>
                        </View>
                        {isExisting && (
                          <View style={styles.skippedPill}>
                            <Text style={styles.skippedPillText}>SKIPPED</Text>
                          </View>
                        )}
                      </View>

                      {/* Amount & Merchant */}
                      <View style={{ marginVertical: 4 }}>
                        <Text
                          style={[
                            styles.cardAmount,
                            { color: isCredit ? '#2ECC71' : colors.text },
                          ]}
                          numberOfLines={1}
                        >
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={[styles.cardMerchant, { color: colors.text }]} numberOfLines={1}>
                          {tx.counterparty}
                        </Text>
                      </View>

                      {/* Category & Date Footer */}
                      <View style={styles.cardFooter}>
                        <View
                          style={[
                            styles.categoryTag,
                            { backgroundColor: isDark ? '#262A30' : '#F1F5F9' },
                          ]}
                        >
                          <Text
                            style={[styles.categoryTagText, { color: colors.textSecondary }]}
                            numberOfLines={1}
                          >
                            {tx.category} › {tx.subCategory}
                          </Text>
                        </View>
                        <View style={styles.cardMetaRow}>
                          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                            {tx.rawDate || tx.date}
                          </Text>
                          {tx.account ? (
                            <Text style={[styles.cardAccount, { color: colors.textSecondary }]}>
                              {tx.account}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btnSecondary, { borderColor: colors.border }]}
                  onPress={() => setStep('idle')}
                >
                  <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btnPrimary,
                    {
                      backgroundColor: parseResult.newTransactions.length > 0 ? colors.primary : colors.textSecondary,
                    },
                  ]}
                  onPress={handleConfirmSave}
                  disabled={parseResult.newTransactions.length === 0}
                >
                  <Text style={styles.btnPrimaryText}>
                    {parseResult.newTransactions.length > 0
                      ? `Import & Save (${parseResult.newTransactions.length})`
                      : 'All Already Imported'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};


