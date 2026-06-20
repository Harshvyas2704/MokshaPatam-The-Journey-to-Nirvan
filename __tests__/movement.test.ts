/**
 * Unit tests for the pure game-move logic.
 */
import {
  buildStepPath,
  getMovePath,
  reflectLanding,
  resolveMove,
  type JumpMap,
} from '@/features/game/logic/movement';

const GOAL = 285;
const NO_SNAKES: JumpMap = {};
const NO_LADDERS: JumpMap = {};

describe('reflectLanding', () => {
  it('moves forward normally', () => {
    expect(reflectLanding(10, 5, GOAL)).toBe(15);
  });
  it('lands exactly on the goal', () => {
    expect(reflectLanding(280, 5, GOAL)).toBe(GOAL);
  });
  it('bounces back on overshoot', () => {
    // 283 + 5 = 288 -> 2*285 - 288 = 282
    expect(reflectLanding(283, 5, GOAL)).toBe(282);
  });
});

describe('buildStepPath', () => {
  it('walks forward one square per step', () => {
    expect(buildStepPath(10, 3, GOAL)).toEqual([11, 12, 13]);
  });
  it('reaches the goal then bounces back', () => {
    // from 283 dice 5: 284,285, turn, 284,283,282
    expect(buildStepPath(283, 5, GOAL)).toEqual([284, 285, 284, 283, 282]);
  });
  it('ends on the goal with an exact roll', () => {
    const path = buildStepPath(282, 3, GOAL);
    expect(path[path.length - 1]).toBe(GOAL);
  });
});

describe('resolveMove', () => {
  it('resolves a normal move', () => {
    const r = resolveMove(10, 4, GOAL, NO_SNAKES, NO_LADDERS);
    expect(r.to).toBe(14);
    expect(r.outcome).toBe('normal');
    expect(r.jumpTo).toBeNull();
  });

  it('climbs a ladder when landing on its base', () => {
    const r = resolveMove(5, 3, GOAL, NO_SNAKES, { 8: 31 });
    expect(r.landing).toBe(8);
    expect(r.to).toBe(31);
    expect(r.outcome).toBe('ladder');
  });

  it('descends a snake when landing on its head', () => {
    const r = resolveMove(38, 2, GOAL, { 40: 12 }, NO_LADDERS);
    expect(r.landing).toBe(40);
    expect(r.to).toBe(12);
    expect(r.outcome).toBe('snake');
  });

  it('wins on exact landing', () => {
    const r = resolveMove(282, 3, GOAL, NO_SNAKES, NO_LADDERS);
    expect(r.to).toBe(GOAL);
    expect(r.outcome).toBe('win');
  });

  it('marks a bounce-back move', () => {
    const r = resolveMove(283, 5, GOAL, NO_SNAKES, NO_LADDERS);
    expect(r.to).toBe(282);
    expect(r.outcome).toBe('bounce');
  });
});

describe('getMovePath', () => {
  it('is just the walk when there is no jump', () => {
    const r = resolveMove(10, 4, GOAL, NO_SNAKES, NO_LADDERS);
    expect(getMovePath(r)).toEqual([11, 12, 13, 14]);
  });

  it('appends the jump destination after the walk', () => {
    const r = resolveMove(5, 3, GOAL, NO_SNAKES, { 8: 31 });
    // walks 6,7,8 then jumps to 31
    expect(getMovePath(r)).toEqual([6, 7, 8, 31]);
  });
});
