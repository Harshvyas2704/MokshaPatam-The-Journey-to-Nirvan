/**
 * Board structural constants.
 *
 * The board uses a Hybrid Layout Model: a dense lower section and a sparse
 * upper section. These constants describe the *shape* of the board, not its
 * content (content lives in the dataset under src/data).
 *
 * NOTE: values are placeholders for the architecture. The real dataset will
 * define exact rows/columns; these bounds let the layout engine reason about
 * the board before that data arrives.
 */

/** First cell id (the soul's birth). */
export const FIRST_CELL = 1;

/** Final cell id (Moksha / liberation). */
export const LAST_CELL = 285;

/** Total number of cells on the board. */
export const TOTAL_CELLS = LAST_CELL - FIRST_CELL + 1;

/**
 * The cell id at which the layout transitions from the dense lower section to
 * the sparse upper section. Cells 1..220 are dense; 221..285 are sparse.
 */
export const LOWER_SECTION_END = 220;

/** Layout-unit configuration for each section of the hybrid board. */
export const LAYOUT = {
  lower: {
    /** Columns in the dense lower grid (placeholder). */
    columns: 11,
    /** Relative spacing multiplier for the dense section. */
    spacing: 1,
  },
  upper: {
    /** Columns in the sparse upper grid (placeholder). */
    columns: 5,
    /** Relative spacing multiplier for the sparse section. */
    spacing: 1.6,
  },
} as const;

/**
 * Rendering constants for the board layout engine (Phase 2).
 *
 * These govern how the device-independent row/col grid is converted into
 * responsive on-screen pixels. They are presentation concerns, deliberately
 * separate from the dataset.
 */
export const BOARD_LAYOUT = {
  /** Outer padding (px) reserved around the board inside its container. */
  padding: 12,
  /** Smallest a single cell may shrink to (px) before it stops fitting. */
  minCellSize: 52,
  /** Largest a single cell may grow to (px) when there is ample space. */
  maxCellSize: 120,
  /** Gap (px) inset on each side of a cell tile within its grid slot. */
  cellInset: 2,
} as const;

/**
 * Zoom / pan constants for the board viewport (Phase 3).
 */
export const BOARD_ZOOM = {
  /** Maximum pinch-zoom scale. */
  maxScale: 4,
  /** Hard floor for the minimum scale (so a huge board can't vanish). */
  minScaleFloor: 0.2,
  /** Scale applied by a double-tap when zooming in. */
  doubleTapScale: 2,
} as const;

/**
 * Snake & ladder SVG overlay styling (Phase 7). Stroke sizes are relative to
 * the cell size so they scale with the board.
 */
export const BOARD_OVERLAY = {
  /** Serpent body / head color (a visible clay red on the dark canvas). */
  snakeColor: '#C0584E',
  /** Snake eye accent. */
  snakeEye: '#E6C25A',
  /** Ladder rail (wood) color. */
  ladderRail: '#B06A3B',
  /** Ladder rung color. */
  ladderRung: '#C9A227',
  /** Body / rail width relative to cell size. */
  strokeRatio: 0.1,
  /** Lateral sway of a snake body relative to its head→tail distance. */
  snakeAmplitudeRatio: 0.16,
  /** Half-distance between ladder rails relative to cell size. */
  railOffsetRatio: 0.16,
  /** Rung spacing relative to cell size. */
  rungSpacingRatio: 0.6,
  /** Snake head radius relative to cell size. */
  snakeHeadRatio: 0.18,
  /** Opacity for idle vs. the snake/ladder used by the latest move. */
  idleOpacity: 0.8,
  activeOpacity: 1,
} as const;
