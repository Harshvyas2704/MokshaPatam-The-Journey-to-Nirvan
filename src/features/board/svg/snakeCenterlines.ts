/**
 * Snake centerlines for soul movement (pure).
 *
 * For every snake head, produces the centerline (a list of points) the soul
 * should travel from that head down to its destination — the SAME spine that
 * `SnakesLaddersLayer` draws the serpent body around, including the multi-headed
 * branch→junction→trunk routing. Feeding these to the movement animation makes
 * the token slither down the visible snake instead of cutting straight to the
 * tail. The wave/junction math is kept in step with the layer's `snakeShapes`.
 */
import { BOARD_OVERLAY } from '@/constants';
import { snakeClusters } from '@/data';
import { sampleSnakeCenterline, type Point } from './overlayGeometry';

/** Lateral sway + undulation count for a segment of the given length. */
function curve(from: Point, to: Point, cellSize: number): Point[] {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const waves = Math.max(
    2,
    Math.round((distance / cellSize) * BOARD_OVERLAY.snakeWavesPerCell),
  );
  const amplitude = distance * BOARD_OVERLAY.snakeAmplitudeRatio;
  return sampleSnakeCenterline(from, to, amplitude, waves);
}

/**
 * Map of snake head (numeric square or realm string) -> the ordered points the
 * soul follows from that head down to the cluster's destination. `resolve` turns
 * a square id / realm key into a pixel center (the layout's cell centers).
 */
export function buildSnakeCenterlines(
  resolve: (key: number | string) => Point | undefined,
  cellSize: number,
): Map<number | string, Point[]> {
  const map = new Map<number | string, Point[]>();

  for (const cluster of snakeClusters) {
    const root = resolve(cluster.to);
    if (!root) {
      continue;
    }
    const heads = cluster.heads
      .map(key => ({ key, pt: resolve(key) }))
      .filter((h): h is { key: number | string; pt: Point } => h.pt !== undefined);
    if (heads.length === 0) {
      continue;
    }

    if (heads.length === 1) {
      // Lone serpent: head straight down its undulating body to the destination.
      map.set(heads[0].key, curve(heads[0].pt, root, cellSize));
      continue;
    }

    // Multi-headed serpent: each neck flows from its head to a shared junction
    // (pulled toward the destination, matching the layer), then down the trunk.
    const cx = heads.reduce((s, h) => s + h.pt.x, 0) / heads.length;
    const cy = heads.reduce((s, h) => s + h.pt.y, 0) / heads.length;
    const bias = BOARD_OVERLAY.snakeJunctionBias;
    const junction: Point = {
      x: root.x + (cx - root.x) * bias,
      y: root.y + (cy - root.y) * bias,
    };
    const trunk = curve(junction, root, cellSize);
    for (const h of heads) {
      const branch = curve(h.pt, junction, cellSize);
      // branch ends at the junction where the trunk begins — drop the duplicate.
      map.set(h.key, [...branch, ...trunk.slice(1)]);
    }
  }

  return map;
}
