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
  /**
   * Fixed on-screen size (px) of a single cell at 100% zoom. Large enough to
   * show the Sanskrit name + number clearly when zoomed in; the board is then
   * scrolled/zoomed (the whole board is fit-to-screen by default). Zoom scales
   * this visually, so it defines the "readable detail" level rather than fit.
   */
  baseCellSize: 96,
  /** Gap (px) inset on each side of a cell tile within its grid slot. */
  cellInset: 2,
} as const;

/**
 * Zoom / pan constants for the board viewport (Phase 3).
 */
export const BOARD_ZOOM = {
  /** Maximum pinch-zoom scale. */
  maxScale: 4,
  /**
   * Hard floor for the minimum scale. Low enough that the whole tall board
   * (8 × 36 large cells) can fit on screen when the user pinches out.
   */
  minScaleFloor: 0.05,
  /**
   * Initial / "home" zoom shown on entry — a readable 100% focused on square 1.
   * The board only zooms out (toward the overview) when the user pinches.
   */
  initialScale: 1,
  /** Closer zoom a double-tap jumps to (toggles with the initial zoom). */
  doubleTapScale: 2,
} as const;

/**
 * Snake & ladder SVG overlay styling (Phase 7). Stroke sizes are relative to
 * the cell size so they scale with the board.
 */
export const BOARD_OVERLAY = {
  /** Serpent body / head color (a muted clay red on the dark canvas). */
  snakeColor: '#B05A50',
  /** Ladder rail (wood) color. */
  ladderRail: '#B06A3B',
  /** Ladder rung color. */
  ladderRung: '#C9A227',

  // Both snakes and ladders are kept faint + thin so the CELLS stay the hero.
  /** Rail / rung width relative to cell size. */
  ladderStrokeRatio: 0.03,
  /** Half-distance between ladder rails relative to cell size (narrow). */
  railOffsetRatio: 0.05,
  /** Rung spacing relative to cell size. */
  rungSpacingRatio: 0.9,
  /** Hard cap on rungs per ladder (perf — long ladders span the whole board). */
  maxRungs: 5,
  /** Ladder opacity — faint. */
  ladderOpacity: 0.4,

  /** Snake eye color (a small dark dot on the head). */
  snakeEye: '#241310',
  /** Body half-width at the head, relative to cell size (tapers to the tail). */
  snakeHeadHalfRatio: 0.038,
  /** Body half-width at the tail, relative to cell size (near a point). */
  snakeTailHalfRatio: 0.007,
  /** Lateral sway of a snake body relative to its head→tail distance. */
  snakeAmplitudeRatio: 0.085,
  /** How many half-undulations per cell of length (gentle). */
  snakeWavesPerCell: 0.4,
  /** Snake opacity — present but calm, not highlighting. */
  snakeOpacity: 0.55,
} as const;
