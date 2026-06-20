/**
 * Theme aggregate.
 *
 * The theme lives under `constants` because it is a set of design constants.
 * Import the whole theme via `@/constants/theme` or pull individual modules.
 */
import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius, shadow } from './spacing';

export * from './colors';
export * from './typography';
export * from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
} as const;

export type Theme = typeof theme;
