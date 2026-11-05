import { styles } from "@/assets/styles/recatagorizeModal.styles";
import { useAppTheme } from '@/hooks/use-theme';
import {
  Calendar,
  Check,
  CreditCard,
  Edit3,
  Hash,
  Plus,
  Trash2,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
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
  onRequestCreateGroup?: () => void;
}

export const RecategorizeModal: React.FC<Props> = ({
  visible,
  transaction,
  categories,
  onClose,
  onSave,
  onDelete,
  onRequestCreateGroup,
}) => {
  const { colors, isDark } = useAppTheme();

  const [selectedGroup, setSelectedGroup] = useState<string>('Uncategorized');
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>('General');
  const [customSubInput, setCustomSubInput] = useState<string>('');
  const [showAddSub, setShowAddSub] = useState<boolean>(false);
  const [applyToMerchant, setApplyToMerchant] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setSelectedGroup(transaction.category || 'Uncategorized');
      setSelectedSubGroup(transaction.subCategory || 'General');
      setApplyToMerchant(false);
      setShowAddSub(false);
      setCustomSubInput('');
    }
  }, [transaction, visible]);

  if (!transaction) return null;

  const currentCategoryObj = categories.find((c) => c.name === selectedGroup);
  const availableSubCategories = currentCategoryObj?.subCategories || ['General'];

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    const cat = categories.find((c) => c.name === groupName);
    if (cat && cat.subCategories.length > 0) {
      setSelectedSubGroup(cat.subCategories[0]);
    } else {
      setSelectedSubGroup('General');
    }
  };

  const handleAddCustomSub = () => {
    const clean = customSubInput.trim();
    if (clean) {
      setSelectedSubGroup(clean);
      setCustomSubInput('');
      setShowAddSub(false);
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
                Move / Recategorize
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

            {/* Destination Group Selector */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Select Destination Group
              </Text>
              {onRequestCreateGroup && (
                <TouchableOpacity
                  style={styles.createGroupLink}
                  onPress={() => {
                    onClose();
                    onRequestCreateGroup();
                  }}
                >
                  <Plus size={13} color={colors.primary} />
                  <Text style={[styles.createGroupLinkText, { color: colors.primary }]}>
                    New Group
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.groupChipsContainer}>
              {/* Uncategorized Option */}
              <TouchableOpacity
                style={[
                  styles.groupChip,
                  {
                    backgroundColor:
                      selectedGroup === 'Uncategorized'
                        ? '#FF7A0020'
                        : isDark
                          ? '#171C22'
                          : '#FFFFFF',
                    borderColor: selectedGroup === 'Uncategorized' ? '#FF7A00' : colors.border,
                  },
                ]}
                onPress={() => handleGroupSelect('Uncategorized')}
                activeOpacity={0.7}
              >
                <View style={[styles.dot, { backgroundColor: '#FF7A00' }]} />
                <Text
                  style={[
                    styles.groupChipText,
                    {
                      color: selectedGroup === 'Uncategorized' ? '#FF7A00' : colors.text,
                      fontWeight: selectedGroup === 'Uncategorized' ? '700' : '500',
                    },
                  ]}
                >
                  Uncategorized
                </Text>
              </TouchableOpacity>

              {/* User-created groups */}
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

            {/* Sub-group Selector */}
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
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                            ? '#171C22'
                            : '#F1F5F9',
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

              {/* Add custom sub-group button/input */}
              {!showAddSub ? (
                <TouchableOpacity
                  style={[
                    styles.addSubChipBtn,
                    { borderColor: colors.border, backgroundColor: isDark ? '#171C22' : '#FFFFFF' },
                  ]}
                  onPress={() => setShowAddSub(true)}
                >
                  <Plus size={12} color={colors.primary} />
                  <Text style={[styles.addSubChipText, { color: colors.primary }]}>
                    + Add Sub-group
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.customSubRow}>
                  <TextInput
                    style={[
                      styles.customSubInput,
                      { color: colors.text, borderColor: colors.primary, backgroundColor: isDark ? '#171C22' : '#FFFFFF' },
                    ]}
                    placeholder="New sub-group name"
                    placeholderTextColor={colors.placeholder || colors.textSecondary}
                    value={customSubInput}
                    onChangeText={setCustomSubInput}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.customSubSaveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleAddCustomSub}
                  >
                    <Check size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Apply to All Transactions From This Merchant Switch */}
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
                  Map "{transaction.counterparty}" to this group so all current & future transactions move automatically. Leave off to move just this single payment.
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
              accessibilityLabel="Delete transaction"
            >
              <Trash2 size={16} color="#E74C3C" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save & Move</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

