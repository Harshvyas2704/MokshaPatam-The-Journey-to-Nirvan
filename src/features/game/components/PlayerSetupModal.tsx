/**
 * PlayerSetupModal — choose players before a game.
 *
 * Lets you pick 1–4 players, name each, and choose a soul (token) color. Colors
 * are kept unique across players (picking a taken color swaps it). Names are
 * required in multiplayer; a single player defaults to "Player 1".
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, SOUL_COLORS, spacing, typography } from '@/constants';
import type { PlayerConfig } from '@/types';

interface PlayerSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (configs: PlayerConfig[]) => void;
}

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const COUNTS = [1, 2, 3, 4];

const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  visible,
  onClose,
  onStart,
}) => {
  const [count, setCount] = useState(1);
  const [names, setNames] = useState<string[]>([...DEFAULT_NAMES]);
  const [colorIds, setColorIds] = useState<number[]>([0, 1, 2, 3]);

  const setName = useCallback((index: number, value: string) => {
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  }, []);

  // Pick a color for a player; if another active player holds it, swap.
  const pickColor = useCallback(
    (index: number, colorId: number) => {
      setColorIds(prev => {
        const next = [...prev];
        const owner = next.findIndex((c, i) => i < count && c === colorId);
        if (owner !== -1 && owner !== index) {
          next[owner] = next[index]; // give the previous owner our old color
        }
        next[index] = colorId;
        return next;
      });
    },
    [count],
  );

  // Multiplayer requires every active name; solo falls back to a default.
  const canStart = useMemo(() => {
    if (count === 1) {
      return true;
    }
    return names.slice(0, count).every(n => n.trim().length > 0);
  }, [count, names]);

  const onConfirm = useCallback(() => {
    const configs: PlayerConfig[] = Array.from({ length: count }, (_, i) => ({
      name: names[i].trim() || DEFAULT_NAMES[i],
      colorId: colorIds[i],
    }));
    onStart(configs);
  }, [count, names, colorIds, onStart]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>New Game</Text>
          <Text style={styles.subtitle}>Players</Text>

          <View style={styles.countRow}>
            {COUNTS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.countButton, count === c && styles.countActive]}
                onPress={() => setCount(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: count === c }}
                accessibilityLabel={`${c} player${c > 1 ? 's' : ''}`}>
                <Text
                  style={[
                    styles.countLabel,
                    count === c && styles.countLabelActive,
                  ]}>
                  {`${c}P`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {Array.from({ length: count }, (_, i) => (
              <View key={i} style={styles.playerRow}>
                <TextInput
                  style={styles.nameInput}
                  value={names[i]}
                  onChangeText={value => setName(i, value)}
                  placeholder={DEFAULT_NAMES[i]}
                  placeholderTextColor={colors.textMuted}
                  maxLength={16}
                  accessibilityLabel={`Player ${i + 1} name`}
                />
                <View style={styles.swatches}>
                  {SOUL_COLORS.map(color => {
                    const selected = colorIds[i] === color.id;
                    return (
                      <TouchableOpacity
                        key={color.id}
                        onPress={() => pickColor(i, color.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`${color.name} token`}
                        style={[
                          styles.swatch,
                          { backgroundColor: color.aura },
                          selected && styles.swatchSelected,
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.start, !canStart && styles.startDisabled]}
              onPress={onConfirm}
              disabled={!canStart}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canStart }}
              accessibilityLabel="Start game">
              <Text style={styles.startLabel}>🎲  Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  title: {
    color: colors.gold,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.primary,
  },
  countRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.copper,
    backgroundColor: colors.surfaceMuted,
  },
  countActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.gold,
  },
  countLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
  countLabelActive: {
    color: colors.ivory,
  },
  list: {
    marginTop: spacing.md,
  },
  listContent: {
    gap: spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  nameInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  swatchSelected: {
    borderColor: colors.ivory,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  start: {
    backgroundColor: colors.maroon,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.copper,
  },
  startDisabled: {
    opacity: 0.4,
  },
  startLabel: {
    color: colors.ivory,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export default PlayerSetupModal;
