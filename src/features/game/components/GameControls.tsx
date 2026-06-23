/**
 * GameControls — the fixed control bar below the board.
 *
 * Shows whose turn it is, that player's details (position, Narak, Lives), and a
 * compact strip of all players. Provides the two play modes (manual roll, auto
 * roll), a Reset, the current dice face, and the move history.
 *
 * These controls stay fixed; only the board zooms/pans.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  GOAL_SQUARE,
  radius,
  SOUL_COLORS,
  spacing,
  typography,
} from '@/constants';
import { useGameStore } from '@/store';
import type { PlayerState } from '@/types';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { Dice } from './Dice';
import { HistoryModal } from './HistoryModal';

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  hint?: string;
  style?: ViewStyle;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  onPress,
  disabled,
  variant = 'primary',
  hint,
  style,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ disabled: !!disabled }}
    accessibilityLabel={label}
    accessibilityHint={hint}>
    <Text style={styles.buttonLabel}>{label}</Text>
  </TouchableOpacity>
);

/** A small colored dot for a player's soul color. */
const ColorDot: React.FC<{ colorId: number; size?: number }> = ({
  colorId,
  size = 12,
}) => {
  const color = SOUL_COLORS[colorId] ?? SOUL_COLORS[0];
  return (
    <View
      style={[
        styles.colorDot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color.aura,
          borderColor: color.core,
        },
      ]}
    />
  );
};

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

/** Where a player currently is, as a short label. */
function positionLabel(player: PlayerState): string {
  if (player.finished) {
    return 'Moksha';
  }
  if (player.realm) {
    return player.realm;
  }
  return player.currentSquare === 0
    ? 'Janmasthan'
    : `Square ${player.currentSquare}`;
}

/** One chip in the all-players strip. */
const PlayerChip: React.FC<{ player: PlayerState; isCurrent: boolean }> = ({
  player,
  isCurrent,
}) => (
  <View style={[styles.chip, isCurrent && styles.chipCurrent]}>
    <ColorDot colorId={player.colorId} size={10} />
    <Text style={styles.chipName} numberOfLines={1}>
      {player.name}
    </Text>
    <Text style={styles.chipPos}>
      {player.finished
        ? (RANK_MEDAL[(player.rank ?? 1) - 1] ?? `#${player.rank}`)
        : player.currentSquare === 0
        ? '·'
        : player.currentSquare}
    </Text>
  </View>
);

const GameControls: React.FC = () => {
  useAutoPlay();

  const diceValue = useGameStore(state => state.diceValue);
  const players = useGameStore(state => state.players);
  const currentPlayerIndex = useGameStore(state => state.currentPlayerIndex);
  const gameStatus = useGameStore(state => state.gameStatus);
  const isAutoPlaying = useGameStore(state => state.isAutoPlaying);
  const isMoving = useGameStore(state => state.isMoving);
  const pendingAdvance = useGameStore(state => state.pendingAdvance);
  const totalRolls = useGameStore(state => state.totalRolls);
  const rollDice = useGameStore(state => state.rollDice);
  const setAutoPlay = useGameStore(state => state.setAutoPlay);
  const reset = useGameStore(state => state.reset);

  const [historyOpen, setHistoryOpen] = useState(false);
  const hasWon = gameStatus === 'won';
  const current = players[currentPlayerIndex] ?? players[0];

  const onRoll = useCallback(() => rollDice(), [rollDice]);
  const onToggleAuto = useCallback(
    () => setAutoPlay(!isAutoPlaying),
    [setAutoPlay, isAutoPlaying],
  );
  const onReset = useCallback(() => reset(), [reset]);
  const onOpenHistory = useCallback(() => setHistoryOpen(true), []);
  const onCloseHistory = useCallback(() => setHistoryOpen(false), []);

  // Rolling a 6 grants another roll (turn hasn't advanced).
  const rollAgain =
    !hasWon && !isMoving && diceValue === 6 && !pendingAdvance && totalRolls > 0;

  const turnLabel = hasWon
    ? '🌸 All souls liberated'
    : rollAgain
    ? `${current.name} — rolled a 6, roll again!`
    : `${current.name} — your turn`;

  return (
    <View style={styles.container}>
      <View style={styles.turnRow}>
        {!hasWon ? <ColorDot colorId={current.colorId} /> : null}
        <Text
          style={styles.turnLabel}
          numberOfLines={1}
          accessibilityLiveRegion="polite">
          {turnLabel}
        </Text>
      </View>

      <View style={styles.row}>
        <Dice value={diceValue} />
        <View style={styles.buttons}>
          <ControlButton
            label="Roll the Dice"
            onPress={onRoll}
            disabled={hasWon || isAutoPlaying || isMoving}
            hint="Rolls the dice once and moves the current soul"
          />
          <ControlButton
            label={isAutoPlaying ? 'Stop' : 'Auto Roll'}
            onPress={onToggleAuto}
            disabled={hasWon}
            variant="secondary"
            hint={
              isAutoPlaying
                ? 'Stops automatic rolling'
                : 'Rolls automatically, passing each turn, until all are liberated'
            }
          />
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text
          style={styles.status}
          accessibilityRole="text"
          accessibilityLiveRegion="polite">
          {`${positionLabel(current)} of ${GOAL_SQUARE} · ${totalRolls} moves`}
        </Text>
        <View style={styles.statusActions}>
          <TouchableOpacity
            onPress={onOpenHistory}
            accessibilityRole="button"
            accessibilityLabel="View move history">
            <Text style={styles.action}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReset}
            accessibilityRole="button"
            accessibilityLabel="Reset the journey">
            <Text style={styles.reset}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.countersRow}>
        <Text
          style={styles.counter}
          accessibilityLabel={`${current.narakVisits} narak visits`}>
          {`☠  Narak  ${current.narakVisits}`}
        </Text>
        <Text style={styles.counter} accessibilityLabel={`${current.lives} lives`}>
          {`↻  Lives  ${current.lives}`}
        </Text>
      </View>

      {players.length > 1 ? (
        <View style={styles.playersStrip}>
          {players.map(player => (
            <PlayerChip
              key={player.id}
              player={player}
              isCurrent={!hasWon && player.id === current.id}
            />
          ))}
        </View>
      ) : null}

      <HistoryModal visible={historyOpen} onClose={onCloseHistory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  colorDot: {
    borderWidth: 1,
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  turnLabel: {
    flex: 1,
    color: colors.gold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: spacing.md,
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.maroon,
    borderColor: colors.copper,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.copper,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonLabel: {
    color: colors.ivory,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
  statusRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
  statusActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginLeft: spacing.md,
  },
  action: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
  },
  reset: {
    color: colors.gold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
  },
  countersRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  counter: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
  },
  playersStrip: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  chipCurrent: {
    borderColor: colors.gold,
  },
  chipName: {
    maxWidth: 90,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.primary,
  },
  chipPos: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export default GameControls;
