/**
 * Board layout engine (pure).
 *
 * Converts the dataset's device-independent grid into responsive pixel
 * coordinates. The board is a HYBRID:
 *
 *   - Lower section (cells 1..233): a dense 14-wide serpentine grid. Row 0
 *     (cell 1, the soul's birth) sits at the BOTTOM; the journey climbs upward.
 *   - Upper section (cells 234..285): a SPARSE, non-grid arrangement matching
 *     the traditional board — an oval ring of "loka" cells (234..248) and a
 *     centred pyramid of the highest realms (249..285) at the very top.
 *
 * Every cell renders at one UNIFORM size (`baseCellSize`), lower grid and upper
 * section alike.
 *
 * No React, no side effects — fully unit-testable.
 */
import type { BoardCell } from '@/types';
import { BOARD_LAYOUT } from '@/constants';
import { OFFBOARD_BANDS, OFFBOARD_CELLS } from '@/data';
import type {
  BoardBounds,
  BoardDimensions,
  BoardLayout,
  PositionedCell,
  PositionedOffboardCell,
} from '../types';

/** Last cell of the dense lower serpentine grid. */
const LOWER_LAST = 233;
/** First / last cell of the upper oval ring of loka cells. */
const OVAL_FIRST = 234;
const OVAL_LAST = 248;

/**
 * The centred pyramid of the highest realms (249..285), top row first and each
 * row listed left→right (descending), matching the traditional board.
 */
const PYRAMID_ROWS: readonly (readonly number[])[] = [
  [285, 284, 283],
  [282],
  [281, 280, 279, 278, 277, 276, 275, 274, 273, 272],
  [271, 270, 269, 268, 267],
  [266, 265, 264, 263, 262, 261],
  [260, 259, 258, 257, 256, 255, 254, 253, 252, 251, 250, 249],
];

/** Vertical rows reserved for the oval ring, in upper-cell units. */
const OVAL_BAND_ROWS = 6;
/** Oval ring radii as a fraction of the board width / oval band height. */
const OVAL_RADIUS_X_RATIO = 0.4;
const OVAL_RADIUS_Y_RATIO = 0.4;
/** Central medallion edge length relative to a normal cell (a little bigger). */
const MEDALLION_CELL_SCALE = 1.4;

/** Whether a set of cells contains the sparse upper section. */
function hasUpperSection(cells: BoardCell[]): boolean {
  return cells.some(cell => cell.id >= OVAL_FIRST);
}

/** Derive the lower-grid extent (columns/rows) from the cells' row/col values. */
export function computeBoardBounds(cells: BoardCell[]): BoardBounds {
  let maxCol = 0;
  let maxRow = 0;
  let count = 0;
  for (const cell of cells) {
    if (cell.id > LOWER_LAST) {
      continue; // upper cells are positioned separately, not on the grid
    }
    count++;
    if (cell.col > maxCol) {
      maxCol = cell.col;
    }
    if (cell.row > maxRow) {
      maxRow = cell.row;
    }
  }
  return {
    columns: count > 0 ? maxCol + 1 : 0,
    rows: count > 0 ? maxRow + 1 : 0,
  };
}

/**
 * Compute pixel dimensions for the board.
 *
 * Every cell has the SAME fixed on-screen size at 100% zoom (`baseCellSize`) —
 * the upper section uses the same `upperCell` as the lower grid, and reserves
 * `upperHeight` of vertical space at the top for the oval ring + pyramid.
 */
export function computeBoardDimensions(
  bounds: BoardBounds,
  hasUpper = false,
): BoardDimensions {
  const cellSize = BOARD_LAYOUT.baseCellSize;
  const boardWidth = cellSize * bounds.columns;
  // Uniform sizing: upper-section cells are the same size as lower-grid cells.
  const upperCell = hasUpper ? cellSize : 0;
  const upperHeight = hasUpper
    ? (PYRAMID_ROWS.length + OVAL_BAND_ROWS) * upperCell
    : 0;

  return {
    columns: bounds.columns,
    rows: bounds.rows,
    cellSize,
    upperCell,
    upperHeight,
    boardWidth,
    // upper section + lower grid + the off-board realm bands below square 1.
    boardHeight: upperHeight + (bounds.rows + OFFBOARD_BANDS) * cellSize,
  };
}

/** The pixel center of a positioned (square or off-board) cell. */
export function getCellCenter(cell: {
  x: number;
  y: number;
  size: number;
}): { x: number; y: number } {
  return { x: cell.x + cell.size / 2, y: cell.y + cell.size / 2 };
}

