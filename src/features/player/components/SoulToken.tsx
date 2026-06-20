/**
 * SoulToken — the player's soul, rendered as a luminous orb.
 *
 * To feel like a soul rather than two flat circles, it combines several calm,
 * layered effects (all on the UI thread, no SVG):
 *   - a soft radial GLOW faked with several stacked translucent layers,
 *   - a bright CORE with an off-center highlight (gives it volume),
 *   - a slow BREATH (subtle scale pulse),
 *   - a gentle vertical FLOAT (it hovers),
 *   - faint HALOS that radiate outward and fade (spiritual emanation).
 *
 * Positioning is handled by the parent (cell center + size); the token centers
 * itself there and never intercepts board gestures.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, SOUL_TOKEN } from '@/constants';
import { lerp } from '@/utils';
import { getSoulBoxSize } from '../positioning';

/** Style for a circle of diameter `d` centered inside a `box`-sized square. */
function centeredCircle(d: number, box: number): ViewStyle {
  return {
    position: 'absolute',
    width: d,
    height: d,
    borderRadius: d / 2,
    left: (box - d) / 2,
    top: (box - d) / 2,
  };
}

/** A single halo ring that expands outward and fades, on a loop. */
const Halo: React.FC<{ box: number; diameter: number; delay: number }> = ({
  box,
  diameter,
  delay,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: SOUL_TOKEN.ringDurationMs,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.12, 1],
      [0, SOUL_TOKEN.ringMaxOpacity, 0],
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [SOUL_TOKEN.ringMinScale, SOUL_TOKEN.ringMaxScale],
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        centeredCircle(diameter, box),
        {
          borderWidth: Math.max(1, diameter * 0.04),
          borderColor: colors.soulAura,
        },
        style,
      ]}
    />
  );
};

interface SoulTokenProps {
  /** Board cell size; the orb scales relative to it. */
  cellSize: number;
}

const SoulTokenComponent: React.FC<SoulTokenProps> = ({ cellSize }) => {
  const breath = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: SOUL_TOKEN.pulseDurationMs,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
    float.value = withRepeat(
      withTiming(1, {
        duration: SOUL_TOKEN.floatDurationMs,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(breath);
      cancelAnimation(float);
    };
  }, [breath, float]);

  const sizes = useMemo(() => {
    const aura = cellSize * SOUL_TOKEN.auraRatio;
    const core = cellSize * SOUL_TOKEN.coreRatio;
    const highlight = core * SOUL_TOKEN.highlightRatio;
    const box = getSoulBoxSize(cellSize); // big enough for halos
    const floatAmp = cellSize * SOUL_TOKEN.floatRatio;
    return { aura, core, highlight, box, floatAmp };
  }, [cellSize]);

  // Stacked translucent layers, faint+large -> bright+small, for a soft glow.
  const glowLayers = useMemo(() => {
    const { glowLayers: n, glowMinOpacity, glowMaxOpacity } = SOUL_TOKEN;
    const denom = Math.max(1, n - 1);
    return Array.from({ length: n }, (_, i) => {
      const t = i / denom; // 0 = outer, 1 = inner
      return {
        diameter: lerp(sizes.aura, sizes.core * 1.1, t),
        opacity: lerp(glowMinOpacity, glowMaxOpacity, t * t),
        color: t > 0.7 ? colors.soul : colors.soulAura,
      };
    });
  }, [sizes.aura, sizes.core]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          float.value,
          [0, 1],
          [-sizes.floatAmp, sizes.floatAmp],
        ),
      },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [0.85, 1]),
    transform: [
      { scale: interpolate(breath.value, [0, 1], [1, SOUL_TOKEN.pulseScale]) },
    ],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(breath.value, [0, 1], [1, SOUL_TOKEN.corePulseScale]),
      },
    ],
  }));

  return (
    <View
      style={[styles.wrapper, { width: sizes.box, height: sizes.box }]}
      pointerEvents="none">
      <Animated.View style={[styles.fill, floatStyle]}>
        {Array.from({ length: SOUL_TOKEN.ringCount }, (_, i) => (
          <Halo
            key={i}
            box={sizes.box}
            diameter={sizes.aura}
            delay={(i * SOUL_TOKEN.ringDurationMs) / SOUL_TOKEN.ringCount}
          />
        ))}

        <Animated.View style={[styles.fill, glowStyle]}>
          {glowLayers.map((layer, i) => (
            <View
              key={i}
              style={[
                centeredCircle(layer.diameter, sizes.box),
                { backgroundColor: layer.color, opacity: layer.opacity },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View
          style={[centeredCircle(sizes.core, sizes.box), styles.core, coreStyle]}>
          <View
            style={[
              styles.highlight,
              {
                width: sizes.highlight,
                height: sizes.highlight,
                borderRadius: sizes.highlight / 2,
                top: sizes.core * 0.16,
                left: sizes.core * 0.22,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  core: {
    backgroundColor: colors.soul,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.moksha,
    // Soft bloom around the core (iOS shadow + Android elevation).
    shadowColor: colors.soul,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    elevation: 8,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
});

export const SoulToken = React.memo(SoulTokenComponent);
SoulToken.displayName = 'SoulToken';
