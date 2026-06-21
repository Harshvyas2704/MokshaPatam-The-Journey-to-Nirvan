/**
 * Gameplay rule constants.
 *
 * Game LOGIC is implemented in later phases; these are the tunable numbers
 * that logic will reference, kept out of components to avoid magic numbers.
 */
import { LAST_CELL } from './board';

/** Inclusive dice range. */
export const DICE_MIN = 1;
export const DICE_MAX = 6;

/** Where the soul begins: janmasthan (off-board position 0). */
export const START_SQUARE = 0;

/** The square that completes the journey to Moksha. */
export const GOAL_SQUARE = LAST_CELL;

/**
 * Delay between automatic rolls when auto-play is active (ms). Slow enough that
 * each move is readable; Phase 6 movement animation will play within this gap.
 */
export const AUTO_ROLL_INTERVAL_MS = 750;
