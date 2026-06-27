/**
 * Move calculation (pure) — faithful to the reference Mokshapat rules.
 *
 *  - The soul enters the board from janmasthan (position 0) at square 1.
 *  - A normal move steps forward by the dice value. There is NO bounce-back:
 *    an overshoot past 285 simply stays put.
 *  - Landing resolves snakes/ladders, including off-board ones that lead into
 *    realms (नरक / महानरक / लोक), and any chains between them.
 *  - While in a realm, a roll triggers that realm's escape rule
 *    (mahanarak → kshudranarak → janmasthan; maran → janmasthan; the grave
 *    needs four rolls, then → महानरक).
 *
 * The numeric walk is returned as `steps` so the animation can replay it; the
 * final resting place is `to` (a square or a realm).
 */
import type { MoveHop, MoveOutcome, MoveResult, Position } from '@/types';
import { isMahanarak, isNarak, JANMASTHAN, REALM } from '@/data';
import {
  ladderMap,
  ladderOffboardMap,
  realmChainMap,
  snakeHellMap,
  snakeMap,
} from './boardMaps';

export type { JumpMap } from './boardMaps';

const GOAL = 285;

/** Full resolution of a move, plus the counter deltas the store applies. */
export interface ResolvedMove {
  move: MoveResult;
  mrutyuRollCount: number;
  narak: number;
  ladder: number;
  snake: number;
  won: boolean;
}

interface Landing {
  to: Position;
  outcome: MoveOutcome;
  hops: MoveHop[];
  narak: number;
  ladder: number;
  snake: number;
  won: boolean;
}

/** Resolve snakes/ladders (and their chains) from a numeric landing square. */
function resolveLanding(start: number): Landing {
  let cur = start;
  const hops: MoveHop[] = [];
  let outcome: MoveOutcome = 'normal';
  let narak = 0;
  let ladder = 0;
  let snake = 0;

  for (let guard = 0; guard < 8; guard++) {
    if (cur === GOAL) {
      return { to: GOAL, outcome: 'win', hops, narak, ladder, snake, won: true };
    }
    if (ladderMap[cur] !== undefined) {
      cur = ladderMap[cur];
      ladder++;
      outcome = 'ladder';
      hops.push({ to: cur, kind: 'ladder' });
      continue; // a ladder top may feed a snake
    }
    if (ladderOffboardMap[cur] !== undefined) {
      const realm = ladderOffboardMap[cur];
      ladder++;
      hops.push({ to: realm, kind: 'ladder' });
      const chained = realmChainMap[realm];
      if (chained !== undefined) {
        if (isNarak(chained)) {
          narak++;
        }
        hops.push({ to: chained, kind: 'narak' });
        return { to: chained, outcome: 'narak', hops, narak, ladder, snake, won: false };
      }
      return { to: JANMASTHAN, outcome: 'escape', hops, narak, ladder, snake, won: false };
    }
    if (snakeMap[cur] !== undefined) {
      cur = snakeMap[cur];
      snake++;
      outcome = 'snake';
      hops.push({ to: cur, kind: 'snake' });
      continue; // chained snake
    }
    if (snakeHellMap[cur] !== undefined) {
      const realm = snakeHellMap[cur];
      if (isNarak(realm)) {
        narak++;
      }
      hops.push({ to: realm, kind: 'narak' });
      return { to: realm, outcome: 'narak', hops, narak, ladder, snake, won: false };
    }
    break; // stable numeric square
  }
  return { to: cur, outcome, hops, narak, ladder, snake, won: false };
}

function make(
  from: Position,
  dice: number,
  steps: number[],
  landing: number | null,
  to: Position,
  outcome: MoveOutcome,
  hops: MoveHop[],
): MoveResult {
  return { from, dice, steps, landing, to, outcome, hops };
}

/** Resolve a full move from any position. */
export function resolveMove(
  position: Position,
  dice: number,
  mrutyuRollCount: number,
): ResolvedMove {
  // ----- Soul is in a realm: apply that realm's escape rule. -----
  if (typeof position === 'string') {
    if (isMahanarak(position)) {
      const to = REALM.kshudranarak;
      return wrap(make(position, dice, [], null, to, 'escape', [{ to, kind: 'escape' }]), mrutyuRollCount);
    }
    if (position === REALM.grave) {
      const count = mrutyuRollCount + 1;
      if (count < 4) {
        return wrap(make(position, dice, [], null, position, 'blocked', []), count);
      }
      const to = REALM.mahanarakRight;
      return wrap(
        make(position, dice, [], null, to, 'narak', [{ to, kind: 'narak' }]),
        0,
        { narak: 1 },
      );
    }
    // kshudranarak, maran, and any transitional realm -> back to start.
    return wrap(
      make(position, dice, [], null, JANMASTHAN, 'escape', [{ to: JANMASTHAN, kind: 'escape' }]),
      mrutyuRollCount,
    );
  }

  // ----- Enter the board from janmasthan (birth onto square 1). -----
  // The soul may only take birth on a roll of 6; any other roll is blocked and
  // the turn passes to the next player. (A 6 also grants the usual extra roll,
  // so the soul enters on square 1 and then rolls again to set off.)
  if (position === JANMASTHAN) {
    if (dice !== 6) {
      return wrap(make(JANMASTHAN, dice, [], null, JANMASTHAN, 'blocked', []), mrutyuRollCount);
    }
    const land = resolveLanding(1);
    const hops: MoveHop[] = [{ to: 1, kind: 'enter' }, ...land.hops];
    const outcome = land.won ? 'win' : land.hops.length > 0 ? land.outcome : 'enter';
    return wrap(make(JANMASTHAN, dice, [1], 1, land.to, outcome, hops), mrutyuRollCount, land);
  }

  // ----- Normal numeric move (no bounce: overshoot stays put). -----
  const target = position + dice;
  if (target > GOAL) {
    return wrap(make(position, dice, [], null, position, 'blocked', []), mrutyuRollCount);
  }
  const steps: number[] = [];
  for (let s = position + 1; s <= target; s++) {
    steps.push(s);
  }
  const land = resolveLanding(target);
  const outcome = land.won ? 'win' : land.hops.length > 0 ? land.outcome : 'normal';
  const hops: MoveHop[] = [{ to: target, kind: 'walk' }, ...land.hops];
  return wrap(make(position, dice, steps, target, land.to, outcome, hops), mrutyuRollCount, land);
}

/** Assemble the ResolvedMove, folding in any landing deltas. */
function wrap(
  move: MoveResult,
  mrutyuRollCount: number,
  deltas?: { narak?: number; ladder?: number; snake?: number; won?: boolean },
): ResolvedMove {
  return {
    move,
    mrutyuRollCount,
    narak: deltas?.narak ?? 0,
    ladder: deltas?.ladder ?? 0,
    snake: deltas?.snake ?? 0,
    won: deltas?.won ?? move.outcome === 'win',
  };
}

/**
 * The ordered list of positions the token visits for a move (after `from`):
 * the numeric walk, then EACH hop (ladder/snake/realm) in turn — so the soul
 * visibly passes through intermediate stops like a loka before chaining onward
 * to a hell/grave, rather than teleporting straight to the final resting place.
 */
export function getMovePath(move: MoveResult): Position[] {
  const path: Position[] = [...move.steps];
  for (const hop of move.hops) {
    const last: Position = path.length > 0 ? path[path.length - 1] : move.from;
    if (hop.to !== last) {
      path.push(hop.to);
    }
  }
  return path;
}
