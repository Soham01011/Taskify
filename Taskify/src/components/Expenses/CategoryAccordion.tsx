import { styles } from '@/assets/styles/catagoryAccordon.styles';
import { useAppTheme } from '@/hooks/use-theme';
import {
  AlertCircle,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FolderPlus,
  Pencil,
  Plus,
  Receipt,
  Tag,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { CategoryBreakdown, CategoryGroup, ExpenseTransaction } from '../../types/expense';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  categories: CategoryBreakdown[];
  uncategorizedCount: number;
  uncategorizedTotal: number;
  onReviewUncategorized: () => void;
  onCreateGroup: () => void;
  onEditGroup: (group: CategoryGroup) => void;
  onSelectTransaction?: (tx: ExpenseTransaction) => void;
}

export const CategoryAccordion: React.FC<Props> = ({
  categories,
  uncategorizedCount,
  uncategorizedTotal,
  onReviewUncategorized,
  onCreateGroup,
  onEditGroup,
  onSelectTransaction,
}) => {
  const { colors, isDark } = useAppTheme();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedSubGroups, setExpandedSubGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const toggleSubGroup = (groupId: string, subName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const key = `${groupId}:::${subName}`;
    setExpandedSubGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>Groups</Text>
          <View style={[styles.groupBadge, { backgroundColor: isDark ? '#262A30' : '#E2E8F0' }]}>
            <Text style={[styles.groupBadgeText, { color: colors.textSecondary }]}>
              {categories.length} {categories.length === 1 ? 'Group' : 'Groups'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createGroupBtn, { backgroundColor: colors.primary + '18' }]}
          onPress={onCreateGroup}
          activeOpacity={0.7}
        >
          <Plus size={14} color={colors.primary} />
          <Text style={[styles.createGroupText, { color: colors.primary }]}>Create Group</Text>
        </TouchableOpacity>
      </View>

      {/* Uncategorized Warning Pill if any */}
      {uncategorizedCount > 0 && (
        <View
          style={[
            styles.uncategorizedCard,
            { backgroundColor: isDark ? '#261F18' : '#FFF7ED', borderColor: '#FF7A0040' },
          ]}
        >
          <View style={styles.uncategorizedLeft}>
            <View style={[styles.alertIconBox, { backgroundColor: '#FF7A0025' }]}>
              <AlertCircle size={18} color="#FF7A00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.uncategorizedTitle, { color: colors.text }]}>
                {uncategorizedCount} Uncategorized {uncategorizedCount === 1 ? 'Payment' : 'Payments'}
              </Text>
              <Text style={[styles.uncategorizedSub, { color: colors.textSecondary }]}>
                ₹{uncategorizedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} • Tap to organize into groups
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: colors.primary }]}
            onPress={onReviewUncategorized}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewBtnText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State when user hasn't created any groups yet */}
      {categories.length === 0 && (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '15' }]}>
            <FolderPlus size={24} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Custom Groups Yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Create your own groups (e.g. Food, Subscriptions, Rent) to auto-categorize and organize your transactions!
          </Text>
          <TouchableOpacity
            style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
            onPress={onCreateGroup}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>Create First Group</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Groups Accordion */}
      <View style={styles.groupList}>
        {categories.map((catItem) => {
          const isExpanded = !!expandedGroups[catItem.category.name];
          const groupColor = catItem.category.color || colors.primary;

          return (
            <View
              key={catItem.category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Accordion Summary Header */}
              <TouchableOpacity
                style={styles.summaryHeader}
                onPress={() => toggleGroup(catItem.category.name)}
                activeOpacity={0.7}
              >
                <View style={styles.summaryLeft}>
                  <View style={[styles.categoryIconBox, { backgroundColor: groupColor + '20' }]}>
                    <Tag size={18} color={groupColor} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {catItem.category.name}
                    </Text>
                    <Text style={[styles.categoryTxCount, { color: colors.textSecondary }]}>
                      {catItem.txCount} transactions logged
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryRight}>
                  <View style={styles.amountBox}>
                    <Text style={[styles.categoryAmount, { color: colors.text }]}>
                      ₹{catItem.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.categoryPercent, { color: colors.textSecondary }]}>
                      {catItem.percentageOfTotal}% of total
                    </Text>
                  </View>

                  {/* Edit group button */}
                  <TouchableOpacity
                    style={[styles.editIconBtn, { backgroundColor: isDark ? '#262A30' : '#F1F5F9' }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      onEditGroup(catItem.category);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Pencil size={13} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {isExpanded ? (
                    <ChevronUp size={18} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Sub-groups Content */}
              {isExpanded && (
                <View style={[styles.subGroupContainer, { borderTopColor: colors.border }]}>
                  {catItem.subGroups.map((sub, sIdx) => {
                    const subKey = `${catItem.category.id}:::${sub.name}`;
                    const isSubExpanded = !!expandedSubGroups[subKey];
                    const txCount = sub.transactions ? sub.transactions.length : sub.txCount;

                    return (
                      <View key={sub.name || sIdx} style={styles.subGroupBlock}>
                        {/* Interactive Sub-Group Header */}
                        <TouchableOpacity
                          style={[
                            styles.subGroupRow,
                            {
                              backgroundColor: isSubExpanded
                                ? (isDark ? '#1C222B' : '#EFF6FF')
                                : (isDark ? '#171C22' : '#F8FAFC'),
                              borderColor: isSubExpanded ? colors.primary + '40' : 'transparent',
                              borderWidth: 1,
                            },
                          ]}
                          onPress={() => toggleSubGroup(catItem.category.id, sub.name)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subLeft}>
                            <View style={[styles.subDot, { backgroundColor: groupColor }]} />
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <View style={styles.subTitleRow}>
                                <Text style={[styles.subName, { color: colors.text }]}>
                                  {sub.name}
                                </Text>
                                <View
                                  style={[
                                    styles.subTxCountBadge,
                                    { backgroundColor: isDark ? '#262A30' : '#E2E8F0' },
                                  ]}
                                >
                                  <Text style={[styles.subTxCountText, { color: colors.textSecondary }]}>
                                    {txCount} {txCount === 1 ? 'txn' : 'txns'}
                                  </Text>
                                </View>
                              </View>
                              {sub.merchants.length > 0 ? (
                                <Text
                                  style={[styles.subMerchants, { color: colors.textSecondary }]}
                                  numberOfLines={1}
                                >
                                  {sub.merchants.join(', ')}
                                </Text>
                              ) : (
                                <Text style={[styles.subTapHint, { color: colors.primary }]}>
                                  Tap to {isSubExpanded ? 'hide' : 'view'} transactions
                                </Text>
                              )}
                            </View>
                          </View>

                          <View style={styles.subRight}>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={[styles.subAmount, { color: colors.text }]}>
                                ₹{sub.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </Text>
                              <Text style={[styles.subPercent, { color: colors.textSecondary }]}>
                                {sub.percentageOfGroup}%
                              </Text>
                            </View>
                            {isSubExpanded ? (
                              <ChevronUp size={16} color={colors.primary} style={{ marginLeft: 6 }} />
                            ) : (
                              <ChevronDown size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Transactions in this Sub-Group */}
                        {isSubExpanded && (
                          <View style={[styles.subTxList, { borderLeftColor: groupColor + '40' }]}>
                            {sub.transactions && sub.transactions.length > 0 ? (
                              sub.transactions.map((tx) => {
                                const isCredit = tx.type === 'credit';
                                return (
                                  <TouchableOpacity
                                    key={tx.id}
                                    style={[
                                      styles.subTxItem,
                                      {
                                        backgroundColor: isDark ? '#1C222B' : '#FFFFFF',
                                        borderColor: colors.border,
                                      },
                                    ]}
                                    onPress={() => onSelectTransaction?.(tx)}
                                    activeOpacity={0.7}
                                  >
                                    <View style={styles.subTxLeft}>
                                      <View
                                        style={[
                                          styles.subTxTypeIcon,
                                          {
                                            backgroundColor: isCredit
                                              ? '#2ECC7118'
                                              : isDark
                                                ? '#262A30'
                                                : '#E2E8F0',
                                          },
                                        ]}
                                      >
                                        {isCredit ? (
                                          <ArrowDownLeft size={13} color="#2ECC71" />
                                        ) : (
                                          <Receipt size={13} color={colors.textSecondary} />
                                        )}
                                      </View>
                                      <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text
                                          style={[styles.subTxMerchant, { color: colors.text }]}
                                          numberOfLines={1}
                                        >
                                          {tx.counterparty}
                                        </Text>
                                        <Text style={[styles.subTxMeta, { color: colors.textSecondary }]}>
                                          {tx.rawDate || tx.date}
                                          {tx.account ? ` • ${tx.account}` : ''}
                                        </Text>
                                      </View>
                                    </View>

                                    <View style={styles.subTxRight}>
                                      <Text
                                        style={[
                                          styles.subTxAmount,
                                          { color: isCredit ? '#2ECC71' : colors.text },
                                        ]}
                                      >
                                        {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                      </Text>
                                      <ChevronRight size={13} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                                    </View>
                                  </TouchableOpacity>
                                );
                              })
                            ) : (
                              <View
                                style={[
                                  styles.emptySubTxBox,
                                  { backgroundColor: isDark ? '#171C22' : '#F1F5F9' },
                                ]}
                              >
                                <Text style={[styles.emptySubTxText, { color: colors.textSecondary }]}>
                                  No transactions logged in {sub.name} for this period
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {catItem.subGroups.length === 0 && (
                    <Text style={[styles.emptySubNote, { color: colors.textSecondary }]}>
                      No transactions in this group yet. Tap any transaction below or map merchants to assign!
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};


