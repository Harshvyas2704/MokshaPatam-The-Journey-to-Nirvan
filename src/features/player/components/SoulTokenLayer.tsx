/**
 * SoulTokenLayer — the animated moving layer for the soul token.
 *
 * Lives inside the board's transformed surface (so it zooms/pans with the
 * board). Owns the token's animated position via `useSoulMovement` and renders
 * the visual orb. Pointer events are disabled so it never blocks board gestures.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import type { BoardLayout } from '@/features/board/types';
import { getSoulBoxSize } from '../positioning';
import { useSoulMovement } from '../hooks/useSoulMovement';
import { SoulToken } from './SoulToken';

interface SoulTokenLayerProps {
  layout: BoardLayout;
}

const SoulTokenLayer: React.FC<SoulTokenLayerProps> = ({ layout }) => {
  const cellSize = layout.dimensions.cellSize;
  const box = getSoulBoxSize(cellSize);
  const animatedStyle = useSoulMovement(layout, box);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.token, { width: box, height: box }, animatedStyle]}>
      <SoulToken cellSize={cellSize} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  token: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default SoulTokenLayer;
