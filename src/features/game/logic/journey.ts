/**
 * Soul journey builder (pure).
 *
 * Turns a resolved move into the ordered list of animated "legs" the soul plays:
 * the numeric walk (square by square), then each snake/ladder/realm hop. A hop
 * that matches a drawn serpent expands into that snake's spine so the soul
 * slithers DOWN the visible body rather than cutting straight to the tail.
 *
 * Shared by the soul token (`useSoulMovement`) AND the camera (`useFollowSoul`)
 * so they replay the EXACT same points and timings — the board travels in step
 * with the soul, including the slow descent of a long snake.
 */
import { SOUL_MOVEMENT } from '@/constants';
import { positionKey } from '@/data';
import type { MoveResult, Position } from '@/types';

interface Pt {
  x: number;
  y: number;
}

/** One animated leg: a target point, its duration, and its motion style. */
export interface JourneyLeg {
  x: number;
  y: number;
  duration: number;
  /** 'step' = a walk square, 'slither' = a snake-spine point, 'jump' = a leap. */
  kind: 'step' | 'slither' | 'jump';
}

/**
 * Build the soul's journey for a move.
 *
 *  - `centers`: position key (square id / realm key / JANMASTHAN) -> board point.
 *  - `snakeCenterlines`: snake head -> the spine points down to its destination.
 *
 * Returns `null` if any required center is missing (caller should wait/retry).
 */
export function buildSoulJourney(
  move: MoveResult,
  centers: Map<string | number, Pt>,
  snakeCenterlines: Map<string | number, Pt[]>,
): JourneyLeg[] | null {
  const legs: JourneyLeg[] = [];
  let cursor: Position = move.from;

  // Walk forward, square by square.
  for (const s of move.steps) {
    const c = centers.get(positionKey(s));
    if (!c) {
      return null;
    }
    legs.push({ x: c.x, y: c.y, duration: SOUL_MOVEMENT.stepDurationMs, kind: 'step' });
    cursor = s;
  }

  // Resolve each hop (ladder / snake / realm).
  for (const hop of move.hops) {
    if (hop.to === cursor) {
      continue; // walk/enter hop — already standing there
    }
    const dest = centers.get(positionKey(hop.to));
    if (!dest) {
      return null;
    }
    const spine = snakeCenterlines.get(positionKey(cursor));
    const tail = spine?.[spine.length - 1];
    const followsSnake =
      !!tail && Math.hypot(tail.x - dest.x, tail.y - dest.y) < 0.5;
    if (followsSnake && spine) {
      // Glide down the serpent's body at a steady per-point pace (skip the head,
      // already occupied) so long and short snakes both descend calmly.
      for (const p of spine.slice(1)) {
        legs.push({
          x: p.x,
          y: p.y,
          duration: SOUL_MOVEMENT.snakeStepDurationMs,
          kind: 'slither',
        });
      }
    } else {
      legs.push({ x: dest.x, y: dest.y, duration: SOUL_MOVEMENT.jumpDurationMs, kind: 'jump' });
    }
    cursor = hop.to;
  }

  return legs;
}
