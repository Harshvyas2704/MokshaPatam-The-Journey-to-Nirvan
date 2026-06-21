/**
 * Board jump maps.
 *
 * Reduces the snake/ladder datasets into fast lookups for the move logic:
 *   - numeric snakes / ladders (square -> square),
 *   - off-board snakes (square -> realm) and ladders (square -> realm),
 *   - realm chains (realm -> realm/grave), e.g. बेहस्त लोक -> मृत्यू उर्फ कबर.
 *
 * Built once at module load from `@/data`.
 */
import { offboardLadders, snakes, ladders, snakeToHell } from '@/data';

/** Numeric square -> numeric square. */
export type JumpMap = Record<number, number>;

/** Numeric snake head -> tail. */
export const snakeMap: JumpMap = snakes.reduce<JumpMap>((acc, snake) => {
  acc[snake.from] = snake.to;
  return acc;
}, {});

/** Numeric ladder base -> top. */
export const ladderMap: JumpMap = ladders.reduce<JumpMap>((acc, ladder) => {
  acc[ladder.from] = ladder.to;
  return acc;
}, {});

/** Numeric square (snake head) -> off-board realm. */
export const snakeHellMap: Record<number, string> = {};
/** Realm -> realm/grave chain (off-board origins). */
export const realmChainMap: Record<string, string> = {};
for (const [key, dest] of Object.entries(snakeToHell)) {
  const n = Number(key);
  if (Number.isNaN(n)) {
    realmChainMap[key] = dest;
  } else {
    snakeHellMap[n] = dest;
  }
}

/** Numeric ladder base -> off-board realm. */
export const ladderOffboardMap: Record<number, string> = offboardLadders.reduce<
  Record<number, string>
>((acc, l) => {
  acc[l.from] = l.to;
  return acc;
}, {});
