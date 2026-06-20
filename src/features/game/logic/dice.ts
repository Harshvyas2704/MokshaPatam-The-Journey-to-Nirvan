/**
 * Dice rolling.
 *
 * The only non-pure piece of the game logic (uses Math.random). Kept tiny and
 * isolated so the rest of the logic stays deterministic and testable.
 */
import { DICE_MAX, DICE_MIN } from '@/constants';

/** Roll a single die, inclusive of both bounds. */
export function rollDie(min: number = DICE_MIN, max: number = DICE_MAX): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
