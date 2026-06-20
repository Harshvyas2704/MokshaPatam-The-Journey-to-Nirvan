/**
 * Spacing, radii, and elevation tokens.
 * An 8pt-based scale keeps layout rhythm consistent and calm.
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/** Standard shadow presets (calm, soft). */
export const shadow = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
