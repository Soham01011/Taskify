import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { CategoryGroup, ExpenseTransaction } from '../../types/expense';

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: CategoryGroup[];
  existingAccounts: string[];
  onAddTransaction: (tx: ExpenseTransaction) => void;
}

export const QuickAddModal: React.FC<Props> = ({
  visible,
  onClose,
  categories,
  existingAccounts,
  onAddTransaction,
}) => {
  const { colors, isDark } = useAppTheme();

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [selectedGroup, setSelectedGroup] = useState('Food & Dining');
  const [selectedSubGroup, setSelectedSubGroup] = useState('Dining Out & Cafes');
  const [account, setAccount] = useState('Saraswat Bank 8847');

  const currentCategoryObj = categories.find((c) => c.name === selectedGroup);
  const availableSubCategories = currentCategoryObj?.subCategories || ['General Outflow'];

  const resetForm = () => {
    setAmount('');
    setMerchant('');
    setType('debit');
    setSelectedGroup('Food & Dining');
    setSelectedSubGroup('Dining Out & Cafes');
    setAccount('Saraswat Bank 8847');
  };

  const handleSubmit = () => {
    const parsedAmt = parseFloat(amount.trim());
    if (!parsedAmt || isNaN(parsedAmt) || parsedAmt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!merchant.trim()) {
      Alert.alert('Merchant Required', 'Please enter a merchant or person name.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const rawDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newTx: ExpenseTransaction = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: dateStr,
      rawDate,
      time: timeStr,
      type,
      counterparty: merchant.trim(),
      amount: parsedAmt,
      refId: `MANUAL${Date.now().toString().slice(-6)}`,
      account: account.trim() || 'Primary Account',
      category: selectedGroup,
      subCategory: selectedSubGroup,
      isManual: true,
      source: 'manual',
      createdAt: Date.now(),
    };

    onAddTransaction(newTx);
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
                <PlusCircle size={18} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Add Transaction</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type selector (Debit / Credit) */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: type === 'debit' ? '#E74C3C' : isDark ? '#171C22' : '#F1F5F9',
                    borderColor: type === 'debit' ? '#E74C3C' : colors.border,
                  },
                ]}
                onPress={() => setType('debit')}
              >
                <ArrowUpRight size={16} color={type === 'debit' ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.typeBtnText, { color: type === 'debit' ? '#FFFFFF' : colors.text }]}>
                  Expense (Debit)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: type === 'credit' ? '#2ECC71' : isDark ? '#171C22' : '#F1F5F9',
                    borderColor: type === 'credit' ? '#2ECC71' : colors.border,
                  },
                ]}
                onPress={() => setType('credit')}
              >
                <ArrowDownLeft size={16} color={type === 'credit' ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.typeBtnText, { color: type === 'credit' ? '#FFFFFF' : colors.text }]}>
                  Income (Credit)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount (₹)</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.text }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.placeholder || colors.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Merchant / Description input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Merchant / Payee Name</Text>
            <View
              style={[
                styles.textInputWrapper,
                { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. Swiggy, Zepto, Landlord, Metro"
                placeholderTextColor={colors.placeholder || colors.textSecondary}
                value={merchant}
                onChangeText={setMerchant}
              />
            </View>

            {/* Bank Account */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bank Account</Text>
            <View
              style={[
                styles.textInputWrapper,
                { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. Saraswat Bank 8847"
                placeholderTextColor={colors.placeholder || colors.textSecondary}
                value={account}
                onChangeText={setAccount}
              />
            </View>

            {/* Category selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category Group</Text>
            <View style={styles.chipsRow}>
              {categories.map((c) => {
                const isSelected = selectedGroup === c.name;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : isDark ? '#171C22' : '#FFFFFF',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedGroup(c.name);
                      if (c.subCategories.length > 0) setSelectedSubGroup(c.subCategories[0]);
                    }}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sub-group selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Sub-group</Text>
            <View style={styles.chipsRow}>
              {availableSubCategories.map((sub) => {
                const isSelected = selectedSubGroup === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[
                      styles.subChip,
                      {
                        backgroundColor: isSelected ? colors.primary + '25' : isDark ? '#171C22' : '#F1F5F9',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedSubGroup(sub)}
                  >
                    <Text style={[styles.subChipText, { color: isSelected ? colors.primary : colors.text }]}>
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Add Transaction</Text>
          </TouchableOpacity>
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
  header: {
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
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 8,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
  },
  textInputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  subChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
