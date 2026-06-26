/**
 * OffboardCellView — a realm / janmasthan cell in the band below the board.
 *
 * Naraka realms (hells) read darker/ominous; janmasthan (start) reads warm.
 * Memoized — these never change after layout.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/constants';
import { clamp } from '@/utils';
import type { PositionedOffboardCell } from '../types';

interface OffboardCellViewProps {
  cell: PositionedOffboardCell;
}

/** Ominous near-black for naraka cells, and the dim red of their text. */
const NARAK_SURFACE = '#1A0808';
const NARAK_TEXT = '#C9776B';
/** Loka cells: celestial green vs. the deceptive purple Void (शून्य लोक). */
const LOKA_SURFACE = '#13241A';
const LOKA_GREEN = '#6FA86A';
const VOID_SURFACE = '#1C1730';
const VOID_PURPLE = '#9A8AC4';

/** Surface, border, and Sanskrit-text colors for a cell, by kind. */
function cellColors(cell: PositionedOffboardCell): {
  background: string;
  borderColor: string;
  sanskritColor: string;
} {
  if (cell.kind === 'start') {
    return {
      background: colors.surfaceMuted,
      borderColor: colors.gold,
      sanskritColor: colors.gold,
    };
  }
  if (cell.kind === 'loka') {
    const accent = cell.void ? VOID_PURPLE : LOKA_GREEN;
    return {
      background: cell.void ? VOID_SURFACE : LOKA_SURFACE,
      borderColor: accent,
      sanskritColor: accent,
    };
  }
  return {
    background: NARAK_SURFACE,
    borderColor: colors.snake,
    sanskritColor: NARAK_TEXT,
  };
}

/** Short kind label shown under the Sanskrit name. */
function kindLabel(cell: PositionedOffboardCell): string {
  if (cell.kind === 'start') {
    return 'start';
  }
  if (cell.kind === 'loka') {
    return cell.english;
  }
  return 'naraka';
}

const OffboardCellViewComponent: React.FC<OffboardCellViewProps> = ({ cell }) => {
  const sanskritSize = clamp(Math.round(cell.size * 0.15), 10, 20);
  const labelSize = clamp(Math.round(cell.size * 0.095), 7, 12);
  const { background, borderColor, sanskritColor } = cellColors(cell);

  return (
    <View
      style={[
        styles.cell,
        {
          left: cell.x + 2,
          top: cell.y + 2,
          width: cell.size - 4,
          height: cell.size - 4,
          backgroundColor: background,
          borderColor,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={cell.english}>
      <Text
        style={[
          styles.sanskrit,
          { color: sanskritColor, fontSize: sanskritSize },
        ]}
        numberOfLines={2}>
        {cell.sanskrit}
      </Text>
      <Text
        style={[styles.label, { color: colors.textMuted, fontSize: labelSize }]}
        numberOfLines={1}>
        {kindLabel(cell)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 3,
  },
  sanskrit: {
    fontFamily: typography.fontFamily.devanagari,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  label: {
    fontFamily: typography.fontFamily.primary,
    marginTop: 2,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export const OffboardCellView = React.memo(OffboardCellViewComponent);
OffboardCellView.displayName = 'OffboardCellView';
