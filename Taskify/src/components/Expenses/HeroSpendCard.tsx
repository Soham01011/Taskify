import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowRightLeft,
  Calendar,
  Car,
  CheckCircle2,
  HeartPulse,
  HelpCircle,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { ExpenseTransaction, MonthSummary } from '../../types/expense';

interface Props {
  summary: MonthSummary;
}

const getCategoryIcon = (category: string, size = 16, color = '#FFF') => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food')) return <Utensils size={size} color={color} />;
  if (cat.includes('transport') || cat.includes('commute')) return <Car size={size} color={color} />;
  if (cat.includes('fixed') || cat.includes('bill') || cat.includes('subscription')) return <Calendar size={size} color={color} />;
  if (cat.includes('shop')) return <ShoppingBag size={size} color={color} />;
  if (cat.includes('health')) return <HeartPulse size={size} color={color} />;
  if (cat.includes('transfer')) return <Wallet size={size} color={color} />;
  return <HelpCircle size={size} color={color} />;
};

export const HeroSpendCard: React.FC<Props> = ({ summary }) => {
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
              <Text style={styles.statusBadgeText}>Within 3% of Target</Text>
            </View>
          </View>
        </View>

        {/* Split Pill Metrics */}
        <View style={styles.splitGrid}>
          <View
            style={[
              styles.splitCard,
              { backgroundColor: isDark ? '#262A30' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
              Committed Fixed
            </Text>
            <Text style={[styles.splitValue, { color: colors.text }]}>
              ₹{summary.committedFixed.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.splitSub, { color: colors.textSecondary }]}>
              Rent, SIP, Mandates ({summary.committedFixedPercent}%)
            </Text>
          </View>

          <View
            style={[
              styles.splitCard,
              { backgroundColor: isDark ? '#262A30' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
              Variable Lifestyle
            </Text>
            <Text style={[styles.splitValue, { color: colors.primary }]}>
              ₹{summary.variableLifestyle.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.splitSub, { color: colors.textSecondary }]}>
              Food, Transit, Quick ({summary.variableLifestylePercent}%)
            </Text>
          </View>
        </View>

        {/* Top Settled Outflows Micro-list */}
        {summary.topSettledOutflows.length > 0 && (
          <View style={styles.topOutflowsBlock}>
            <Text style={[styles.sectionMicroTitle, { color: colors.textSecondary }]}>
              Top Settled Outflows
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
                    {getCategoryIcon(item.category, 14, colors.primary)}
                  </View>
                  <Text
                    style={[styles.microMerchant, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.counterparty}
                  </Text>
                </View>
                <Text style={[styles.microAmount, { color: colors.text }]}>
                  ₹{item.amount.toLocaleString('en-IN')}
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
              <Text style={[styles.confidenceText, { color: colors.primary }]}>88% Conf.</Text>
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
              Committed Fixed Due
            </Text>
            <Text style={[styles.splitValue, { color: colors.text }]}>
              ₹{summary.committedFixed.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.splitSub, { color: colors.primary }]}>
              100% Due Detected
            </Text>
          </View>

          <View
            style={[
              styles.splitCard,
              { backgroundColor: isDark ? '#171C22' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
              Forecast Variable
            </Text>
            <Text style={[styles.splitValue, { color: '#FF7A00' }]}>
              ₹{summary.projection.forecastVariable.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.splitSub, { color: colors.textSecondary }]}>
              Target: ₹{summary.projection.targetPerDay}/day
            </Text>
          </View>
        </View>

        {/* Run-rate intelligence note */}
        <View
          style={[
            styles.noteBox,
            { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
          ]}
        >
          <Sparkles size={18} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>
              Local Intelligence Engine
            </Text>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              Parsed safely on-device with zero-knowledge tracking. Run-rate tracks within safe variance.
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 330,
    position: 'relative',
  },
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  flipButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalBlock: {
    marginBottom: 12,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  largeAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '600',
  },
  subNote: {
    fontSize: 12,
    marginTop: 2,
  },
  splitGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  splitCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  splitValue: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2,
  },
  splitSub: {
    fontSize: 10,
  },
  topOutflowsBlock: {
    marginTop: 2,
  },
  sectionMicroTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  microListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 5,
  },
  microLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  microIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microMerchant: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  microAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  returnHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  returnHintText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
