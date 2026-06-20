/**
 * PLACEHOLDER board generator — PREVIEW ONLY.
 *
 * ⚠️ This does NOT represent the authentic Mokshapat board. It procedurally
 * produces a small serpentine grid of generic cells so the Phase 2 layout
 * engine and renderer have something meaningful to draw before the real
 * 285-cell dataset is supplied.
 *
 * The real data will replace the arrays in `boardCells.ts` etc.; this generator
 * can simply be deleted at that point — no architectural change required.
 */
import type { BoardCell, CellType } from '@/types';

export interface PlaceholderBoardOptions {
  /** Number of columns in the serpentine grid. */
  columns: number;
  /** Total number of cells to generate (last cell becomes Moksha). */
  count: number;
}

/**
 * Default preview shape.
 *
 * 285 cells to mirror the real board's count, and 7 columns so each cell is
 * wide enough to read on a phone (the authentic board uses 12 columns with a
 * larger, scroll/zoomed surface — that arrives with the real dataset).
 */
export const PLACEHOLDER_BOARD_OPTIONS: PlaceholderBoardOptions = {
  columns: 6,
  count: 285,
};

/**
 * Generate placeholder cells laid out as a boustrophedon (serpentine):
 * row 0 runs left→right, row 1 right→left, and so on. Cell 1 sits on row 0 so
 * the renderer (which flips the Y axis) places the start at the bottom and
 * Moksha at the top — matching the soul's upward journey.
 */
export function generatePlaceholderCells(
  options: PlaceholderBoardOptions = PLACEHOLDER_BOARD_OPTIONS,
): BoardCell[] {
  const { columns, count } = options;
  const cells: BoardCell[] = [];

  for (let index = 0; index < count; index++) {
    const id = index + 1;
    const row = Math.floor(index / columns);
    const indexInRow = index % columns;
    const col = row % 2 === 0 ? indexInRow : columns - 1 - indexInRow;

    let type: CellType = 'square';
    if (id === count) {
      type = 'moksha';
    } else if (id % 17 === 0) {
      type = 'realm';
    } else if (id % 7 === 0) {
      type = 'concept';
    }

    cells.push({
      id,
      row,
      col,
      title: type === 'moksha' ? 'Placeholder — Moksha' : `Placeholder ${id}`,
      type,
    });
  }

  return cells;
}
