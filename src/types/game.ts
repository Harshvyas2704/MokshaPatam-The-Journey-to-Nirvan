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
  /** Which player made this move. */
  playerId: number;
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

/** A single player (a soul) and everything tracked per-soul. */
export interface PlayerState {
  /** Stable id (0-based) — also the player's slot. */
  id: number;
  /** Display name. */
  name: string;
  /** Index into `SOUL_COLORS` — the soul's token color. */
  colorId: number;
  /** Last numbered square (0 = janmasthan). Meaningful when `realm` is null. */
  currentSquare: number;
  /** Off-board realm key, or null when on the board / at janmasthan. */
  realm: string | null;
  /** Consecutive rolls spent on the grave (escape needs 4). */
  mrutyuRollCount: number;
  /**
   * Distinct narak episodes: each ENTRY into a hell realm from the board.
   * Moving realm→realm (e.g. महानरक → क्षुद्रनरक) without rebirth does NOT recount.
   */
  narakVisits: number;
  /** Lives lived: incremented each time this soul returns to janmasthan. */
  lives: number;
  /** Whether this soul has reached Moksha (285). */
  finished: boolean;
  /** Placement once finished (1 = first to liberation), else null. */
  rank: number | null;
}

/** Config supplied by the setup screen to start a game. */
export interface PlayerConfig {
  name: string;
  colorId: number;
}

/**
 * The complete game state held by the Zustand store.
 */
export interface GameState {
  /** All players (souls) in this session, in turn order. */
  players: PlayerState[];
  /** Index (into `players`) of the player whose turn it is. */
  currentPlayerIndex: number;
  /** How many players have reached Moksha (drives rank assignment). */
  finishedCount: number;
  /** Latest dice value, or null before the first roll. */
  diceValue: number | null;
  /** Whether a dice roll animation / resolution is in progress. */
  isRolling: boolean;
  /** Whether a soul token is mid-animation. */
  isMoving: boolean;
  /** Whether the game is auto-rolling. */
  isAutoPlaying: boolean;
  /** The most recently resolved move (drives the movement animation). */
  lastMove: MoveResult | null;
  /** Which player the `lastMove` belongs to. */
  lastMovePlayerId: number | null;
  /** Whether `lastMove` began a different player's turn (drives the camera pre-pan). */
  lastMoveTurnSwitched: boolean;
  /** When the current move finishes, advance to the next player's turn. */
  pendingAdvance: boolean;
  /** Current lifecycle status ('won' = every soul liberated). */
  gameStatus: GameStatus;
  /** Total number of dice rolls this session. */
  totalRolls: number;
  /** Ordered history of resolved moves (across all players). */
  moveHistory: MoveHistoryEntry[];
}
