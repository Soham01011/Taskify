import { useAppTheme } from '@/hooks/use-theme';
import { RADIUS, SPACING } from '@/src/constants/theme';
import { useSecureNotes } from '@/src/hooks/useSecureNotes';
import {
  BackupPayload,
  exportAndShareBackup,
  pickBackupFile,
  readAndDecryptBackupFile,
} from '@/src/services/backupService';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { restoreExpenseData } from '@/src/store/slices/expenseSlice';
import {
  AlertCircle,
  CheckSquare,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  HardDrive,
  Lock,
  ShieldCheck,
  Square,
  Upload,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface BackupModalProps {
  visible: boolean;
  onClose: () => void;
  defaultTab?: 'export' | 'import';
  defaultIncludes?: {
    notes?: boolean;
    expenses?: boolean;
  };
}

export const BackupModal: React.FC<BackupModalProps> = ({
  visible,
  onClose,
  defaultTab = 'export',
  defaultIncludes,
}) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();

  // Tab State: 'export' | 'import'
  const [activeTab, setActiveTab] = useState<'export' | 'import'>(defaultTab);

  // Export State
  const [includeNotes, setIncludeNotes] = useState(
    defaultIncludes?.notes ?? true
  );
  const [includeExpenses, setIncludeExpenses] = useState(
    defaultIncludes?.expenses ?? true
  );
  const [exportPassword, setExportPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Import State
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);

  // Data Sources
  const { notes, getAllNotesWithContent, restoreNotes } = useSecureNotes();
  const { transactions, categories, merchantRules } = useAppSelector(
    (state) => state.expense
  );

  // Sync default tab when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab(defaultTab);
      if (defaultIncludes) {
        if (typeof defaultIncludes.notes === 'boolean') {
          setIncludeNotes(defaultIncludes.notes);
        }
        if (typeof defaultIncludes.expenses === 'boolean') {
          setIncludeExpenses(defaultIncludes.expenses);
        }
      }
    }
  }, [visible, defaultTab, defaultIncludes]);

  // Handle Export
  const handleExport = async () => {
    if (!includeNotes && !includeExpenses) {
      Alert.alert('Selection Required', 'Please select at least one dataset to export (Secure Notes or Expense Data).');
      return;
    }

    if (!exportPassword) {
      Alert.alert('Password Required', 'Please create a password to protect your backup file.');
      return;
    }

    if (exportPassword.length < 4) {
      Alert.alert('Password Too Short', 'Backup password must be at least 4 characters long.');
      return;
    }

    if (exportPassword !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please confirm your password correctly.');
      return;
    }

    try {
      setIsExporting(true);

      // 1. Gather Notes data if selected
      let notesData = undefined;
      if (includeNotes) {
        notesData = await getAllNotesWithContent();
      }

      // 2. Gather Expense data if selected
      let expenseData = undefined;
      if (includeExpenses) {
        expenseData = {
          transactions,
          categories,
          merchantRules,
        };
      }

      // 3. Assemble payload
      const payload: BackupPayload = {
        app: 'Taskify',
        version: 1,
        createdAt: Date.now(),
        includes: {
          notes: includeNotes,
          expenses: includeExpenses,
        },
        data: {
          notes: notesData,
          expenses: expenseData,
        },
      };

      // 4. Encrypt and share
      const fileName = await exportAndShareBackup(payload, exportPassword);

      // 5. Reset inputs and inform
      setExportPassword('');
      setConfirmPassword('');
      Alert.alert(
        'Backup Generated!',
        `Your password-protected encrypted backup (${fileName}) has been saved. Store your password safely to restore it on any device.`,
        [{ text: 'Done', onPress: onClose }]
      );
    } catch (err: any) {
      console.error('Export backup failed:', err);
      Alert.alert('Export Failed', err.message || 'Failed to encrypt and export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Picking
  const handlePickFile = async () => {
    try {
      const file = await pickBackupFile();
      if (file) {
        setSelectedFile(file);
      }
    } catch (err: any) {
      Alert.alert('File Selection Failed', err.message || 'Could not select backup file.');
    }
  };

  // Handle Import & Restore
  const handleImport = async () => {
    if (!selectedFile) {
      Alert.alert('File Required', 'Please select an encrypted backup file first.');
      return;
    }

    if (!importPassword) {
      Alert.alert('Password Required', 'Please enter the password used to encrypt this backup.');
      return;
    }

    try {
      setIsImporting(true);

      // 1. Decrypt and validate payload
      const payload = await readAndDecryptBackupFile(selectedFile.uri, importPassword);

      let summaryNotes = 0;
      let summaryExpenses = 0;

      // 2. Restore Notes if present
      if (payload.data.notes && payload.data.notes.length > 0) {
        summaryNotes = await restoreNotes(payload.data.notes, restoreMode);
      }

      // 3. Restore Expenses if present
      if (payload.data.expenses) {
        dispatch(
          restoreExpenseData({
            transactions: payload.data.expenses.transactions || [],
            categories: payload.data.expenses.categories || [],
            merchantRules: payload.data.expenses.merchantRules || [],
            mode: restoreMode,
          })
        );
        summaryExpenses = payload.data.expenses.transactions?.length || 0;
      }

      // 4. Reset & Notify
      setImportPassword('');
      setSelectedFile(null);

      const itemsSummary: string[] = [];
      if (summaryNotes > 0) itemsSummary.push(`${summaryNotes} note(s)`);
      if (summaryExpenses > 0) itemsSummary.push(`${summaryExpenses} transaction(s)`);
      if (itemsSummary.length === 0) itemsSummary.push('settings and metadata');

      Alert.alert(
        'Data Restored Successfully!',
        `Successfully restored ${itemsSummary.join(' and ')} in ${restoreMode === 'merge' ? 'merge' : 'overwrite'} mode.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err: any) {
      console.error('Import failed:', err);
      Alert.alert('Decryption Failed', err.message || 'Incorrect password or invalid file.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={modalStyles.overlay}
      >
        <View style={[modalStyles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[modalStyles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={modalStyles.headerTitleBlock}>
              <ShieldCheck size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[modalStyles.headerTitle, { color: colors.text }]}>
                Encrypted Backup & Transfer
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[modalStyles.closeBtn, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={[modalStyles.tabBar, { backgroundColor: isDark ? '#161A20' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                modalStyles.tabBtn,
                activeTab === 'export' && [modalStyles.activeTabBtn, { backgroundColor: colors.card }],
              ]}
              onPress={() => setActiveTab('export')}
              activeOpacity={0.7}
            >
              <Upload size={14} color={activeTab === 'export' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  modalStyles.tabBtnText,
                  { color: activeTab === 'export' ? colors.primary : colors.textSecondary },
                ]}
              >
                Export & Backup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                modalStyles.tabBtn,
                activeTab === 'import' && [modalStyles.activeTabBtn, { backgroundColor: colors.card }],
              ]}
              onPress={() => setActiveTab('import')}
              activeOpacity={0.7}
            >
              <Download size={14} color={activeTab === 'import' ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  modalStyles.tabBtnText,
                  { color: activeTab === 'import' ? colors.primary : colors.textSecondary },
                ]}
              >
                Import & Restore
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content Scroll */}
          <ScrollView
            style={modalStyles.scrollBody}
            contentContainerStyle={modalStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'export' ? (
              /* ================= EXPORT TAB ================= */
              <View style={modalStyles.tabSection}>
                <Text style={[modalStyles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Export your local encrypted data into a portable AES-256 sealed file. You can transfer it to another device securely.
                </Text>

                {/* Choose Datasets */}
                <Text style={[modalStyles.fieldLabel, { color: colors.text }]}>
                  Select Data to Include
                </Text>

                {/* Secure Notes Option */}
                <TouchableOpacity
                  style={[
                    modalStyles.selectionCard,
                    {
                      backgroundColor: isDark ? '#1C2128' : '#F8FAFC',
                      borderColor: includeNotes ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setIncludeNotes(!includeNotes)}
                  activeOpacity={0.7}
                >
                  <View style={modalStyles.selectionIconBox}>
                    {includeNotes ? (
                      <CheckSquare size={20} color={colors.primary} />
                    ) : (
                      <Square size={20} color={colors.textSecondary} />
                    )}
                  </View>
                  <View style={modalStyles.selectionInfo}>
                    <View style={modalStyles.selectionTitleRow}>
                      <FileText size={15} color={colors.text} style={{ marginRight: 6 }} />
                      <Text style={[modalStyles.selectionTitle, { color: colors.text }]}>
                        Secure Notes
                      </Text>
                      <View style={[modalStyles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[modalStyles.badgeText, { color: colors.primary }]}>
                          {notes.length} note{notes.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[modalStyles.selectionDescription, { color: colors.textSecondary }]}>
                      All metadata and biometric-locked note bodies stored in secure storage.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Expenses Option */}
                <TouchableOpacity
                  style={[
                    modalStyles.selectionCard,
                    {
                      backgroundColor: isDark ? '#1C2128' : '#F8FAFC',
                      borderColor: includeExpenses ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setIncludeExpenses(!includeExpenses)}
                  activeOpacity={0.7}
                >
                  <View style={modalStyles.selectionIconBox}>
                    {includeExpenses ? (
                      <CheckSquare size={20} color={colors.primary} />
                    ) : (
                      <Square size={20} color={colors.textSecondary} />
                    )}
                  </View>
                  <View style={modalStyles.selectionInfo}>
                    <View style={modalStyles.selectionTitleRow}>
                      <DollarSign size={15} color={colors.text} style={{ marginRight: 6 }} />
                      <Text style={[modalStyles.selectionTitle, { color: colors.text }]}>
                        Expense & Spend Data
                      </Text>
                      <View style={[modalStyles.badge, { backgroundColor: '#2ECC7120' }]}>
                        <Text style={[modalStyles.badgeText, { color: '#2ECC71' }]}>
                          {transactions.length} txs, {categories.length} groups
                        </Text>
                      </View>
                    </View>
                    <Text style={[modalStyles.selectionDescription, { color: colors.textSecondary }]}>
                      Parsed statements, custom category groups, and automated merchant rules.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Password Protection */}
                <Text style={[modalStyles.fieldLabel, { color: colors.text, marginTop: SPACING.md }]}>
                  Set Backup Password
                </Text>
                <View style={[modalStyles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Lock size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[modalStyles.textInput, { color: colors.text }]}
                    placeholder="Enter a strong password (min 4 chars)"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showExportPassword}
                    value={exportPassword}
                    onChangeText={setExportPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowExportPassword(!showExportPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showExportPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={[modalStyles.fieldLabel, { color: colors.text, marginTop: SPACING.sm }]}>
                  Confirm Password
                </Text>
                <View style={[modalStyles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Lock size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[modalStyles.textInput, { color: colors.text }]}
                    placeholder="Confirm backup password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showExportPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                </View>

                {/* Security Advisory */}
                <View style={[modalStyles.noticeBox, { backgroundColor: isDark ? '#1C2128' : '#F1F5F9' }]}>
                  <AlertCircle size={15} color={colors.primary} style={{ marginTop: 2, marginRight: 8 }} />
                  <Text style={[modalStyles.noticeText, { color: colors.textSecondary }]}>
                    Zero-knowledge encryption. Your password derives the AES key and is never stored in plaintext. If you lose this password, this backup file cannot be recovered.
                  </Text>
                </View>

                {/* Export Button */}
                <TouchableOpacity
                  style={[
                    modalStyles.primaryActionBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: isExporting || (!includeNotes && !includeExpenses) || !exportPassword ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleExport}
                  disabled={isExporting || (!includeNotes && !includeExpenses) || !exportPassword}
                  activeOpacity={0.8}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Upload size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={modalStyles.primaryActionText}>Export & Share Backup</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* ================= IMPORT TAB ================= */
              <View style={modalStyles.tabSection}>
                <Text style={[modalStyles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Restore your local notes and expense data from an encrypted backup file created on this or another device.
                </Text>

                {/* Step 1: Select File */}
                <Text style={[modalStyles.fieldLabel, { color: colors.text }]}>
                  Step 1: Select Backup File (.taskbackup)
                </Text>

                {selectedFile ? (
                  <View
                    style={[
                      modalStyles.fileSelectedCard,
                      { backgroundColor: isDark ? '#1C2128' : '#F8FAFC', borderColor: colors.primary },
                    ]}
                  >
                    <FileCheck size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.fileNameText, { color: colors.text }]} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      {selectedFile.size ? (
                        <Text style={[modalStyles.fileSizeText, { color: colors.textSecondary }]}>
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={handlePickFile}
                      style={[modalStyles.changeFileBtn, { backgroundColor: colors.primary + '18' }]}
                    >
                      <Text style={[modalStyles.changeFileText, { color: colors.primary }]}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      modalStyles.filePickerBtn,
                      { backgroundColor: isDark ? '#1C2128' : '#F8FAFC', borderColor: colors.border },
                    ]}
                    onPress={handlePickFile}
                    activeOpacity={0.7}
                  >
                    <HardDrive size={22} color={colors.primary} style={{ marginBottom: 6 }} />
                    <Text style={[modalStyles.filePickerTitle, { color: colors.text }]}>
                      Choose Backup File
                    </Text>
                    <Text style={[modalStyles.filePickerSub, { color: colors.textSecondary }]}>
                      Tap to select a .taskbackup or .dat file
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Step 2: Password */}
                <Text style={[modalStyles.fieldLabel, { color: colors.text, marginTop: SPACING.md }]}>
                  Step 2: Enter Backup Password
                </Text>
                <View style={[modalStyles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Lock size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[modalStyles.textInput, { color: colors.text }]}
                    placeholder="Password used to encrypt this backup"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showImportPassword}
                    value={importPassword}
                    onChangeText={setImportPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowImportPassword(!showImportPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showImportPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Step 3: Restore Mode */}
                <Text style={[modalStyles.fieldLabel, { color: colors.text, marginTop: SPACING.md }]}>
                  Step 3: Restore Strategy
                </Text>
                <View style={modalStyles.modeRow}>
                  <TouchableOpacity
                    style={[
                      modalStyles.modeCard,
                      {
                        backgroundColor: isDark ? '#1C2128' : '#F8FAFC',
                        borderColor: restoreMode === 'merge' ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRestoreMode('merge')}
                    activeOpacity={0.7}
                  >
                    <Text style={[modalStyles.modeTitle, { color: colors.text }]}>Merge</Text>
                    <Text style={[modalStyles.modeDesc, { color: colors.textSecondary }]}>
                      Keep existing data and add imported items without duplicates.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      modalStyles.modeCard,
                      {
                        backgroundColor: isDark ? '#1C2128' : '#F8FAFC',
                        borderColor: restoreMode === 'replace' ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRestoreMode('replace')}
                    activeOpacity={0.7}
                  >
                    <Text style={[modalStyles.modeTitle, { color: colors.text }]}>Replace</Text>
                    <Text style={[modalStyles.modeDesc, { color: colors.textSecondary }]}>
                      Overwrite existing data completely with this backup.
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Import Button */}
                <TouchableOpacity
                  style={[
                    modalStyles.primaryActionBtn,
                    {
                      backgroundColor: colors.primary,
                      marginTop: SPACING.lg,
                      opacity: isImporting || !selectedFile || !importPassword ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleImport}
                  disabled={isImporting || !selectedFile || !importPassword}
                  activeOpacity={0.8}
                >
                  {isImporting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Download size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={modalStyles.primaryActionText}>Decrypt & Restore Data</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: RADIUS.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.md - 2,
    gap: 6,
  },
  activeTabBtn: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollBody: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
  },
  tabSection: {
    gap: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  selectionIconBox: {
    marginRight: 10,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: RADIUS.md,
    marginTop: 4,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  filePickerBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  filePickerSub: {
    fontSize: 12,
  },
  fileSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSizeText: {
    fontSize: 12,
    marginTop: 2,
  },
  changeFileBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
  },
  changeFileText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});

