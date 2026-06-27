/**
 * Unit tests for the pure snake/ladder geometry.
 */
import {
  buildLadder,
  buildSnakeCenterlines,
  buildSnakeHead,
  buildSnakePath,
  sampleSnakeCenterline,
  snakeHeadEyes,
  type Point,
} from '@/features/board/svg';
import { snakeClusters } from '@/data';

describe('buildSnakePath', () => {
  it('starts at the head and ends at the tail', () => {
    const head: Point = { x: 100, y: 100 };
    const tail: Point = { x: 100, y: 300 };
    const d = buildSnakePath(head, tail, 20);
    expect(d.startsWith('M 100 100')).toBe(true);
    expect(d.trim().endsWith('100 300')).toBe(true);
    expect(d).toContain('C'); // cubic curve
  });
});

describe('sampleSnakeCenterline', () => {
  it('starts at the head, ends exactly at the tail, and bends between', () => {
    const head: Point = { x: 100, y: 100 };
    const tail: Point = { x: 100, y: 300 };
    const pts = sampleSnakeCenterline(head, tail, 20, 3);
    expect(pts[0]).toEqual(head);
    const last = pts[pts.length - 1];
    expect(last.x).toBeCloseTo(tail.x, 5);
    expect(last.y).toBeCloseTo(tail.y, 5);
    // The undulation pushes some interior point off the straight x=100 line.
    expect(pts.some(p => Math.abs(p.x - 100) > 1)).toBe(true);
  });
});

describe('buildSnakeCenterlines', () => {
  // Fake every square/realm onto a grid so resolve() always returns a point.
  const resolve = (key: number | string): Point => {
    if (typeof key === 'number') {
      return { x: (key % 12) * 64, y: Math.floor(key / 12) * 64 };
    }
    // Stable pseudo-position for realm strings.
    let h = 0;
    for (const ch of key) {
      h = (h * 31 + ch.charCodeAt(0)) % 1000;
    }
    return { x: (h % 12) * 64, y: 800 + (h % 5) * 64 };
  };

  it('gives every snake head a spine ending at its cluster destination', () => {
    const spines = buildSnakeCenterlines(resolve, 64);
    for (const cluster of snakeClusters) {
      const root = resolve(cluster.to);
      for (const head of cluster.heads) {
        const spine = spines.get(head);
        expect(spine).toBeDefined();
        // Spine begins at the head and ends at the shared destination.
        expect(spine![0].x).toBeCloseTo(resolve(head).x, 5);
        expect(spine![0].y).toBeCloseTo(resolve(head).y, 5);
        const tail = spine![spine!.length - 1];
        expect(tail.x).toBeCloseTo(root.x, 5);
        expect(tail.y).toBeCloseTo(root.y, 5);
      }
    }
  });
});

describe('buildSnakeHead / snakeHeadEyes', () => {
  // Body connects below the head (toward y=200); the snout should point UP.
  const head: Point = { x: 100, y: 100 };
  const toward: Point = { x: 100, y: 200 };

  it('builds a closed head path whose snout extends away from the body', () => {
    const d = buildSnakeHead(head, toward, 10);
    expect(d.startsWith('M')).toBe(true);
    expect(d.trim().endsWith('Z')).toBe(true); // closed, fillable
    // The very first anchor is the snout tip, ahead of the head, away from body.
    const [mx, my] = d.slice(1).trim().split(/\s+/).map(Number);
    expect(mx).toBeCloseTo(100, 5);
    expect(my).toBeLessThan(100); // above the head, opposite the body
  });

  it('places two distinct eyes symmetric across the head axis', () => {
    const [a, b] = snakeHeadEyes(head, toward, 10);
    expect(a).not.toEqual(b);
    // Symmetric about x=100 (the head's axis is vertical here).
    expect(a.x + b.x).toBeCloseTo(200, 5);
    expect(a.y).toBeCloseTo(b.y, 5);
  });
});

describe('buildLadder', () => {
  const base: Point = { x: 100, y: 300 };
  const top: Point = { x: 100, y: 100 }; // straight vertical, length 200

  it('offsets the two rails to either side', () => {
    const { rails } = buildLadder(base, top, 10, 50);
    // Vertical ladder -> rails offset horizontally by +/-10.
    expect(rails[0].x1).toBeCloseTo(110, 5);
    expect(rails[1].x1).toBeCloseTo(90, 5);
  });

  it('produces evenly spaced rungs spanning the ladder', () => {
    const { rungs } = buildLadder(base, top, 10, 50);
    // length 200 / spacing 50 = 4 -> 5 rungs (inclusive of both ends).
    expect(rungs).toHaveLength(5);
    expect(rungs[0].y1).toBeCloseTo(300, 5); // at base
    expect(rungs[rungs.length - 1].y1).toBeCloseTo(100, 5); // at top
  });
});
