/**
 * Board layout engine (pure).
 *
 * Converts the dataset's device-independent row/col grid into responsive pixel
 * coordinates for a given container size. No React, no side effects — fully
 * unit-testable and reusable.
 *
 * The Y axis is flipped so that row 0 (cell 1, the soul's birth) sits at the
 * BOTTOM of the board and the highest row (Moksha) sits at the top, matching
 * the upward spiritual journey.
 */
import type { BoardCell } from '@/types';
import { BOARD_LAYOUT } from '@/constants';
import { clamp } from '@/utils';
import type {
  BoardBounds,
  BoardDimensions,
  BoardLayout,
  ContainerSize,
  PositionedCell,
} from '../types';

/** Derive the grid extent (columns/rows) from the cells' row/col values. */
export function computeBoardBounds(cells: BoardCell[]): BoardBounds {
  let maxCol = 0;
  let maxRow = 0;
  for (const cell of cells) {
    if (cell.col > maxCol) {
      maxCol = cell.col;
    }
    if (cell.row > maxRow) {
      maxRow = cell.row;
    }
  }
  return {
    columns: cells.length > 0 ? maxCol + 1 : 0,
    rows: cells.length > 0 ? maxRow + 1 : 0,
  };
}

/**
 * Compute pixel dimensions for the board.
 *
 * The cell size is derived from the container WIDTH so that the columns fill
 * the screen and each cell stays large enough to read its contents. The board
 * height then grows with the number of rows and is meant to be scrolled
 * (Phase 3 replaces scrolling with gesture-based zoom/pan). The cell size is
 * clamped to sane bounds so very wide (tablet) or very narrow screens still
 * behave.
 */
export function computeBoardDimensions(
  bounds: BoardBounds,
  container: ContainerSize,
): BoardDimensions {
  const { padding, minCellSize, maxCellSize } = BOARD_LAYOUT;

  const availableWidth = Math.max(0, container.width - padding * 2);
  const sizeByWidth = bounds.columns > 0 ? availableWidth / bounds.columns : 0;
  const cellSize = clamp(Math.floor(sizeByWidth), minCellSize, maxCellSize);

  return {
    columns: bounds.columns,
    rows: bounds.rows,
    cellSize,
    boardWidth: cellSize * bounds.columns,
    boardHeight: cellSize * bounds.rows,
  };
}

/** Resolve each cell to absolute pixel coordinates within the board. */
export function layoutCells(
  cells: BoardCell[],
  dimensions: BoardDimensions,
): PositionedCell[] {
  const { cellSize, rows } = dimensions;
  return cells.map(cell => ({
    ...cell,
    x: cell.col * cellSize,
    // Flip the Y axis: row 0 at the bottom, highest row at the top.
    y: (rows - 1 - cell.row) * cellSize,
    size: cellSize,
  }));
}

/** Full layout pass: bounds -> dimensions -> positioned cells. */
export function computeBoardLayout(
  cells: BoardCell[],
  container: ContainerSize,
): BoardLayout {
  const bounds = computeBoardBounds(cells);
  const dimensions = computeBoardDimensions(bounds, container);
  const positionedCells = layoutCells(cells, dimensions);
  return { dimensions, positionedCells };
}
