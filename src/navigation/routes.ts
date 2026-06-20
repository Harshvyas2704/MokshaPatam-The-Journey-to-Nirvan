/**
 * Route registry.
 *
 * `ROUTES` gives named constants for the React Navigation route names so
 * screens never pass raw string literals. `routeTitles` holds display titles
 * (for accessibility / future custom headers).
 */
import type { RouteName } from '@/types';

export const ROUTES = {
  Home: 'Home',
  Game: 'Game',
} as const satisfies Record<string, RouteName>;

/** Human-readable titles per route (for headers / accessibility). */
export const routeTitles: Record<RouteName, string> = {
  Home: 'Mokshapat',
  Game: 'Journey to Nirvan',
};
