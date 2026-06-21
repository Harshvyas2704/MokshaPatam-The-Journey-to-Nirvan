/**
 * BoardCellView — renders a single positioned board cell.
 *
 * Memoized: with stable positioned-cell references (the layout is memoized),
 * cells only re-render when the layout actually changes. Visual treatment is
 * driven by the cell `type`, using the heritage palette.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_LAYOUT, colors, typography } from '@/constants';
import { ladderEnds, snakeHeads } from '@/data';
import { clamp } from '@/utils';
import type { PositionedCell } from '../types';

interface CellVisual {
  background: string;
  border: string;
  label: string;
}

/**
 * Cells are light "manuscript" tiles by default. Role tints them:
 *   - a ladder DESTINATION (a square a ladder reaches) → light green
 *   - a snake HEAD (a square a snake starts on)        → light red
 * Moksha (the goal) keeps its golden glow. Ladder-end wins over snake-head when
 * a square is both, matching the reference board.
 */
function getCellVisual(cell: PositionedCell): CellVisual {
  if (cell.type === 'moksha') {
    return { background: colors.gold, border: colors.moksha, label: colors.background };
  }
  if (ladderEnds.has(cell.id)) {
    return { background: colors.cellLadderBg, border: colors.cellLadderBorder, label: colors.cellText };
  }
  if (snakeHeads.has(cell.id)) {
    return { background: colors.cellSnakeBg, border: colors.cellSnakeBorder, label: colors.cellText };
  }
  return { background: colors.cellBg, border: colors.cellBorder, label: colors.cellText };
}

interface BoardCellViewProps {
  cell: PositionedCell;
}

const BoardCellViewComponent: React.FC<BoardCellViewProps> = ({ cell }) => {
  const visual = getCellVisual(cell);
  const inset = BOARD_LAYOUT.cellInset;
  const sanskritSize = clamp(Math.round(cell.size * 0.15), 10, 20);
  const numberSize = clamp(Math.round(cell.size * 0.1), 8, 13);

  return (
    <View
      style={[
        styles.cell,
        {
          left: cell.x + inset,
          top: cell.y + inset,
          width: cell.size - inset * 2,
          height: cell.size - inset * 2,
          backgroundColor: visual.background,
          borderColor: visual.border,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${cell.id}. ${cell.title}`}>
      <Text
        style={[styles.sanskrit, { color: visual.label, fontSize: sanskritSize }]}
        numberOfLines={3}
        ellipsizeMode="tail">
        {cell.sanskrit ?? String(cell.id)}
      </Text>
      <Text
        style={[styles.id, { color: visual.label, fontSize: numberSize }]}
        numberOfLines={1}>
        {cell.id}
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
  id: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 3,
    opacity: 0.7,
  },
});

export const BoardCellView = React.memo(BoardCellViewComponent);
BoardCellView.displayName = 'BoardCellView';
