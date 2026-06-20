/**
 * Typography scale.
 *
 * Primary font:   Geist (Latin UI text).
 * Secondary font: a dedicated Devanagari font for Sanskrit.
 *
 * Font FILES are not bundled in Phase 1 (no UI is built yet). The family names
 * below are the contract that components and the linking step will use later.
 * Until the .ttf/.otf assets are added under src/assets/fonts and linked,
 * `System` is used as a safe fallback so nothing crashes.
 */

export const fontFamily = {
  /** Primary Latin font (Geist). Falls back to System until assets are linked. */
  primary: 'System',
  /** Devanagari font for Sanskrit. Falls back to System until assets are linked. */
  devanagari: 'System',
} as const;

/** Named font sizes (in points). */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 44,
} as const;

/** Font weights as React Native accepts them. */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Line-height multipliers relative to font size. */
export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
