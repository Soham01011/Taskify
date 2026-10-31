import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  extractTextWithInfo,
  isAvailable as isPdfExtractAvailable,
  isPasswordProtected,
} from 'expo-pdf-text-extract';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Sparkles,
  Upload,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
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

              {/* Transactions Preview List */}
              <Text style={[styles.previewListHeading, { color: colors.textSecondary }]}>
                Preview parsed items:
              </Text>
              <ScrollView style={styles.previewScrollView} showsVerticalScrollIndicator={false}>
                {parseResult.transactions.slice(0, 15).map((tx, idx) => (
                  <View
                    key={tx.id || idx}
                    style={[
                      styles.previewItem,
                      { backgroundColor: isDark ? '#171C22' : '#FFFFFF', borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.previewItemLeft}>
                      <Text style={[styles.previewMerchant, { color: colors.text }]} numberOfLines={1}>
                        {tx.counterparty}
                      </Text>
                      <Text style={[styles.previewItemMeta, { color: colors.textSecondary }]}>
                        {tx.rawDate || tx.date} • {tx.category} › {tx.subCategory}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.previewItemAmount,
                        { color: tx.type === 'debit' ? colors.text : '#2ECC71' },
                      ]}
                    >
                      {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
                {parseResult.transactions.length > 15 && (
                  <Text style={[styles.moreNotice, { color: colors.textSecondary }]}>
                    + {parseResult.transactions.length - 15} more transactions
                  </Text>
                )}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepContent: {
    gap: 14,
    paddingVertical: 10,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cloudIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dropTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dropSub: {
    fontSize: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sampleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingSub: {
    fontSize: 12,
  },
  lockIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  passwordSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E74C3C15',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  previewContainer: {
    gap: 12,
  },
  previewSummaryCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewPeriod: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewAmountsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  previewAmtCol: {
    flex: 1,
  },
  previewAmtLabel: {
    fontSize: 10,
  },
  previewAmtVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  duplicateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#88888833',
  },
  duplicateText: {
    fontSize: 11,
  },
  previewListHeading: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewScrollView: {
    maxHeight: 200,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  previewItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  previewMerchant: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewItemMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  previewItemAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  moreNotice: {
    textAlign: 'center',
    fontSize: 11,
    paddingVertical: 4,
  },
});
