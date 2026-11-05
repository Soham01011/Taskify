import { styles } from '@/assets/styles/heroSpenCard.styles';
import { useAppTheme } from '@/hooks/use-theme';
import {
  ArrowRightLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Tag,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { MonthSummary } from '../../types/expense';


interface Props {
  summary: MonthSummary;
  onReviewUncategorized?: () => void;
}

export const HeroSpendCard: React.FC<Props> = ({ summary, onReviewUncategorized }) => {
  const { colors, isDark } = useAppTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const toggleFlip = () => {
    if (isFlipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setIsFlipped(false);
    } else {
      Animated.spring(flipAnim, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setIsFlipped(true);
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const categorizedPercent =
    summary.totalSettledOutflow > 0
      ? Math.round((summary.categorizedTotal / summary.totalSettledOutflow) * 100)
      : 0;
  const uncategorizedPercent = 100 - categorizedPercent;

  return (
    <View style={styles.container}>
      {/* Front Face: Settled Month Actuals */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={[styles.pillBadge, { backgroundColor: colors.primary + '18' }]}>
              <Text style={[styles.pillBadgeText, { color: colors.primary }]}>
                {summary.monthLabel} Settled
              </Text>
            </View>
            <Text style={[styles.txCountText, { color: colors.textSecondary }]}>
              {summary.txCount} Txns
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.flipButton, { backgroundColor: colors.primary }]}
            onPress={toggleFlip}
            activeOpacity={0.8}
          >
            <Text style={styles.flipButtonText}>Projection</Text>
            <ArrowRightLeft size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Total Settled Outflow */}
        <View style={styles.totalBlock}>
          <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>
            Total Settled Outflow
          </Text>
          <View style={styles.amountRow}>
            <Text style={[styles.largeAmount, { color: colors.text }]}>
              ₹{summary.totalSettledOutflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: '#2ECC7120' }]}>
              <Text style={styles.statusBadgeText}>Settled Actuals</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Split Pill Metrics: Categorized vs Uncategorized */}
        <View style={styles.splitGrid}>
          <View
            style={[
              styles.splitCard,
              { backgroundColor: isDark ? '#262A30' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
              In Custom Groups
            </Text>
            <Text style={[styles.splitValue, { color: colors.primary }]}>
              ₹{summary.categorizedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.splitSub, { color: colors.textSecondary }]}>
              {categorizedPercent}% of monthly outflow
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.splitCard,
              {
                backgroundColor:
                  summary.uncategorizedCount > 0
                    ? isDark
                      ? '#2A2218'
                      : '#FFF8F0'
                    : isDark
                      ? '#262A30'
                      : '#F1F5F9',
                borderColor: summary.uncategorizedCount > 0 ? '#FF7A0040' : colors.border,
              },
            ]}
            onPress={onReviewUncategorized}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.splitLabel,
                { color: summary.uncategorizedCount > 0 ? '#FF7A00' : colors.textSecondary },
              ]}
            >
              Uncategorized
            </Text>
            <Text
              style={[
                styles.splitValue,
                { color: summary.uncategorizedCount > 0 ? '#FF7A00' : colors.text },
              ]}
            >
              ₹{summary.uncategorizedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.splitSub, { color: colors.textSecondary }]}>
              {summary.uncategorizedCount} {summary.uncategorizedCount === 1 ? 'item' : 'items'} ({uncategorizedPercent}%)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Settled Outflows Micro-list */}
        {summary.topSettledOutflows.length > 0 && (
          <View style={styles.topOutflowsBlock}>
            <Text style={[styles.sectionMicroTitle, { color: colors.textSecondary }]}>
              Top Outflows
            </Text>
            {summary.topSettledOutflows.slice(0, 3).map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.microListItem,
                  { backgroundColor: isDark ? '#171C22' : '#F8FAFC' },
                ]}
              >
                <View style={styles.microLeft}>
                  <View style={[styles.microIconBox, { backgroundColor: colors.primary + '18' }]}>
                    <Tag size={13} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.microMerchant, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.counterparty}
                  </Text>
                </View>
                <Text style={[styles.microAmount, { color: colors.text }]}>
                  ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Back Face: AI Spend Projection */}
      <Animated.View
        pointerEvents={isFlipped ? 'auto' : 'none'}
        style={[
          styles.card,
          styles.cardBack,
          {
            backgroundColor: isDark ? '#1E252D' : '#FFFFFF',
            borderColor: colors.border,
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={[styles.pillBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.pillBadgeText, { color: '#FFFFFF' }]}>
                {summary.monthLabel} Projection
              </Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + '20' }]}>
              <CheckCircle2 size={12} color={colors.primary} />
              <Text style={[styles.confidenceText, { color: colors.primary }]}>90% Conf.</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.flipButton,
              { backgroundColor: isDark ? '#262A30' : '#E2E8F0' },
            ]}
            onPress={toggleFlip}
            activeOpacity={0.8}
          >
            <Text style={[styles.flipButtonText, { color: colors.text }]}>Settled</Text>
            <ArrowRightLeft size={13} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Projected Range */}
        <View style={styles.totalBlock}>
          <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>
            Estimated Outflow Window
          </Text>
          <Text style={[styles.largeAmount, { color: colors.primary }]}>
            ₹{summary.projection.minOutflow.toLocaleString('en-IN')} – ₹{summary.projection.maxOutflow.toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.subNote, { color: colors.textSecondary }]}>
            {summary.projection.note}
          </Text>
        </View>

        {/* Projection Highlights Grid */}
        <View style={styles.splitGrid}>
          <View
            style={[
              styles.splitCard,
              { backgroundColor: isDark ? '#171C22' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
              Daily Cadence
            </Text>
            <Text style={[styles.splitValue, { color: colors.text }]}>
              ₹{summary.dailyAverage.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.splitSub, { color: colors.primary }]}>
              Avg daily run-rate
            </Text>
          </View>

          <View
            style={[
              styles.splitCard,
              { backgroundColor: isDark ? '#171C22' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
              Inflow Offset
            </Text>
            <Text style={[styles.splitValue, { color: '#2ECC71' }]}>
              +₹{summary.totalInflow.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.splitSub, { color: colors.textSecondary }]}>
              {summary.creditCount} incoming credits
            </Text>
          </View>
        </View>

        {/* Local intelligence note */}
        <View
          style={[
            styles.noteBox,
            { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
          ]}
        >
          <Sparkles size={18} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>
              Zero-Knowledge Local Storage
            </Text>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              All categories, rules, and parsed statement transactions are stored securely on this phone.
            </Text>
          </View>
        </View>

        {/* Tap to return hint */}
        <TouchableOpacity
          onPress={toggleFlip}
          style={styles.returnHint}
          activeOpacity={0.7}
        >
          <RotateCcw size={13} color={colors.primary} />
          <Text style={[styles.returnHintText, { color: colors.primary }]}>
            Tap to return to Settled Actuals
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

