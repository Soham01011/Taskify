import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Calendar,
  Check,
  CreditCard,
  Edit3,
  Hash,
  Trash2,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { CategoryGroup, ExpenseTransaction } from '../../types/expense';

interface Props {
  visible: boolean;
  transaction: ExpenseTransaction | null;
  categories: CategoryGroup[];
  onClose: () => void;
  onSave: (
    id: string,
    category: string,
    subCategory: string,
    applyToMerchant: boolean,
    merchantName: string
  ) => void;
  onDelete: (id: string) => void;
}

export const RecategorizeModal: React.FC<Props> = ({
  visible,
  transaction,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const { colors, isDark } = useAppTheme();

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>('');
  const [applyToMerchant, setApplyToMerchant] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setSelectedGroup(transaction.category || 'Uncategorized');
      setSelectedSubGroup(transaction.subCategory || 'General Outflow');
      setApplyToMerchant(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const currentCategoryObj = categories.find((c) => c.name === selectedGroup);
  const availableSubCategories = currentCategoryObj?.subCategories || ['General Outflow'];

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    const cat = categories.find((c) => c.name === groupName);
    if (cat && cat.subCategories.length > 0) {
      setSelectedSubGroup(cat.subCategories[0]);
    } else {
      setSelectedSubGroup('General Outflow');
    }
  };

  const handleSave = () => {
    onSave(
      transaction.id,
      selectedGroup,
      selectedSubGroup,
      applyToMerchant,
      transaction.counterparty
    );
    onClose();
  };

  const handleDelete = () => {
    onDelete(transaction.id);
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
                <Edit3 size={18} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Recategorize Transaction
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Transaction Details Pill */}
            <View
              style={[
                styles.detailsBox,
                { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <View style={styles.detailTop}>
                <Text style={[styles.merchantName, { color: colors.text }]} numberOfLines={2}>
                  {transaction.counterparty}
                </Text>
                <Text
                  style={[
                    styles.amountText,
                    { color: transaction.type === 'debit' ? colors.text : '#2ECC71' },
                  ]}
                >
                  {transaction.type === 'debit' ? '-' : '+'}₹
                  {transaction.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.detailMetaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {transaction.rawDate || transaction.date} • {transaction.time}
                  </Text>
                </View>
                {transaction.account ? (
                  <View style={styles.metaItem}>
                    <CreditCard size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {transaction.account}
                    </Text>
                  </View>
                ) : null}
              </View>

              {transaction.refId ? (
                <View style={styles.metaItem}>
                  <Hash size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Ref: {transaction.refId}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 1. Primary Category Group Selector */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              Select Category Group
            </Text>
            <View style={styles.groupChipsContainer}>
              {categories.map((cat) => {
                const isSelected = selectedGroup === cat.name;
                const catColor = cat.color || colors.primary;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.groupChip,
                      {
                        backgroundColor: isSelected
                          ? catColor + '20'
                          : isDark
                          ? '#171C22'
                          : '#FFFFFF',
                        borderColor: isSelected ? catColor : colors.border,
                      },
                    ]}
                    onPress={() => handleGroupSelect(cat.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.dot, { backgroundColor: catColor }]} />
                    <Text
                      style={[
                        styles.groupChipText,
                        {
                          color: isSelected ? catColor : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Sub-group Selector */}
            <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 14 }]}>
              Select Sub-group
            </Text>
            <View style={styles.subChipsContainer}>
              {availableSubCategories.map((sub) => {
                const isSelected = selectedSubGroup === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[
                      styles.subChip,
                      {
                        backgroundColor: isSelected ? colors.primary : isDark ? '#171C22' : '#F1F5F9',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedSubGroup(sub)}
                    activeOpacity={0.7}
                  >
                    {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                    <Text
                      style={[
                        styles.subChipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Apply to All Transactions From This Merchant Switch */}
            <View
              style={[
                styles.switchCard,
                { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>
                  Apply to all from this merchant
                </Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  Automatically recategorize all current & future transactions for "{transaction.counterparty}". Leave off to recategorize just this one payment.
                </Text>
              </View>
              <Switch
                value={applyToMerchant}
                onValueChange={setApplyToMerchant}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.deleteBtn, { borderColor: '#E74C3C40' }]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#E74C3C" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Category</Text>
            </TouchableOpacity>
          </View>
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
  detailsBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 6,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  groupChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  groupChipText: {
    fontSize: 12,
  },
  subChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  subChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
  },
  deleteBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C15',
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
