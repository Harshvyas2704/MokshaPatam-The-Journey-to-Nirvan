/**
 * Unit tests for the shared soul-journey builder (used by BOTH the soul token
 * and the camera, so they travel in lock-step).
 */
import { buildSoulJourney } from '@/features/game/logic';
import { SOUL_MOVEMENT } from '@/constants';
import type { MoveResult } from '@/types';

const move: MoveResult = {
  from: 20,
  dice: 3,
  steps: [21, 22, 23],
  landing: 23,
  to: 11,
  outcome: 'snake',
  hops: [
    { to: 23, kind: 'walk' },
    { to: 11, kind: 'snake' },
  ],
};

const centers = new Map<string | number, { x: number; y: number }>([
  [21, { x: 0, y: 0 }],
  [22, { x: 10, y: 0 }],
  [23, { x: 20, y: 0 }],
  [11, { x: 20, y: 100 }], // snake destination, lower down
]);

// A 3-point spine from the head (23) down to the destination (11).
const spines = new Map<string | number, { x: number; y: number }[]>([
  [23, [{ x: 20, y: 0 }, { x: 28, y: 50 }, { x: 20, y: 100 }]],
]);

describe('buildSoulJourney', () => {
  it('walks each square, then slithers the snake spine to its tail', () => {
    const legs = buildSoulJourney(move, centers, spines)!;
    expect(legs).not.toBeNull();

    // 3 walk steps + 2 slither points (the head point is skipped).
    const walks = legs.filter(l => l.kind === 'step');
    const slithers = legs.filter(l => l.kind === 'slither');
    expect(walks).toHaveLength(3);
    expect(slithers).toHaveLength(2);
    expect(legs.some(l => l.kind === 'jump')).toBe(false);

    // Slither legs use the calm per-point pace and run down the spine.
    expect(slithers[0]).toMatchObject({ x: 28, y: 50, duration: SOUL_MOVEMENT.snakeStepDurationMs });
    const last = legs[legs.length - 1];
    expect(last).toMatchObject({ x: 20, y: 100 }); // ends at the destination
  });

  it('falls back to a single jump leg when no snake spine matches', () => {
    const legs = buildSoulJourney(move, centers, new Map())!;
    expect(legs.filter(l => l.kind === 'slither')).toHaveLength(0);
    const jumps = legs.filter(l => l.kind === 'jump');
    expect(jumps).toHaveLength(1);
    expect(jumps[0]).toMatchObject({ x: 20, y: 100, duration: SOUL_MOVEMENT.jumpDurationMs });
  });

  it('returns an empty journey for a blocked move (no steps, no hops)', () => {
    const blocked: MoveResult = { ...move, steps: [], hops: [], outcome: 'blocked', to: 20 };
    expect(buildSoulJourney(blocked, centers, spines)).toEqual([]);
  });
});
