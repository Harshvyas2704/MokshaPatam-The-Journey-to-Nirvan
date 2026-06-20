/**
 * Dice — a calm pip face showing the last rolled value.
 *
 * Static face for Phase 5 (no roll animation yet — that arrives with the
 * movement system in Phase 6). Renders 1–6 as the traditional pip layout; shows
 * an empty face before the first roll.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/constants';

interface DiceProps {
  value: number | null;
  size?: number;
}

// Which of the 9 grid slots are filled for each value (1..6).
const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DiceComponent: React.FC<DiceProps> = ({ value, size = 56 }) => {
  const pips = value && PIP_LAYOUT[value] ? PIP_LAYOUT[value] : [];
  const pipSet = new Set(pips);
  const pipSize = Math.round(size * 0.16);

  return (
    <View
      style={[styles.dice, { width: size, height: size }]}
      accessibilityRole="image"
      accessibilityLabel={value ? `Dice showing ${value}` : 'Dice'}>
      {Array.from({ length: 9 }, (_, slot) => (
        <View key={slot} style={styles.slot}>
          {pipSet.has(slot) ? (
            <View
              style={[
                styles.pip,
                { width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
              ]}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dice: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.ivory,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.copper,
    padding: spacing.xs,
  },
  slot: {
    width: '33.333%',
    height: '33.333%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pip: {
    backgroundColor: colors.maroon,
  },
});

export const Dice = React.memo(DiceComponent);
Dice.displayName = 'Dice';
