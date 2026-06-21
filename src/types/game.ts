/**
 * Game-state domain types.
 *
 * The soul's position can be a numbered square (1..285), the janmasthan start
 * (numeric 0), or an off-board REALM (a Devanagari string such as महानरक).
 */

/** A position on (or off) the board: 0 = janmasthan, 1..285 = squares, string = realm. */
export type Position = number | string;

/** High-level lifecycle of a game session. */
export type GameStatus = 'idle' | 'playing' | 'won';

/** How a single move resolved. */
export type MoveOutcome =
  | 'normal' // plain forward move
  | 'enter' // entered the board from janmasthan
  | 'snake' // slid down a (numeric) snake
  | 'ladder' // climbed a (numeric) ladder
  | 'narak' // fell off-board into a hell/realm
  | 'escape' // moved out of a realm (back toward the start)
  | 'blocked' // could not move (overshoot, or stuck on the grave)
  | 'win'; // reached Moksha (285)

/** One hop within a resolved move, for the move log. */
export interface MoveHop {
  to: Position;
  kind: 'walk' | 'enter' | 'snake' | 'ladder' | 'narak' | 'escape';
}

/**
 * A recorded move in the session history.
 */
export interface MoveHistoryEntry {
  id: number;
  from: Position;
  to: Position;
  dice: number;
  outcome: MoveOutcome;
  timestamp: number;
}

/**
 * The fully-resolved outcome of a single move, produced by the pure game logic
 * and consumed by the store + the movement animation.
 */
export interface MoveResult {
  /** Position the move started from. */
  from: Position;
  /** Dice value rolled. */
  dice: number;
  /** Numeric square-by-square walk (empty for realm/escape moves). */
  steps: number[];
  /** Numeric square reached after walking, before any jump (null if none). */
  landing: number | null;
  /** Final resting position (square or realm). */
  to: Position;
  /** How the move resolved. */
  outcome: MoveOutcome;
  /** Ordered hops (for the move log). */
  hops: MoveHop[];
}

/**
 * The complete game state held by the Zustand store.
 */
export interface GameState {
  /** Last numbered square (0 = janmasthan). Meaningful when `realm` is null. */
  currentSquare: number;
  /** Off-board realm key, or null when on the board / at janmasthan. */
  realm: string | null;
  /** Latest dice value, or null before the first roll. */
  diceValue: number | null;
  /** Whether a dice roll animation / resolution is in progress. */
  isRolling: boolean;
  /** Whether the soul token is mid-animation. */
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
  /** How many times the soul has fallen into a naraka (per-resolution stat). */
  narakCount: number;
  /**
   * Distinct narak episodes shown to the player: counts each ENTRY into a hell
   * realm from the board. Moving realm→realm (e.g. महानरक → क्षुद्रनरक) without
   * passing through janmasthan does NOT recount.
   */
  narakVisits: number;
  /** Lives lived: incremented each time the soul returns to janmasthan. */
  lives: number;
  /** Consecutive rolls spent on the grave (escape needs 4). */
  mrutyuRollCount: number;
  /** Ordered history of resolved moves. */
  moveHistory: MoveHistoryEntry[];
}
