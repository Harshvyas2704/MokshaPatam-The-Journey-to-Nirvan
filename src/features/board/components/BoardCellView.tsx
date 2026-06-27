/**
 * BoardCellView — renders a single positioned board cell.
 *
 * Memoized: with stable positioned-cell references (the layout is memoized),
 * cells only re-render when the layout actually changes. Visual treatment is
 * driven by the cell `type` and its snake/ladder role, using the heritage
 * palette.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BOARD_LAYOUT, colors, typography } from '@/constants';
import { ladderEnds, ladderStarts, snakeHeads, snakeTails } from '@/data';
import { clamp } from '@/utils';
import type { PositionedCell } from '../types';

/** Cell corner radius — shared by the tile and its gradient fill rect. */
const CELL_RADIUS = 8;

/** How the cell paints its background: a flat tile or a tinted gradient. */
type Fill =
  | { kind: 'flat'; color: string }
  | { kind: 'gradient'; from: string; to: string };

interface CellVisual {
  fill: Fill;
  border: string;
  /** Thicker, saturated outline when the square is part of a snake/ladder. */
  borderWidth: number;
  label: string;
}

/**
 * Cells are light "manuscript" tiles by default. Role tints them:
 *   - a ladder DESTINATION (a square a ladder reaches) → green gradient
 *   - a snake HEAD (a square a snake starts on)        → red gradient
 * Any square touched by a ladder (base/top) or snake (head/tail) also gets a
 * thicker, colored border so the connected squares stand out. Moksha keeps its
 * golden glow. Ladder role wins over snake when a square is both.
 */
function getCellVisual(cell: PositionedCell): CellVisual {
  if (cell.type === 'moksha') {
    return {
      fill: { kind: 'flat', color: colors.gold },
      border: colors.moksha,
      borderWidth: 2,
      label: colors.background,
    };
  }

  const isLadderCell = ladderStarts.has(cell.id) || ladderEnds.has(cell.id);
  const isSnakeCell = snakeHeads.has(cell.id) || snakeTails.has(cell.id);

  // Background tint: only the ladder destinations (green) and snake heads (red).
  let fill: Fill = { kind: 'flat', color: colors.cellBg };
  if (ladderEnds.has(cell.id)) {
    fill = { kind: 'gradient', from: colors.cellLadderBgFrom, to: colors.cellLadderBgTo };
  } else if (snakeHeads.has(cell.id)) {
    fill = { kind: 'gradient', from: colors.cellSnakeBgFrom, to: colors.cellSnakeBgTo };
  }

  // Border: highlight every snake/ladder square (ladder colour wins over snake).
  let border: string = colors.cellBorder;
  let borderWidth = 1;
  if (isLadderCell) {
    border = colors.cellLadderBorder;
    borderWidth = 2;
  } else if (isSnakeCell) {
    border = colors.cellSnakeBorder;
    borderWidth = 2;
  }

  return { fill, border, borderWidth, label: colors.cellText };
}

interface BoardCellViewProps {
  cell: PositionedCell;
}

const BoardCellViewComponent: React.FC<BoardCellViewProps> = ({ cell }) => {
  const visual = getCellVisual(cell);
  const inset = BOARD_LAYOUT.cellInset;
  const size = cell.size - inset * 2;
  const sanskritSize = clamp(Math.round(cell.size * 0.15), 10, 20);
  const numberSize = clamp(Math.round(cell.size * 0.1), 8, 13);
  const gradientId = `cellgrad-${cell.id}`;
  const backgroundColor =
    visual.fill.kind === 'flat' ? visual.fill.color : 'transparent';

  return (
    <View
      style={[
        styles.cell,
        {
          left: cell.x + inset,
          top: cell.y + inset,
          width: size,
          height: size,
          backgroundColor,
          borderColor: visual.border,
          borderWidth: visual.borderWidth,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${cell.id}. ${cell.title}`}>
      {visual.fill.kind === 'gradient' ? (
        <Svg style={StyleSheet.absoluteFill} width={size} height={size}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={visual.fill.from} />
              <Stop offset="1" stopColor={visual.fill.to} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={size}
            height={size}
            rx={CELL_RADIUS}
            fill={`url(#${gradientId})`}
          />
        </Svg>
      ) : null}
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
    borderRadius: CELL_RADIUS,
    paddingHorizontal: 3,
    overflow: 'hidden',
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
