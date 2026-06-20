/**
 * Unit tests for the pure board layout engine.
 */
import type { BoardCell } from '@/types';
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
  it('fits the grid within the container and clamps the cell size', () => {
    const bounds = { columns: 2, rows: 3 };
    const dims = computeBoardDimensions(bounds, { width: 400, height: 900 });
    // maxCellSize (120) caps the otherwise-large fit.
    expect(dims.cellSize).toBe(120);
    expect(dims.boardWidth).toBe(240);
    expect(dims.boardHeight).toBe(360);
  });
});

describe('layoutCells', () => {
  it('flips the Y axis so row 0 sits at the bottom', () => {
    const dims = computeBoardDimensions(
      { columns: 2, rows: 3 },
      { width: 400, height: 900 },
    );
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
    const layout = computeBoardLayout(cells, { width: 400, height: 900 });
    expect(layout.positionedCells).toHaveLength(cells.length);
  });
});
