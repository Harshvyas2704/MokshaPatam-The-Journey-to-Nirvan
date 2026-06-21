/**
 * Board domain types.
 *
 * The Mokshapat board is data-driven. Positions are expressed in abstract
 * row/column units (NOT device pixels). The renderer (Phase 2) is responsible
 * for converting these units into responsive on-screen coordinates.
 *
 * The real 285-cell dataset will be supplied later and must conform to these
 * shapes without requiring architectural changes.
 */

/**
 * The kind of node a board cell represents.
 * - square:  an ordinary numbered step on the journey.
 * - concept: a labelled spiritual concept / teaching node.
 * - realm:   a larger spiritual realm occupying the sparse upper board.
 * - moksha:  the final liberation cell (the goal, square 285).
 */
export type CellType = 'square' | 'concept' | 'realm' | 'moksha';

/**
 * A single addressable cell on the board.
 *
 * `row` / `col` are layout units only. The hybrid layout model means the
 * lower board (dense) and upper board (sparse) may use different spacing,
 * but both still resolve through the same row/col contract.
 */
export interface BoardCell {
  /** Unique 1-based cell number (1..285). Also the gameplay position. */
  id: number;
  /** Logical row in the layout grid (device-independent). */
  row: number;
  /** Logical column in the layout grid (device-independent). */
  col: number;
  /** Human-readable title / name of the cell. */
  title: string;
  /** Optional Sanskrit term (Devanagari) associated with the cell. */
  sanskrit?: string;
  /** Optional translation / meaning of the Sanskrit term. */
  translation?: string;
  /** Classification of the cell. */
  type: CellType;
}

/**
 * The spiritual obstacle a snake represents (ignorance, ego, anger, ...).
 * Kept as a free string so the supplied dataset can use its own vocabulary.
 */
export type SnakeKind = string;

/**
 * A snake: moving the player from `from` (head) to `to` (tail). Usually
 * `to < from`, though the authentic spiritual board has a few exceptions.
 */
export interface Snake {
  id: string;
  /** Head cell id (where the player is caught). */
  from: number;
  /** Tail cell id (where the player slides down to). */
  to: number;
  /** Optional spiritual vice / obstacle this snake embodies. */
  kind?: SnakeKind;
  /** Optional teaching message shown when encountered. */
  message?: string;
}

/**
 * The virtue a ladder represents (wisdom, devotion, service, ...).
 */
export type LadderKind = string;

/**
 * A ladder: ascending the player from `from` (base) to `to` (top).
 * Always: `to > from`.
 */
export interface Ladder {
  id: string;
  /** Base cell id (where the player begins the climb). */
  from: number;
  /** Top cell id (where the player ascends to). */
  to: number;
  /** Optional spiritual virtue this ladder embodies. */
  kind?: LadderKind;
  /** Optional teaching message shown when climbed. */
  message?: string;
}

/**
 * A spiritual concept attached to a cell, surfaced in messages / detail views.
 */
export interface Concept {
  id: string;
  /** Cell id this concept is attached to. */
  cellId: number;
  title: string;
  sanskrit?: string;
  translation?: string;
  /** Longer explanatory / teaching text. */
  description?: string;
}

/**
 * Convenience aggregate of the full board dataset.
 */
export interface BoardData {
  cells: BoardCell[];
  snakes: Snake[];
  ladders: Ladder[];
  concepts: Concept[];
}
