/**
 * Collapsible — a tappable banner that smoothly reveals/hides its content.
 *
 * The header (banner) is always visible; tapping it animates the body open or
 * shut with Reanimated (height + opacity), and spins a chevron. The body's
 * natural height is measured once via an off-layout probe, then the visible
 * container animates between 0 and that height — so the reveal is smooth and
 * never jumps.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/constants';

interface CollapsibleProps {
  title: string;
  /** Small count/hint shown on the right of the banner (e.g. "62"). */
  badge?: string;
  /** Accent color for the banner border + chevron. */
  accent?: string;
  initiallyOpen?: boolean;
  children: React.ReactNode;
}

const DURATION = 280;

const CollapsibleComponent: React.FC<CollapsibleProps> = ({
  title,
  badge,
  accent = colors.copper,
  initiallyOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(initiallyOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(initiallyOpen ? 1 : 0);

  const onMeasure = useCallback((e: LayoutChangeEvent) => {
    setContentHeight(e.nativeEvent.layout.height);
  }, []);

  const toggle = useCallback(() => {
    setOpen(prev => {
      progress.value = withTiming(prev ? 0 : 1, {
        duration: DURATION,
        easing: Easing.inOut(Easing.ease),
      });
      return !prev;
    });
  }, [progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 90])}deg` }],
  }));

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggle}
        style={[styles.banner, { borderColor: accent }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <View style={styles.bannerRight}>
          {badge !== undefined && (
            <Text style={[styles.badge, { color: accent }]}>{badge}</Text>
          )}
          <Animated.Text style={[styles.chevron, { color: accent }, chevronStyle]}>
            ›
          </Animated.Text>
        </View>
      </TouchableOpacity>

      {/* Visible, animated container — clips the body to its animated height. */}
      <Animated.View style={[styles.body, bodyStyle]}>
        {/* Off-layout probe: measures the body's natural height without
            affecting the animated container's height. */}
        <View style={styles.measure} onLayout={onMeasure}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bannerTitle: {
    color: colors.saffron,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.xl,
  },
  body: {
    overflow: 'hidden',
  },
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingTop: spacing.sm,
  },
});

export const Collapsible = React.memo(CollapsibleComponent);
Collapsible.displayName = 'Collapsible';
