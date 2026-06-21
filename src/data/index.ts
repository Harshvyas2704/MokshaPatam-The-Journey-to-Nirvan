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

export { boardCells, COLUMN_COUNT, TOTAL_CELLS } from './boardCells';
export { cellNamesEnglish } from './cellNamesEnglish';
export { cellNamesSanskrit } from './cellNamesSanskrit';
export {
  snakes,
  snakesRaw,
  offboardSnakes,
  snakeHeads,
  snakeTails,
  snakeTailFrom,
  snakeToHell,
  SNAKE_WAYPOINTS,
} from './snakes';
export {
  ladders,
  laddersRaw,
  offboardLadders,
  ladderStarts,
  ladderEnds,
  ladderEndFrom,
} from './ladders';
export { concepts } from './concepts';
export {
  getCellConnections,
  endpointLabel,
  cellEnglishName,
  REALM_GLOSS,
  type CellConnection,
  type Endpoint,
} from './connections';
export {
  JANMASTHAN,
  JANMASTHAN_KEY,
  REALM,
  OFFBOARD_CELLS,
  OFFBOARD_BANDS,
  isMahanarak,
  isNarak,
  isDeathRealm,
  positionKey,
  type OffboardCellDef,
} from './realms';

/** The full (placeholder) board dataset as a single object. */
export const boardData: BoardData = {
  cells: boardCells,
  snakes,
  ladders,
  concepts,
};
