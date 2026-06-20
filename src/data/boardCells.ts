/**
 * PLACEHOLDER board cells.
 *
 * ⚠️ This is NOT the real Mokshapat dataset. For Phase 2 the cells are produced
 * by a preview generator so the layout engine / renderer can be exercised. The
 * authentic 285-cell data will replace this array and must conform to
 * `BoardCell[]` — no architectural change required.
 */
import type { BoardCell } from '@/types';
import {
  generatePlaceholderCells,
  PLACEHOLDER_BOARD_OPTIONS,
} from './placeholder/generatePlaceholderBoard';

export const boardCells: BoardCell[] = generatePlaceholderCells(
  PLACEHOLDER_BOARD_OPTIONS,
);
