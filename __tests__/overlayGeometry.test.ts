/**
 * Unit tests for the pure snake/ladder geometry.
 */
import {
  buildLadder,
  buildSnakePath,
  type Point,
} from '@/features/board/svg';

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
