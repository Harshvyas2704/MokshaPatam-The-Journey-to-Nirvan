/**
 * HistoryModal — the soul's journey so far.
 *
 * Lists every resolved move (from → to, dice, what happened) and the running
 * total, so the player can see how many moves the journey to Moksha took.
 */
import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/constants';
import { useGameStore } from '@/store';
import type { MoveHistoryEntry, MoveOutcome } from '@/types';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

const OUTCOME_LABEL: Record<MoveOutcome, string> = {
  normal: 'moved',
  enter: 'entered the board',
  snake: 'snake — slid down',
  ladder: 'ladder — climbed',
  narak: 'fell into naraka',
  escape: 'escaped a realm',
  blocked: 'stayed',
  win: 'reached Moksha',
};

const OUTCOME_COLOR: Record<MoveOutcome, string> = {
  normal: colors.textMuted,
  enter: colors.textSecondary,
  snake: colors.snake,
  ladder: colors.ladder,
  narak: colors.snake,
  escape: colors.textSecondary,
  blocked: colors.textMuted,
  win: colors.moksha,
};

const HistoryRow: React.FC<{ entry: MoveHistoryEntry }> = ({ entry }) => (
  <View style={styles.row}>
    <Text style={styles.index}>{entry.id}</Text>
    <Text style={styles.move}>
      {entry.from} → {entry.to}
    </Text>
    <Text style={styles.dice}>🎲 {entry.dice}</Text>
    <Text style={[styles.outcome, { color: OUTCOME_COLOR[entry.outcome] }]}>
      {OUTCOME_LABEL[entry.outcome]}
    </Text>
  </View>
);

const HistoryModalComponent: React.FC<HistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const moveHistory = useGameStore(state => state.moveHistory);
  const totalRolls = useGameStore(state => state.totalRolls);
  const hasWon = useGameStore(state => state.gameStatus === 'won');

  const summary = hasWon
    ? `Reached Moksha in ${totalRolls} moves`
    : `${totalRolls} moves so far`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>The Journey</Text>
          <Text style={styles.summary}>{summary}</Text>

          {moveHistory.length === 0 ? (
            <Text style={styles.empty}>No moves yet — roll to begin.</Text>
          ) : (
            <FlatList
              style={styles.list}
              data={moveHistory}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => <HistoryRow entry={item} />}
              initialNumToRender={20}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close history">
            <Text style={styles.buttonLabel}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '76%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.copper,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
  },
  summary: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  empty: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  list: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  index: {
    width: 28,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
  },
  move: {
    width: 80,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
  },
  dice: {
    width: 48,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  outcome: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'right',
  },
  button: {
    marginTop: spacing.md,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.maroon,
    borderWidth: 1,
    borderColor: colors.copper,
  },
  buttonLabel: {
    fontSize: typography.fontSize.md,
    color: colors.ivory,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export const HistoryModal = React.memo(HistoryModalComponent);
HistoryModal.displayName = 'HistoryModal';
