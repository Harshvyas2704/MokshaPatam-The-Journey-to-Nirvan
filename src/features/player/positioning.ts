/**
 * Soul-token positioning (pure).
 *
 * Converts a positioned board cell into the soul token's center point. Kept
 * pure so it is unit-testable and free of any board/runtime coupling (the cell
 * type is imported as a type only).
 */
import type { PositionedCell } from '@/features/board/types';
import { SOUL_TOKEN } from '@/constants';

export interface SoulCenter {
  /** X of the cell center, in board pixels. */
  centerX: number;
  /** Y of the cell center, in board pixels. */
  centerY: number;
  /** The cell's size — the token scales relative to it. */
  cellSize: number;
}

/** Center the token on the given cell. */
export function getSoulCenter(cell: PositionedCell): SoulCenter {
  return {
    centerX: cell.x + cell.size / 2,
    centerY: cell.y + cell.size / 2,
    cellSize: cell.size,
  };
}

/**
 * The pixel size of the square box the orb (incl. its outermost halo) occupies.
 * The movement layer uses this to offset the token so its center lands on the
 * cell center. Shared with SoulToken so both agree on sizing.
 */
export function getSoulBoxSize(cellSize: number): number {
  return cellSize * SOUL_TOKEN.auraRatio * SOUL_TOKEN.ringMaxScale;
}
