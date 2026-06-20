/**
 * Game-state domain types.
 *
 * Mirrors the state shape described in the master prompt. Game LOGIC is not
 * implemented in Phase 1 — these types only define the contract that the
 * store and later phases (dice, movement, snakes/ladders) will fulfil.
 */

/** High-level lifecycle of a game session. */
export type GameStatus = 'idle' | 'playing' | 'won' | 'paused';

/** The reason a single move resolved the way it did. */
export type MoveOutcome = 'normal' | 'bounce' | 'snake' | 'ladder' | 'win';

/**
 * A recorded move in the session history. Used for the move log / replay and
 * for derived statistics.
 */
export interface MoveHistoryEntry {
  /** Monotonic move index within the session. */
  id: number;
  /** Position before the move. */
  from: number;
  /** Position after the move (post snake/ladder resolution). */
  to: number;
  /** Dice value that triggered the move. */
  dice: number;
  /** How the move resolved. */
  outcome: MoveOutcome;
  /** Epoch milliseconds the move was recorded. */
  timestamp: number;
}

/**
 * The fully-resolved outcome of a single move, produced by the (pure) game
 * logic and consumed by the store and (later) the movement animation.
 */
export interface MoveResult {
  /** Square the move started from. */
  from: number;
  /** Dice value rolled. */
  dice: number;
  /**
   * The square-by-square walk from `from` (exclusive) to `landing` (inclusive),
   * including any bounce-back off the goal. Drives Phase 6 movement animation.
   */
  steps: number[];
  /** Square reached after walking (post bounce), before any snake/ladder. */
  landing: number;
  /** Snake tail / ladder top if `landing` is a snake head or ladder base. */
  jumpTo: number | null;
  /** Final resting square (`jumpTo ?? landing`). */
  to: number;
  /** How the move resolved. */
  outcome: MoveOutcome;
}

/**
 * The complete game state held by the Zustand store.
 */
export interface GameState {
  /** Current cell the soul token occupies (1..285). */
  currentSquare: number;
  /** Previous cell, or null at the start of a session. */
  previousSquare: number | null;
  /** Latest dice value, or null before the first roll. */
  diceValue: number | null;
  /** Whether a dice roll animation / resolution is in progress. */
  isRolling: boolean;
  /** Whether the soul token is mid-animation (walking / bouncing / jumping). */
  isMoving: boolean;
  /** Whether the soul is auto-rolling toward the goal. */
  isAutoPlaying: boolean;
  /** The most recently resolved move (drives the movement animation). */
  lastMove: MoveResult | null;
  /** Current lifecycle status. */
  gameStatus: GameStatus;
  /** Total number of dice rolls this session. */
  totalRolls: number;
  /** How many snakes the player has descended this session. */
  snakesEncountered: number;
  /** How many ladders the player has climbed this session. */
  laddersClimbed: number;
  /** Ordered history of resolved moves. */
  moveHistory: MoveHistoryEntry[];
}
