/**
 * Move calculation (pure).
 *
 * Implements the master-prompt rules:
 *  - Move forward by the dice value.
 *  - You must land EXACTLY on the goal; an overshoot bounces back off the goal
 *    by the remaining steps (reflection).
 *  - If you land on a snake head you slide to its tail; on a ladder base you
 *    climb to its top.
 *
 * The forward/bounce walk is returned as an explicit `steps` path so the Phase 6
 * movement animation can replay it square-by-square. Snake/ladder is a separate
 * jump (`jumpTo`).
 */
import { FIRST_CELL } from '@/constants';
import type { MoveOutcome, MoveResult } from '@/types';

/** Map of head/base square -> destination square (numeric snakes/ladders). */
export type JumpMap = Record<number, number>;

/**
 * The square reached after walking `dice` steps from `from`, reflecting off the
 * goal on overshoot. Pure arithmetic (mirrors {@link buildStepPath}'s end).
 */
export function reflectLanding(from: number, dice: number, goal: number): number {
  const raw = from + dice;
  if (raw <= goal) {
    return raw;
  }
  // Bounce: every step past the goal goes backward instead.
  return 2 * goal - raw;
}

/**
 * The square-by-square walk from `from` (exclusive) to the landing square
 * (inclusive), bouncing backward once the goal is reached.
 */
export function buildStepPath(
  from: number,
  dice: number,
  goal: number,
): number[] {
  const steps: number[] = [];
  let pos = from;
  let direction: 1 | -1 = 1;

  for (let remaining = dice; remaining > 0; remaining--) {
    if (direction === 1 && pos >= goal) {
      direction = -1; // hit the goal, turn around
    }
    pos += direction;
    if (pos < FIRST_CELL) {
      pos = FIRST_CELL; // never walk below the first cell
    }
    steps.push(pos);
  }
  return steps;
}

/**
 * The full ordered list of squares the token visits for a move: the walk
 * (incl. bounce), then the snake/ladder jump if any. Used by the movement
 * animation. Starts after `from` (which the token already occupies).
 */
export function getMovePath(move: MoveResult): number[] {
  return move.jumpTo != null ? [...move.steps, move.jumpTo] : [...move.steps];
}

/** Resolve a full move: walk, bounce, then snake/ladder. */
export function resolveMove(
  from: number,
  dice: number,
  goal: number,
  snakes: JumpMap,
  ladders: JumpMap,
): MoveResult {
  const steps = buildStepPath(from, dice, goal);
  const landing = steps.length > 0 ? steps[steps.length - 1] : from;
  const bounced = from + dice > goal;

  let jumpTo: number | null = null;
  let outcome: MoveOutcome;

  if (landing === goal) {
    outcome = 'win';
  } else if (snakes[landing] !== undefined) {
    jumpTo = snakes[landing];
    outcome = 'snake';
  } else if (ladders[landing] !== undefined) {
    jumpTo = ladders[landing];
    outcome = 'ladder';
  } else if (bounced) {
    outcome = 'bounce';
  } else {
    outcome = 'normal';
  }

  return {
    from,
    dice,
    steps,
    landing,
    jumpTo,
    to: jumpTo ?? landing,
    outcome,
  };
}
