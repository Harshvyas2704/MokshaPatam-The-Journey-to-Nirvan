/**
 * Gameplay rule constants.
 *
 * Game LOGIC is implemented in later phases; these are the tunable numbers
 * that logic will reference, kept out of components to avoid magic numbers.
 */
import { FIRST_CELL, LAST_CELL } from './board';

/** Inclusive dice range. */
export const DICE_MIN = 1;
export const DICE_MAX = 6;

/** Where the soul begins. */
export const START_SQUARE = FIRST_CELL;

/** The square the soul must land on EXACTLY to win. */
export const GOAL_SQUARE = LAST_CELL;

/**
 * When a roll would overshoot the goal, the soul bounces backward by the
 * remaining steps rather than winning. This flag documents that rule for the
 * movement engine (Phase 5/6).
 */
export const BOUNCE_BACK_ON_OVERSHOOT = true;

/**
 * Delay between automatic rolls when auto-play is active (ms). Slow enough that
 * each move is readable; Phase 6 movement animation will play within this gap.
 */
export const AUTO_ROLL_INTERVAL_MS = 750;
