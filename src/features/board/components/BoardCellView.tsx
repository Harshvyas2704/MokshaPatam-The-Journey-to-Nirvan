/**
 * BoardCellView — renders a single positioned board cell.
 *
 * Memoized: with stable positioned-cell references (the layout is memoized),
 * cells only re-render when the layout actually changes. Visual treatment is
 * driven by the cell `type`, using the heritage palette.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CellType } from '@/types';
import { BOARD_LAYOUT, colors, typography } from '@/constants';
import { clamp } from '@/utils';
import type { PositionedCell } from '../types';

interface CellVisual {
  background: string;
  border: string;
  label: string;
}

const CELL_VISUALS: Record<CellType, CellVisual> = {
  square: {
    background: colors.surface,
    border: colors.border,
    label: colors.textSecondary,
  },
  concept: {
    background: colors.surfaceMuted,
    border: colors.copper,
    label: colors.ivory,
  },
  realm: {
    background: colors.maroon,
    border: colors.copper,
    label: colors.ivory,
  },
  moksha: {
    background: colors.gold,
    border: colors.moksha,
    label: colors.background,
  },
};

interface BoardCellViewProps {
  cell: PositionedCell;
}

const BoardCellViewComponent: React.FC<BoardCellViewProps> = ({ cell }) => {
  const visual = CELL_VISUALS[cell.type];
  const inset = BOARD_LAYOUT.cellInset;
  const fontSize = clamp(Math.round(cell.size * 0.32), 11, 22);

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
      accessibilityLabel={cell.title}>
      <Text style={[styles.id, { color: visual.label, fontSize }]} numberOfLines={1}>
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
    borderRadius: 6,
  },
  id: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export const BoardCellView = React.memo(BoardCellViewComponent);
BoardCellView.displayName = 'BoardCellView';