/** Resolve the lower-grid cells (1..233) to absolute pixel coordinates. */
export function layoutCells(
  cells: BoardCell[],
  dimensions: BoardDimensions,
): PositionedCell[] {
  const { cellSize, rows, upperHeight } = dimensions;
  return cells
    .filter(cell => cell.id <= LOWER_LAST)
    .map(cell => ({
      ...cell,
      x: cell.col * cellSize,
      // Below the upper section; flip Y so row 0 sits at the bottom of the grid.
      y: upperHeight + (rows - 1 - cell.row) * cellSize,
      size: cellSize,
    }));
}

/**
 * Resolve the sparse upper-section cells (234..285): an oval ring of loka cells
 * and a centred pyramid of the highest realms, all within the board width.
 */
export function layoutUpper(
  cells: BoardCell[],
  dimensions: BoardDimensions,
): PositionedCell[] {
  const upper = cells.filter(cell => cell.id >= OVAL_FIRST);
  if (upper.length === 0) {
    return [];
  }
  const { boardWidth, upperCell } = dimensions;
  const byId = new Map(upper.map(cell => [cell.id, cell]));
  const result: PositionedCell[] = [];

  // Pyramid: each row centred horizontally, stacked from the top.
  PYRAMID_ROWS.forEach((ids, rowIndex) => {
    const rowWidth = ids.length * upperCell;
    const startX = (boardWidth - rowWidth) / 2;
    const y = rowIndex * upperCell;
    ids.forEach((id, col) => {
      const cell = byId.get(id);
      if (cell) {
        result.push({ ...cell, x: startX + col * upperCell, y, size: upperCell });
      }
    });
  });

  // Oval ring (234..248) below the pyramid.
  const pyramidHeight = PYRAMID_ROWS.length * upperCell;
  const ovalBandHeight = OVAL_BAND_ROWS * upperCell;
  const cx = boardWidth / 2;
  const cy = pyramidHeight + ovalBandHeight / 2;
  const radiusX = boardWidth * OVAL_RADIUS_X_RATIO;
  const radiusY = ovalBandHeight * OVAL_RADIUS_Y_RATIO;
  const ovalCount = OVAL_LAST - OVAL_FIRST + 1;
  for (let k = 0; k < ovalCount; k++) {
    const cell = byId.get(OVAL_FIRST + k);
    if (!cell) {
      continue;
    }
    // Distribute evenly around the ellipse, starting at the bottom.
    const angle = Math.PI / 2 + (k / ovalCount) * Math.PI * 2;
    const px = cx + radiusX * Math.cos(angle);
    const py = cy + radiusY * Math.sin(angle);
    result.push({
      ...cell,
      x: px - upperCell / 2,
      y: py - upperCell / 2,
      size: upperCell,
    });
  }

  return result;
}

/**
 * The sacred central medallion (हरिहर क्षेत्र) sits at the heart of the oval
 * ring. Returns its absolute box, or null when there is no upper section.
 */
export function computeMedallion(
  dimensions: BoardDimensions,
): { x: number; y: number; width: number; height: number } | null {
  const { boardWidth, upperCell } = dimensions;
  if (upperCell <= 0) {
    return null;
  }
  const pyramidHeight = PYRAMID_ROWS.length * upperCell;
  const ovalBandHeight = OVAL_BAND_ROWS * upperCell;
  // Same center the oval ring is built around (see layoutUpper).
  const cx = boardWidth / 2;
  const cy = pyramidHeight + ovalBandHeight / 2;
  // A square the size of a cell, just a little bigger.
  const size = upperCell * MEDALLION_CELL_SCALE;
  return { x: cx - size / 2, y: cy - size / 2, width: size, height: size };
}

/** Place the off-board realm cells in the band(s) below the grid. */
export function layoutOffboard(
  dimensions: BoardDimensions,
): PositionedOffboardCell[] {
  const { cellSize, rows, upperHeight } = dimensions;
  return OFFBOARD_CELLS.map(def => ({
    key: def.key,
    sanskrit: def.sanskrit,
    english: def.english,
    kind: def.kind,
    x: def.col * cellSize,
    // Below the lower grid: band 0 sits just under square 1's row.
    y: upperHeight + (rows + def.band) * cellSize,
    size: cellSize,
  }));
}

/** Full layout pass: bounds -> dimensions -> lower + upper + off-board cells. */
export function computeBoardLayout(cells: BoardCell[]): BoardLayout {
  const bounds = computeBoardBounds(cells);
  const dimensions = computeBoardDimensions(bounds, hasUpperSection(cells));
  const positionedCells = [
    ...layoutCells(cells, dimensions),
    ...layoutUpper(cells, dimensions),
  ];
  const offboardCells = layoutOffboard(dimensions);
  const medallion = computeMedallion(dimensions);
  return { dimensions, positionedCells, offboardCells, medallion };
}
