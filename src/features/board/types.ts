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
  /** Edge length of a single (lower-grid) square cell slot (px). */
  cellSize: number;
  /** Edge length of an upper-section cell slot (px); 0 when no upper section. */
  upperCell: number;
  /** Height (px) reserved above the lower grid for the scattered upper section. */
  upperHeight: number;
  /** Total board width in px (columns * cellSize). */
  boardWidth: number;
  /** Total board height in px (upperHeight + lower grid + off-board bands). */
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

/** An off-board realm / janmasthan cell, resolved to pixel coordinates. */
export interface PositionedOffboardCell {
  /** Layout key: the realm string, or 'JANMASTHAN'. */
  key: string;
  sanskrit: string;
  english: string;
  kind: 'start' | 'narak';
  x: number;
  y: number;
  size: number;
}

/** Absolute box of the central sacred medallion (हरिहर क्षेत्र). */
export interface MedallionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The complete output of the layout engine. */
export interface BoardLayout {
  dimensions: BoardDimensions;
  positionedCells: PositionedCell[];
  /** Realm / janmasthan cells in the band below the board. */
  offboardCells: PositionedOffboardCell[];
  /** Central medallion at the heart of the oval ring; null without it. */
  medallion: MedallionBox | null;
}
