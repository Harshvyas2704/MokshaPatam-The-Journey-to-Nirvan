/**
 * Board cells — built from the authentic Mokshapat name dataset.
 *
 * The source provides English + Sanskrit names for all 285 squares but NO
 * positions, so the row/col layout is generated here as a 12-wide boustrophedon
 * (serpentine) grid that starts from the CENTRE of the board:
 *
 *   - Bottom row (row 0) holds only squares 5,4,3,2,1 (cols 0..4). Square 1
 *     sits near centre; the off-board जन्मस्थान (start) and मरण cells fill the
 *     two columns to its right (see realms.ts), and the नरक / grave cells sit in
 *     the band directly below.
 *   - From square 6 onward every row is a full 12 squares, snaking upward:
 *     square 6 sits directly above square 5, so the serpentine stays adjacent.
 *   - This makes square 233 land exactly at the end of row 19 (5 + 19×12), the
 *     last dense row below the Harihar Kshetra / upper oval section (234..285).
 *
 * Positions are device-independent layout units — the renderer converts them to
 * pixels (all cells render at one uniform size).
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
/** Columns in the generated serpentine grid (12 squares per full row). */
export const COLUMN_COUNT = 12;
/** Squares in the partial bottom row (5,4,3,2,1), before the grid fills out. */
const FIRST_ROW_SQUARES = 5;

const GOAL = 285;

/**
 * Resolve a square's serpentine row/col.
 *  - Squares 1..5 occupy the bottom row (row 0): square 1 at col 4 (near centre)
 *    down to square 5 at col 0, so square 6 sits directly above square 5.
 *  - Squares 6+ form full 12-wide rows from row 1 up, alternating direction
 *    (even rows run left→right, odd rows right→left) for a continuous snake.
 */
function gridPosition(id: number): { row: number; col: number } {
  if (id <= FIRST_ROW_SQUARES) {
    return { row: 0, col: FIRST_ROW_SQUARES - id };
  }
  const k = id - (FIRST_ROW_SQUARES + 1);
  const r = Math.floor(k / COLUMN_COUNT);
  const offset = k % COLUMN_COUNT;
  return {
    row: r + 1,
    col: r % 2 === 0 ? offset : COLUMN_COUNT - 1 - offset,
  };
}

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
    const { row, col } = gridPosition(id);

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
