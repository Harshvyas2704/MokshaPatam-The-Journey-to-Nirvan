/**
 * Tiny color helpers (framework-agnostic, no game logic).
 */
import { clamp } from './math';

/** Parse a `#rrggbb` string into its [r, g, b] channels (0..255). */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Format [r, g, b] channels (0..255) back into a `#rrggbb` string. */
function toHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/**
 * Linearly blend two `#rrggbb` colors. `t` of 0 returns `a`, 1 returns `b`.
 * Useful for shading a value along a light→dark ramp.
 */
export function mixHex(a: string, b: string, t: number): string {
  const k = clamp(t, 0, 1);
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(ar + (br - ar) * k, ag + (bg - ag) * k, ab + (bb - ab) * k);
}
