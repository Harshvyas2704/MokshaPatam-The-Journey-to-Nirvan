/**
 * Snake & ladder geometry (pure).
 *
 * Produces the SVG path / line coordinates that connect two board points. Kept
 * free of React and react-native-svg so the math is unit-testable; the layer
 * component feeds these into <Path>/<Line> primitives.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LadderGeometry {
  /** The two side rails. */
  rails: [Segment, Segment];
  /** Evenly spaced rungs (inclusive of both ends). */
  rungs: Segment[];
}

/** Unit direction and perpendicular for the vector head->tail. */
function basis(head: Point, tail: Point) {
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  // Perpendicular unit vector.
  return { dx, dy, length, ux, uy, px: -uy, py: ux };
}

/**
 * A smooth S-curved snake body from head to tail, as an SVG path `d` string.
 * The two cubic control points are offset to opposite sides of the line, giving
 * the serpent its undulating shape. `amplitude` is the lateral sway in px.
 */
export function buildSnakePath(
  head: Point,
  tail: Point,
  amplitude: number,
): string {
  const { dx, dy, px, py } = basis(head, tail);
  const c1x = head.x + dx / 3 + px * amplitude;
  const c1y = head.y + dy / 3 + py * amplitude;
  const c2x = head.x + (2 * dx) / 3 - px * amplitude;
  const c2y = head.y + (2 * dy) / 3 - py * amplitude;
  return `M ${head.x} ${head.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${tail.x} ${tail.y}`;
}

/**
 * Two parallel rails (offset `railOffset` either side of the base->top line)
 * plus rungs spaced roughly every `rungSpacing` px.
 */
export function buildLadder(
  base: Point,
  top: Point,
  railOffset: number,
  rungSpacing: number,
): LadderGeometry {
  const { dx, dy, length, px, py } = basis(base, top);
  const ox = px * railOffset;
  const oy = py * railOffset;

  const rails: [Segment, Segment] = [
    { x1: base.x + ox, y1: base.y + oy, x2: top.x + ox, y2: top.y + oy },
    { x1: base.x - ox, y1: base.y - oy, x2: top.x - ox, y2: top.y - oy },
  ];

  const count = Math.max(1, Math.round(length / rungSpacing));
  const rungs: Segment[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const cx = base.x + dx * t;
    const cy = base.y + dy * t;
    rungs.push({
      x1: cx + ox,
      y1: cy + oy,
      x2: cx - ox,
      y2: cy - oy,
    });
  }

  return { rails, rungs };
}
