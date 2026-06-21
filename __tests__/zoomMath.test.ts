/**
 * Unit tests for the pure zoom/pan boundary math.
 */
import {
  clampOffset,
  computeMinScale,
  getMaxOffset,
} from '@/features/board/zoom';

describe('getMaxOffset', () => {
  it('is half the overflow when content is larger than the viewport', () => {
    expect(getMaxOffset(1000, 600)).toBe(200);
  });

  it('is zero when content fits inside the viewport', () => {
    expect(getMaxOffset(400, 600)).toBe(0);
  });
});

describe('clampOffset', () => {
  it('clamps within the allowed range', () => {
    expect(clampOffset(500, 1000, 600)).toBe(200);
    expect(clampOffset(-500, 1000, 600)).toBe(-200);
    expect(clampOffset(50, 1000, 600)).toBe(50);
  });

  it('pins to center (0) when content fits', () => {
    expect(clampOffset(80, 400, 600)).toBe(0);
  });
});

describe('computeMinScale', () => {
  it('never exceeds 1 when the board already fills the width', () => {
    // tall board, width fits at scale 1 -> min scale fits the height
    const min = computeMinScale(360, 2000, 360, 700);
    expect(min).toBeCloseTo(700 / 2000, 5);
    expect(min).toBeLessThan(1);
  });

  it('caps at 1 when the whole board already fits', () => {
    expect(computeMinScale(300, 300, 360, 700)).toBe(1);
  });

  it('respects the floor for an enormous board', () => {
    expect(computeMinScale(10000, 10000, 360, 700)).toBe(0.05);
  });
});
