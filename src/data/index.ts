/**
 * Dataset barrel + aggregate.
 *
 * Consumers should import the dataset from here. When the real 285-cell data
 * is supplied, only the individual files change — this aggregate stays stable.
 */
import type { BoardData } from '@/types';
import { boardCells } from './boardCells';
import { snakes } from './snakes';
import { ladders } from './ladders';
import { concepts } from './concepts';

export { boardCells } from './boardCells';
export { snakes } from './snakes';
export { ladders } from './ladders';
export { concepts } from './concepts';

/** The full (placeholder) board dataset as a single object. */
export const boardData: BoardData = {
  cells: boardCells,
  snakes,
  ladders,
  concepts,
};
