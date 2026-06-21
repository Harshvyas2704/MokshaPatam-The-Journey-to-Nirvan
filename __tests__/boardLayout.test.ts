/**
 * Unit tests for the pure board layout engine.
 */
import type { BoardCell } from '@/types';
import { boardCells } from '@/data';
import {
  computeBoardBounds,
  computeBoardDimensions,
  computeBoardLayout,
  layoutCells,
} from '@/features/board/layout';

const cells: BoardCell[] = [
  { id: 1, row: 0, col: 0, title: '1', type: 'square' },
  { id: 2, row: 0, col: 1, title: '2', type: 'square' },
  { id: 3, row: 1, col: 1, title: '3', type: 'square' },
  { id: 4, row: 2, col: 0, title: '4', type: 'moksha' },
];

describe('computeBoardBounds', () => {
  it('derives columns/rows from max col/row', () => {
    expect(computeBoardBounds(cells)).toEqual({ columns: 2, rows: 3 });
  });

  it('returns zeroes for an empty board', () => {
    expect(computeBoardBounds([])).toEqual({ columns: 0, rows: 0 });
  });
});

describe('computeBoardDimensions', () => {
  it('uses the fixed base cell size', () => {
    const bounds = { columns: 2, rows: 3 };
    const dims = computeBoardDimensions(bounds);
    expect(dims.cellSize).toBe(64); // BOARD_LAYOUT.baseCellSize
    expect(dims.boardWidth).toBe(128);
    // Height includes the 2 off-board realm bands: (3 + 2) * 64.
    expect(dims.boardHeight).toBe(320);
  });
});

describe('layoutCells', () => {
  it('flips the Y axis so row 0 sits at the bottom', () => {
    const dims = computeBoardDimensions({ columns: 2, rows: 3 });
    const positioned = layoutCells(cells, dims);
    const cell1 = positioned.find(c => c.id === 1)!;
    const moksha = positioned.find(c => c.id === 4)!;
    // row 0 -> bottom (largest y), highest row -> top (y = 0)
    expect(cell1.y).toBe((dims.rows - 1) * dims.cellSize);
    expect(moksha.y).toBe(0);
    expect(cell1.x).toBe(0);
  });
});

describe('computeBoardLayout', () => {
  it('returns one positioned cell per input cell', () => {
    const layout = computeBoardLayout(cells);
    expect(layout.positionedCells).toHaveLength(cells.length);
  });
});

describe('hybrid upper section', () => {
  it('places the full board with a scattered upper section', () => {
    const layout = computeBoardLayout(boardCells);
    const byId = (id: number) =>
      layout.positionedCells.find(c => c.id === id)!;

    // Reserves vertical space above the lower grid for the upper section.
    expect(layout.dimensions.upperHeight).toBeGreaterThan(0);
    expect(layout.positionedCells).toHaveLength(boardCells.length);

    const c1 = byId(1); // birth — bottom of the lower grid
    const c285 = byId(285); // pyramid apex — top of the board
    const c234 = byId(234); // oval ring — between the two

    // Every cell renders at one uniform size (upper section == lower grid).
    expect(c285.size).toBe(c1.size);
    expect(c234.size).toBe(c1.size);

    // Vertical order: apex above the oval ring, ring above the lower grid.
    expect(c285.y).toBeLessThan(c234.y);
    expect(c234.y).toBeLessThan(c1.y);
    // Cell 1 sits below the entire upper section.
    expect(c1.y).toBeGreaterThanOrEqual(layout.dimensions.upperHeight);

    // The central medallion is horizontally centered, within the oval band.
    const medallion = layout.medallion!;
    expect(medallion).not.toBeNull();
    const medallionCenterX = medallion.x + medallion.width / 2;
    expect(medallionCenterX).toBeCloseTo(layout.dimensions.boardWidth / 2);
    expect(medallion.y).toBeGreaterThan(0);
    expect(medallion.y).toBeLessThan(layout.dimensions.upperHeight);
  });
});
