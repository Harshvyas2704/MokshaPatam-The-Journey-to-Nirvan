/**
 * GameControls — the fixed control bar below the board.
 *
 * Provides the two play modes:
 *   1. "Roll the Dice"  — a single manual roll.
 *   2. "Auto Roll"      — automatically rolls until the soul reaches Moksha.
 * Plus a Reset, the current dice face, and a status line.
 *
 * These controls stay fixed; only the board zooms/pans.
 */
import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { colors, GOAL_SQUARE, radius, spacing, typography } from '@/constants';
import { useGameStore } from '@/store';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { Dice } from './Dice';

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  onPress,
  disabled,
  variant = 'primary',
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
    accessibilityLabel={label}>
    <Text style={styles.buttonLabel}>{label}</Text>
  </TouchableOpacity>
);

const GameControls: React.FC = () => {
  useAutoPlay();

  const diceValue = useGameStore(state => state.diceValue);
  const currentSquare = useGameStore(state => state.currentSquare);
  const gameStatus = useGameStore(state => state.gameStatus);
  const isAutoPlaying = useGameStore(state => state.isAutoPlaying);
  const isMoving = useGameStore(state => state.isMoving);
  const rollDice = useGameStore(state => state.rollDice);
  const setAutoPlay = useGameStore(state => state.setAutoPlay);
  const reset = useGameStore(state => state.reset);

  const hasWon = gameStatus === 'won';

  const onRoll = useCallback(() => rollDice(), [rollDice]);
  const onToggleAuto = useCallback(
    () => setAutoPlay(!isAutoPlaying),
    [setAutoPlay, isAutoPlaying],
  );
  const onReset = useCallback(() => reset(), [reset]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Dice value={diceValue} />
        <View style={styles.buttons}>
          <ControlButton
            label="Roll the Dice"
            onPress={onRoll}
            disabled={hasWon || isAutoPlaying || isMoving}
          />
          <ControlButton
            label={isAutoPlaying ? 'Stop' : 'Auto Roll'}
            onPress={onToggleAuto}
            disabled={hasWon}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.status}>
          {hasWon
            ? 'Liberation attained — Moksha'
            : `Square ${currentSquare} / ${GOAL_SQUARE}`}
        </Text>
        <TouchableOpacity
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Reset the journey">
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>
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
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
  reset: {
    color: colors.gold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
  },
});

export default GameControls;
