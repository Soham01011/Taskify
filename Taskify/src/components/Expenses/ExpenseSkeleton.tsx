import { styles } from '@/assets/styles/expenseSkeleton.style';
import { useAppTheme } from '@/hooks/use-theme';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

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


