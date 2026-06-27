/**
 * Soul-token constants (Phase 4 / 4.5).
 *
 * The token represents the soul: a luminous orb with a soft, gradient-like glow
 * (faked with stacked translucent layers — no SVG yet), a slow breath, a gentle
 * vertical float, and faint halos that radiate outward and fade. Everything is
 * tuned to feel sacred and calm — never arcade-like or flashy.
 *
 * Sizes are relative to the board's cell size so the token scales with zoom.
 */
export const SOUL_TOKEN = {
  /** Core orb diameter relative to cell size (small flame, sits in its square). */
  coreRatio: 0.3,
  /** Brightest inner highlight diameter relative to the core. */
  highlightRatio: 0.4,
  /** Outer glow (aura) diameter relative to cell size. */
  auraRatio: 0.5,

  /** Number of stacked translucent layers used to fake a soft radial glow. */
  glowLayers: 7,
  /** Opacity of the faintest (outermost) glow layer. */
  glowMinOpacity: 0.05,
  /** Opacity of the strongest (innermost) glow layer. */
  glowMaxOpacity: 0.4,

  /** Breath (scale) applied to the glow at the pulse peak — subtle. */
  pulseScale: 1.12,
  /** Breath applied to the core — barely perceptible. */
  corePulseScale: 1.05,
  /** One half-cycle of the breath, in ms (slow + calm). */
  pulseDurationMs: 2000,

  /** Halo rings that radiate outward and fade (kept close so it stays small). */
  ringCount: 2,
  /** Ring scale travel: from `ringMinScale` (at the core) outward. */
  ringMinScale: 0.4,
  ringMaxScale: 1.2,
  ringMaxOpacity: 0.3,
  /** One ring emanation cycle, in ms. */
  ringDurationMs: 3200,

  /** Gentle floating bob, relative to cell size, and its period. */
  floatRatio: 0.035,
  floatDurationMs: 2600,
} as const;

/**
 * Soul movement timing (Phase 6).
 *
 * The token walks one square per `stepDurationMs` (calm, readable), and takes a
 * longer, eased `jumpDurationMs` for a snake/ladder transition.
 */
export const SOUL_MOVEMENT = {
  stepDurationMs: 170,
  jumpDurationMs: 650,
  /**
   * Time per point of a snake's drawn spine when the soul slithers DOWN it.
   * Applied per spine point (not as a fixed total) so the descent keeps a calm,
   * constant speed whether the serpent is short or long. Raise to slow it down.
   */
  snakeStepDurationMs: 62,
  /**
   * When the turn passes to a different player, the camera first glides to that
   * player's token (and the token holds still) for this long, BEFORE the move
   * animation begins — so the board "scrolls there first, then starts moving".
   */
  prePanMs: 480,
} as const;

/**
 * The four selectable soul (token) colors. Each is a calm luminous orb: a hot
 * near-white CORE with a colored AURA. Index = `colorId` stored per player.
 */
export const SOUL_COLORS = [
  { id: 0, name: 'Sky', core: '#E6F2FF', aura: '#4FA3FF' },
  { id: 1, name: 'Saffron', core: '#FFF1DD', aura: '#E58A2B' },
  { id: 2, name: 'Emerald', core: '#E8FBEC', aura: '#36B66E' },
  { id: 3, name: 'Rose', core: '#FFEAF1', aura: '#E2588E' },
] as const;

/** Maximum number of players in a single game. */
export const MAX_PLAYERS = SOUL_COLORS.length;

export type SoulColor = (typeof SOUL_COLORS)[number];
