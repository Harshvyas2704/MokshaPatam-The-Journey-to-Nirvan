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
  /** Core orb diameter relative to cell size. */
  coreRatio: 0.42,
  /** Brightest inner highlight diameter relative to the core. */
  highlightRatio: 0.4,
  /** Outer glow (aura) diameter relative to cell size. */
  auraRatio: 1.0,

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

  /** Halo rings that radiate outward and fade. */
  ringCount: 2,
  /** Ring scale travel: from `ringMinScale` (at the core) outward. */
  ringMinScale: 0.5,
  ringMaxScale: 1.9,
  ringMaxOpacity: 0.35,
  /** One ring emanation cycle, in ms. */
  ringDurationMs: 3200,

  /** Gentle floating bob, relative to cell size, and its period. */
  floatRatio: 0.05,
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
} as const;
