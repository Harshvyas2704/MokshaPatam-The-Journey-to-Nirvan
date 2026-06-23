/**
 * SoulTokenLayer — the animated moving layer for every player's soul token.
 *
 * Lives inside the board's transformed surface (so tokens zoom/pan with the
 * board). One `PlayerSoulToken` per player owns its animated position via
 * `useSoulMovement` and renders the orb in that player's color. Pointer events
 * are disabled so tokens never block board gestures.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SOUL_COLORS } from '@/constants';
import { useGameStore } from '@/store';
import type { PlayerState } from '@/types';
import type { BoardLayout } from '@/features/board/types';
import { getClusterOffset, getSoulBoxSize } from '../positioning';
import { useSoulMovement } from '../hooks/useSoulMovement';
import { SoulToken } from './SoulToken';

interface PlayerSoulTokenProps {
  player: PlayerState;
  index: number;
  count: number;
  layout: BoardLayout;
  box: number;
  cellSize: number;
}

const PlayerSoulToken: React.FC<PlayerSoulTokenProps> = ({
  player,
  index,
  count,
  layout,
  box,
  cellSize,
}) => {
  const offset = getClusterOffset(index, count, cellSize);
  const animatedStyle = useSoulMovement(player, layout, box, offset);
  const color = SOUL_COLORS[player.colorId] ?? SOUL_COLORS[0];

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.token, { width: box, height: box }, animatedStyle]}>
      <SoulToken cellSize={cellSize} core={color.core} aura={color.aura} />
    </Animated.View>
  );
};

interface SoulTokenLayerProps {
  layout: BoardLayout;
}

const SoulTokenLayer: React.FC<SoulTokenLayerProps> = ({ layout }) => {
  const players = useGameStore(state => state.players);
  const cellSize = layout.dimensions.cellSize;
  const box = getSoulBoxSize(cellSize);

  return (
    <>
      {players.map((player, index) => (
        <PlayerSoulToken
          key={player.id}
          player={player}
          index={index}
          count={players.length}
          layout={layout}
          box={box}
          cellSize={cellSize}
        />
      ))}
    </>
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
