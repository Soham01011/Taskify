import React, { useEffect, useState } from 'react';
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
  FolderPlus,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { PRESET_GROUP_COLORS } from '../../constants/expenseCategories';
import { CategoryGroup } from '../../types/expense';

interface Props {
  visible: boolean;
  groupToEdit: CategoryGroup | null; // null means creating a new group
  uncategorizedMerchants: { name: string; count: number }[];
  onClose: () => void;
  onSave: (
    name: string,
    color: string,
    icon?: string,
    subCategories?: string[],
    merchants?: string[]
  ) => void;
  onDelete?: (groupId: string) => void;
}

export const GroupManagerModal: React.FC<Props> = ({
  visible,
  groupToEdit,
  uncategorizedMerchants,
  onClose,
  onSave,
  onDelete,
}) => {
  const { colors, isDark } = useAppTheme();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_GROUP_COLORS[0]);
  const [subCategories, setSubCategories] = useState<string[]>(['General']);
  const [newSubInput, setNewSubInput] = useState('');
  const [merchants, setMerchants] = useState<string[]>([]);
  const [newMerchantInput, setNewMerchantInput] = useState('');

  const isEditing = !!groupToEdit;

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setSelectedColor(groupToEdit.color || PRESET_GROUP_COLORS[0]);
      setSubCategories(
        groupToEdit.subCategories && groupToEdit.subCategories.length > 0
          ? [...groupToEdit.subCategories]
          : ['General']
      );
      setMerchants(groupToEdit.merchants ? [...groupToEdit.merchants] : []);
    } else {
      setName('');
      setSelectedColor(PRESET_GROUP_COLORS[0]);
      setSubCategories(['General']);
      setMerchants([]);
    }
    setNewSubInput('');
    setNewMerchantInput('');
  }, [groupToEdit, visible]);

  const handleAddSubCategory = () => {
    const clean = newSubInput.trim();
    if (!clean) return;
    if (subCategories.includes(clean)) {
      Alert.alert('Duplicate Sub-group', 'This sub-group already exists in this group.');
      return;
    }
    setSubCategories([...subCategories, clean]);
    setNewSubInput('');
  };

  const handleRemoveSubCategory = (subToRemove: string) => {
    if (subCategories.length <= 1) {
      Alert.alert('Required', 'A group must have at least one sub-group (e.g. General).');
      return;
    }
    setSubCategories(subCategories.filter((s) => s !== subToRemove));
  };

  const handleAddMerchant = (merchantName: string) => {
    const clean = merchantName.trim().toLowerCase();
    if (!clean) return;
    if (merchants.includes(clean)) return;
    setMerchants([...merchants, clean]);
    setNewMerchantInput('');
  };

  const handleRemoveMerchant = (merchantToRemove: string) => {
    setMerchants(merchants.filter((m) => m !== merchantToRemove));
  };

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert('Group Name Required', 'Please enter a name for your group (e.g. Food, Subscriptions, Rent).');
      return;
    }

    onSave(
      cleanName,
      selectedColor,
      'Tag',
      subCategories,
      merchants
    );
    onClose();
  };

  const handleDelete = () => {
    if (!groupToEdit || !onDelete) return;
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupToEdit.name}"? Transactions in this group will be moved back to Uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(groupToEdit.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: selectedColor + '20' }]}>
                <FolderPlus size={18} color={selectedColor} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEditing ? 'Edit Category Group' : 'Create Category Group'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Group Name Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Group Name</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <Tag size={16} color={selectedColor} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. Food & Dining, Rent & Bills, Travel"
                placeholderTextColor={colors.placeholder || colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoFocus={!isEditing}
              />
            </View>

            {/* Color Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Theme Color</Text>
            <View style={styles.colorRow}>
              {PRESET_GROUP_COLORS.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: col,
                        borderColor: isSelected ? colors.text : 'transparent',
                        transform: [{ scale: isSelected ? 1.2 : 1 }],
                      },
                    ]}
                    onPress={() => setSelectedColor(col)}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>

            {/* Sub-groups Manager */}
            <View style={styles.subGroupsHeader}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
                Sub-groups
              </Text>
              <Text style={[styles.subHint, { color: colors.textSecondary }]}>
                Organize within this group
              </Text>
            </View>

            <View style={styles.subPillsRow}>
              {subCategories.map((sub) => (
                <View
                  key={sub}
                  style={[
                    styles.subPill,
                    { backgroundColor: isDark ? '#171C22' : '#F1F5F9', borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.subPillText, { color: colors.text }]}>{sub}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSubCategory(sub)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={12} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add Sub-group Input */}
            <View style={styles.addInlineRow}>
              <View
                style={[
                  styles.inlineInputWrapper,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.inlineInput, { color: colors.text }]}
                  placeholder="New sub-group name..."
                  placeholderTextColor={colors.placeholder || colors.textSecondary}
                  value={newSubInput}
                  onChangeText={setNewSubInput}
                  onSubmitEditing={handleAddSubCategory}
                />
              </View>
              <TouchableOpacity
                style={[styles.addInlineBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddSubCategory}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Mapped Merchants Section */}
            <View style={styles.subGroupsHeader}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
                Auto-assigned Merchants
              </Text>
              <Text style={[styles.subHint, { color: colors.textSecondary }]}>
                Keyword match for statement uploads
              </Text>
            </View>

            <View style={styles.subPillsRow}>
              {merchants.map((m) => (
                <View
                  key={m}
                  style={[
                    styles.merchantPill,
                    { backgroundColor: selectedColor + '18', borderColor: selectedColor + '40' },
                  ]}
                >
                  <Text style={[styles.merchantPillText, { color: selectedColor }]}>{m}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveMerchant(m)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={12} color={selectedColor} />
                  </TouchableOpacity>
                </View>
              ))}
              {merchants.length === 0 && (
                <Text style={[styles.emptyMerchantNote, { color: colors.textSecondary }]}>
                  No merchants mapped yet. Any added merchant will auto-categorize transactions!
                </Text>
              )}
            </View>

            {/* Add Merchant Input */}
            <View style={styles.addInlineRow}>
              <View
                style={[
                  styles.inlineInputWrapper,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.inlineInput, { color: colors.text }]}
                  placeholder="Enter merchant name (e.g. Zepto, Swiggy)..."
                  placeholderTextColor={colors.placeholder || colors.textSecondary}
                  value={newMerchantInput}
                  onChangeText={setNewMerchantInput}
                  onSubmitEditing={() => handleAddMerchant(newMerchantInput)}
                />
              </View>
              <TouchableOpacity
                style={[styles.addInlineBtn, { backgroundColor: selectedColor }]}
                onPress={() => handleAddMerchant(newMerchantInput)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Unassigned Merchants Quick Suggestions */}
            {uncategorizedMerchants && uncategorizedMerchants.length > 0 && (
              <View style={styles.suggestionBlock}>
                <Text style={[styles.suggestionTitle, { color: colors.textSecondary }]}>
                  Suggestions from your statement (tap to add):
                </Text>
                <View style={styles.suggestionChips}>
                  {uncategorizedMerchants.slice(0, 8).map((um) => {
                    const alreadyAdded = merchants.includes(um.name.toLowerCase());
                    if (alreadyAdded) return null;
                    return (
                      <TouchableOpacity
                        key={um.name}
                        style={[
                          styles.suggestionChip,
                          {
                            backgroundColor: isDark ? '#171C22' : '#F8FAFC',
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => handleAddMerchant(um.name)}
                        activeOpacity={0.7}
                      >
                        <Plus size={11} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.suggestionChipText, { color: colors.text }]}>
                          {um.name} ({um.count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            {isEditing && (
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: '#E74C3C40' }]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color="#E74C3C" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: selectedColor }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Save Changes' : 'Create Group'}
              </Text>
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
    marginBottom: 12,
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
  scrollContent: {
    paddingVertical: 6,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
  },
  subGroupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 10,
    marginBottom: 4,
  },
  subHint: {
    fontSize: 10,
  },
  subPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 28,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  merchantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  merchantPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyMerchantNote: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 2,
  },
  addInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  inlineInputWrapper: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  inlineInput: {
    fontSize: 13,
  },
  addInlineBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionBlock: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#88888830',
  },
  suggestionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C15',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
