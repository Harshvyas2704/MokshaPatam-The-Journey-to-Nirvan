/**
 * Board jump maps.
 *
 * Reduces the (numeric) snake and ladder datasets into fast `head/base -> dest`
 * lookups for the move logic. Built once at module load from `@/data`.
 *
 * NOTE: the real Mokshapat dataset also has off-board destinations (naraka /
 * loka). Those are non-numeric and are ignored here for now; supporting them is
 * a logic extension for when the real dataset is dropped in.
 */
import { ladders, snakes } from '@/data';
import type { JumpMap } from './movement';

/** Snake head square -> tail square. */
export const snakeMap: JumpMap = snakes.reduce<JumpMap>((acc, snake) => {
  acc[snake.from] = snake.to;
  return acc;
}, {});

/** Ladder base square -> top square. */
export const ladderMap: JumpMap = ladders.reduce<JumpMap>((acc, ladder) => {
  acc[ladder.from] = ladder.to;
  return acc;
}, {});
