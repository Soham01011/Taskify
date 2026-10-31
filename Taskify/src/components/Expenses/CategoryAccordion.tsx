import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import {
  AlertCircle,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  HelpCircle,
  ShoppingBag,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { CategoryBreakdown } from '../../types/expense';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  categories: CategoryBreakdown[];
  uncategorizedCount: number;
  uncategorizedTotal: number;
  onReviewUncategorized: () => void;
  onSelectCategoryFilter?: (categoryName: string) => void;
}

const getGroupIcon = (name: string, size = 18, color = '#FFF') => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('food')) return <Utensils size={size} color={color} />;
  if (lower.includes('fixed') || lower.includes('bill') || lower.includes('subscription'))
    return <Calendar size={size} color={color} />;
  if (lower.includes('transport') || lower.includes('commute'))
    return <Car size={size} color={color} />;
  if (lower.includes('shopping') || lower.includes('lifestyle'))
    return <ShoppingBag size={size} color={color} />;
  if (lower.includes('health') || lower.includes('medical'))
    return <HeartPulse size={size} color={color} />;
  if (lower.includes('transfer') || lower.includes('personal'))
    return <Wallet size={size} color={color} />;
  return <HelpCircle size={size} color={color} />;
};

export const CategoryAccordion: React.FC<Props> = ({
  categories,
  uncategorizedCount,
  uncategorizedTotal,
  onReviewUncategorized,
  onSelectCategoryFilter,
}) => {
  const { colors, isDark } = useAppTheme();
  // Keep first category open by default
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Food & Dining': true,
  });

  const toggleGroup = (groupName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>Categories & Sub-groups</Text>
          <View style={[styles.groupBadge, { backgroundColor: isDark ? '#262A30' : '#E2E8F0' }]}>
            <Text style={[styles.groupBadgeText, { color: colors.textSecondary }]}>
              {categories.length} Groups
            </Text>
          </View>
        </View>
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
                {uncategorizedCount} Uncategorized Payments
              </Text>
              <Text style={[styles.uncategorizedSub, { color: colors.textSecondary }]}>
                ₹{uncategorizedTotal.toLocaleString('en-IN')} • Tap to assign bucket
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
                    {getGroupIcon(catItem.category.name, 18, groupColor)}
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
                      ₹{catItem.totalAmount.toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.categoryPercent, { color: colors.textSecondary }]}>
                      {catItem.percentageOfTotal}% of total
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={18} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Sub-groups Content */}
              {isExpanded && catItem.subGroups.length > 0 && (
                <View style={[styles.subGroupContainer, { borderTopColor: colors.border }]}>
                  {catItem.subGroups.map((sub, sIdx) => (
                    <View
                      key={sub.name || sIdx}
                      style={[
                        styles.subGroupRow,
                        { backgroundColor: isDark ? '#171C22' : '#F8FAFC' },
                      ]}
                    >
                      <View style={styles.subLeft}>
                        <View style={[styles.subDot, { backgroundColor: groupColor }]} />
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={[styles.subName, { color: colors.text }]}>
                            {sub.name}
                          </Text>
                          {sub.merchants.length > 0 && (
                            <Text
                              style={[styles.subMerchants, { color: colors.textSecondary }]}
                              numberOfLines={1}
                            >
                              {sub.merchants.join(', ')}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.subRight}>
                        <Text style={[styles.subAmount, { color: colors.text }]}>
                          ₹{sub.amount.toLocaleString('en-IN')}
                        </Text>
                        <Text style={[styles.subPercent, { color: colors.textSecondary }]}>
                          {sub.percentageOfGroup}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  uncategorizedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  uncategorizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  alertIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncategorizedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  uncategorizedSub: {
    fontSize: 11,
    marginTop: 2,
  },
  reviewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  groupList: {
    gap: 10,
  },
  categoryCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryTxCount: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryPercent: {
    fontSize: 11,
    marginTop: 2,
  },
  subGroupContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 6,
  },
  subGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subName: {
    fontSize: 12,
    fontWeight: '600',
  },
  subMerchants: {
    fontSize: 10,
    marginTop: 2,
  },
  subRight: {
    alignItems: 'flex-end',
  },
  subAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  subPercent: {
    fontSize: 10,
    marginTop: 1,
  },
});
