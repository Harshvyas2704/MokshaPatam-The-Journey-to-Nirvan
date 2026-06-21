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
import React, { useCallback, useState } from 'react';
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

const GameControls: React.FC = () => {
  useAutoPlay();

  const diceValue = useGameStore(state => state.diceValue);
  const currentSquare = useGameStore(state => state.currentSquare);
  const realm = useGameStore(state => state.realm);
  const gameStatus = useGameStore(state => state.gameStatus);
  const isAutoPlaying = useGameStore(state => state.isAutoPlaying);
  const isMoving = useGameStore(state => state.isMoving);
  const totalRolls = useGameStore(state => state.totalRolls);
  const narakVisits = useGameStore(state => state.narakVisits);
  const lives = useGameStore(state => state.lives);
  const rollDice = useGameStore(state => state.rollDice);
  const setAutoPlay = useGameStore(state => state.setAutoPlay);
  const reset = useGameStore(state => state.reset);

  const [historyOpen, setHistoryOpen] = useState(false);
  const hasWon = gameStatus === 'won';

  const onRoll = useCallback(() => rollDice(), [rollDice]);
  const onToggleAuto = useCallback(
    () => setAutoPlay(!isAutoPlaying),
    [setAutoPlay, isAutoPlaying],
  );
  const onReset = useCallback(() => reset(), [reset]);
  const onOpenHistory = useCallback(() => setHistoryOpen(true), []);
  const onCloseHistory = useCallback(() => setHistoryOpen(false), []);

  // Where the soul currently is, for the status line.
  const positionLabel = hasWon
    ? 'Moksha attained'
    : realm
    ? realm // an off-board realm (e.g. महानरक)
    : currentSquare === 0
    ? 'Janmasthan'
    : `Square ${currentSquare} of ${GOAL_SQUARE}`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Dice value={diceValue} />
        <View style={styles.buttons}>
          <ControlButton
            label="Roll the Dice"
            onPress={onRoll}
            disabled={hasWon || isAutoPlaying || isMoving}
            hint="Rolls the dice once and moves the soul"
          />
          <ControlButton
            label={isAutoPlaying ? 'Stop' : 'Auto Roll'}
            onPress={onToggleAuto}
            disabled={hasWon}
            variant="secondary"
            hint={
              isAutoPlaying
                ? 'Stops automatic rolling'
                : 'Rolls automatically until Moksha is reached'
            }
          />
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text
          style={styles.status}
          accessibilityRole="text"
          accessibilityLiveRegion="polite">
          {`${positionLabel} · ${totalRolls} moves`}
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
          accessibilityLabel={`${narakVisits} narak visits`}>
          {`☠  Narak  ${narakVisits}`}
        </Text>
        <Text style={styles.counter} accessibilityLabel={`${lives} lives`}>
          {`↻  Lives  ${lives}`}
        </Text>
      </View>

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
});

export default GameControls;
