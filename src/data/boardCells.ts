/**
 * Board cells — built from the authentic Mokshapat name dataset.
 *
 * The source provides English + Sanskrit names for all 285 squares but NO
 * positions, so the row/col layout is generated here: an 8-wide boustrophedon
 * (serpentine) grid (8 × 36, last row partial) with cell 1 at the bottom-left,
 * snaking upward to 285. Fewer columns means larger, readable squares. Positions
 * are device-independent layout units — the renderer converts them to pixels.
 *
 * This generated layout is a faithful, readable default; authentic board
 * coordinates (oval ring, custom upper arrangement) can replace the row/col
 * computation later without touching the rest of the app.
 */
import type { BoardCell, CellType } from '@/types';
import { cellNamesEnglish } from './cellNamesEnglish';
import { cellNamesSanskrit } from './cellNamesSanskrit';

/** Total squares on the journey. */
export const TOTAL_CELLS = 285;
/** Columns in the generated serpentine grid (max 8 → larger squares). */
export const COLUMN_COUNT = 8;

const GOAL = 285;

/** Classify a cell from its names (realms carry "लोक" / "Lok" / "Realm"). */
function inferType(id: number, sanskrit: string, english: string): CellType {
  if (id === GOAL) {
    return 'moksha';
  }
  if (/लोक/.test(sanskrit) || /\bLok\b/.test(english) || /\bRealm\b/.test(english)) {
    return 'realm';
  }
  return 'square';
}

export const boardCells: BoardCell[] = Array.from(
  { length: TOTAL_CELLS },
  (_, i): BoardCell => {
    const id = i + 1;
    const row = Math.floor(i / COLUMN_COUNT); // row 0 = bottom (cell 1)
    const offset = i % COLUMN_COUNT;
    // Boustrophedon: even rows run left→right, odd rows right→left.
    const col = row % 2 === 0 ? offset : COLUMN_COUNT - 1 - offset;

    const english = cellNamesEnglish[id] ?? `Square ${id}`;
    const sanskrit = cellNamesSanskrit[id];

    return {
      id,
      row,
      col,
      title: english,
      sanskrit,
      type: inferType(id, sanskrit ?? '', english),
    };
  },
);
