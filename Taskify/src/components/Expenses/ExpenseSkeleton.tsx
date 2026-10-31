import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';

export const ExpenseSkeleton: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const skeletonColor = isDark ? '#262A30' : '#E2E8F0';

  return (
    <View style={styles.container}>
      {/* Hero Card Skeleton */}
      <View
        style={[
          styles.heroCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.topRow}>
          <Animated.View
            style={[
              styles.pill,
              { backgroundColor: skeletonColor, opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.btnPill,
              { backgroundColor: skeletonColor, opacity: pulseAnim },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.largeAmount,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />

        <View style={styles.splitRow}>
          <Animated.View
            style={[
              styles.splitBox,
              { backgroundColor: skeletonColor, opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.splitBox,
              { backgroundColor: skeletonColor, opacity: pulseAnim },
            ]}
          />
        </View>

        <View style={styles.microList}>
          <Animated.View
            style={[
              styles.microRow,
              { backgroundColor: skeletonColor, opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.microRow,
              { backgroundColor: skeletonColor, opacity: pulseAnim },
            ]}
          />
        </View>
      </View>

      {/* Action Strip Skeleton */}
      <View style={styles.actionStrip}>
        <Animated.View
          style={[
            styles.actionBtn,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.actionBtnSmall,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.actionBtnSmall,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
      </View>

      {/* Bank Accounts Box Skeleton */}
      <View
        style={[
          styles.cardBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Animated.View
          style={[
            styles.sectionHeading,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.bankRow,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
      </View>

      {/* Categories Skeleton */}
      <View
        style={[
          styles.cardBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Animated.View
          style={[
            styles.sectionHeading,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.catRow,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.catRow,
            { backgroundColor: skeletonColor, opacity: pulseAnim },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingTop: 4,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    width: 120,
    height: 20,
    borderRadius: 6,
  },
  btnPill: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  largeAmount: {
    width: 180,
    height: 36,
    borderRadius: 8,
    marginVertical: 4,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitBox: {
    flex: 1,
    height: 64,
    borderRadius: 12,
  },
  microList: {
    gap: 8,
    marginTop: 4,
  },
  microRow: {
    height: 32,
    borderRadius: 8,
  },
  actionStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 140,
    height: 38,
    borderRadius: 12,
  },
  actionBtnSmall: {
    width: 90,
    height: 38,
    borderRadius: 12,
  },
  cardBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  sectionHeading: {
    width: 140,
    height: 18,
    borderRadius: 6,
  },
  bankRow: {
    height: 52,
    borderRadius: 10,
  },
  catRow: {
    height: 56,
    borderRadius: 12,
  },
});
