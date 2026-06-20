/**
 * Board-feature layout types.
 *
 * These describe the *rendered* board (pixels), as opposed to the dataset types
 * in `@/types` which describe the abstract, device-independent board.
 */
import type { BoardCell } from '@/types';

/** Discrete grid extent derived from the dataset's row/col values. */
export interface BoardBounds {
  /** Number of columns (max col + 1). */
  columns: number;
  /** Number of rows (max row + 1). */
  rows: number;
}

/** A container's measured pixel size. */
export interface ContainerSize {
  width: number;
  height: number;
}

/** Fully resolved pixel dimensions of the board for a given container. */
export interface BoardDimensions extends BoardBounds {
  /** Edge length of a single square cell slot (px). */
  cellSize: number;
  /** Total board width in px (columns * cellSize). */
  boardWidth: number;
  /** Total board height in px (rows * cellSize). */
  boardHeight: number;
}

/** A dataset cell resolved to absolute pixel coordinates within the board. */
export interface PositionedCell extends BoardCell {
  /** Left offset (px) of the cell slot within the board. */
  x: number;
  /** Top offset (px) of the cell slot within the board. */
  y: number;
  /** Edge length (px) of the cell slot. */
  size: number;
}

/** The complete output of the layout engine. */
export interface BoardLayout {
  dimensions: BoardDimensions;
  positionedCells: PositionedCell[];
}
