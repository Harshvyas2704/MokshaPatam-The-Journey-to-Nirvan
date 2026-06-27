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

/** Round to 2dp and drop trailing zeros (keeps the path string tidy/stable). */
function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** A smooth cubic path through a list of points (Catmull-Rom → bezier). */
function smoothPath(points: Point[]): string {
  if (points.length === 0) {
    return '';
  }
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return d;
}

/**
 * An undulating snake body from head to tail, as an SVG path `d` string.
 * The centerline is swept with a sine wave (`waves` half-undulations of lateral
 * `amplitude`), then smoothed — giving a serpentine body rather than a single
 * arc. Endpoints land exactly on head/tail.
 */
export function buildSnakePath(
  head: Point,
  tail: Point,
  amplitude: number,
  waves: number = 3,
): string {
  const { dx, dy, px, py } = basis(head, tail);
  const segments = Math.max(6, Math.round(waves * 4));
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const off = Math.sin(t * Math.PI * waves) * amplitude;
    points.push({ x: head.x + dx * t + px * off, y: head.y + dy * t + py * off });
  }
  return smoothPath(points);
}

/**
 * A tapered, undulating snake BODY as a closed (fillable) SVG path — wide at the
 * head, narrowing to a point at the tail. This reads as a real serpent
 * silhouette (rather than a uniform stroke) without any cartoon features.
 * `headHalf` / `tailHalf` are the body half-widths at each end (px).
 */
export function buildSnakeBody(
  head: Point,
  tail: Point,
  amplitude: number,
  waves: number,
  headHalf: number,
  tailHalf: number,
): string {
  const { dx, dy, px, py } = basis(head, tail);
  const segments = Math.max(16, Math.round(waves * 8));

  const center: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const off = Math.sin(t * Math.PI * waves) * amplitude;
    center.push({ x: head.x + dx * t + px * off, y: head.y + dy * t + py * off });
  }

  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const prev = center[Math.max(0, i - 1)];
    const next = center[Math.min(segments, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx; // perpendicular to the local tangent
    const t = i / segments;
    const half = headHalf + (tailHalf - headHalf) * t; // wide head -> thin tail
    left.push({ x: center[i].x + nx * half, y: center[i].y + ny * half });
    right.push({ x: center[i].x - nx * half, y: center[i].y - ny * half });
  }

  let d = `M ${fmt(left[0].x)} ${fmt(left[0].y)}`;
  for (let i = 1; i <= segments; i++) {
    d += ` L ${fmt(left[i].x)} ${fmt(left[i].y)}`;
  }
  for (let i = segments; i >= 0; i--) {
    d += ` L ${fmt(right[i].x)} ${fmt(right[i].y)}`;
  }
  return d + ' Z';
}

/**
 * The undulating CENTERLINE of a snake body, as a list of points (the spine the
 * fill in `buildSnakeBody` is built around). Returned so the soul token can
 * SLITHER down the very same curve it sees, rather than cutting straight to the
 * tail. Sampled identically to `buildSnakeBody` so the two stay in lock-step.
 */
export function sampleSnakeCenterline(
  head: Point,
  tail: Point,
  amplitude: number,
  waves: number,
): Point[] {
  const { dx, dy, px, py } = basis(head, tail);
  const segments = Math.max(16, Math.round(waves * 8));
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const off = Math.sin(t * Math.PI * waves) * amplitude;
    points.push({ x: head.x + dx * t + px * off, y: head.y + dy * t + py * off });
  }
  return points;
}

/**
 * Two parallel rails (offset `railOffset` either side of the base->top line)
 * plus rungs spaced roughly every `rungSpacing` px, capped at `maxRungs` so a
 * ladder spanning much of the board doesn't produce hundreds of SVG nodes.
 */
export function buildLadder(
  base: Point,
  top: Point,
  railOffset: number,
  rungSpacing: number,
  maxRungs: number = 8,
): LadderGeometry {
  const { dx, dy, length, px, py } = basis(base, top);
  const ox = px * railOffset;
  const oy = py * railOffset;

  const rails: [Segment, Segment] = [
    { x1: base.x + ox, y1: base.y + oy, x2: top.x + ox, y2: top.y + oy },
    { x1: base.x - ox, y1: base.y - oy, x2: top.x - ox, y2: top.y - oy },
  ];

  const count = Math.min(
    Math.max(1, maxRungs),
    Math.max(1, Math.round(length / rungSpacing)),
  );
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
