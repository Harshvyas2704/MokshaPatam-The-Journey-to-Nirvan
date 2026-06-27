/**
 * useFollowSoul — keeps the moving soul in view ("camera follow").
 *
 * The board viewport owns the pan/zoom offset (translateX/Y, scale). As the soul
 * walks square-by-square (and jumps via snakes/ladders), this hook glides that
 * offset so each cell the soul reaches is centered in the viewport — replaying
 * the SAME path and timings the soul uses, so the camera tracks it rather than
 * jumping ahead. Respects the current zoom and the existing pan boundaries, and
 * leaves the offset wherever it lands so subsequent gestures continue smoothly.
 */
import { useEffect, useMemo, useRef } from 'react';
import {
  Easing,
  useReducedMotion,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SOUL_MOVEMENT } from '@/constants';
import { positionKey } from '@/data';
import { useGameStore } from '@/store';
import { buildSoulJourney, type JourneyLeg } from '@/features/game/logic';
import { getCellCenter } from '../layout';
import { buildSnakeCenterlines } from '../svg';
import { clampOffset } from '../zoom';
import type { BoardLayout } from '../types';

interface Point {
  x: number;
  y: number;
}

/** Motion curve for a leg: walk/slither glide linearly, a leap eases in-out. */
function easingFor(kind: JourneyLeg['kind']): (t: number) => number {
  return kind === 'jump' ? Easing.inOut(Easing.ease) : Easing.linear;
}

interface FollowSoulParams {
  layout: BoardLayout | null;
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  viewportWidth: number;
  viewportHeight: number;
}

export function useFollowSoul({
  layout,
  scale,
  translateX,
  translateY,
  viewportWidth,
  viewportHeight,
}: FollowSoulParams): void {
  const lastMove = useGameStore(state => state.lastMove);
  const totalRolls = useGameStore(state => state.totalRolls);
  const turnSwitched = useGameStore(state => state.lastMoveTurnSwitched);
  const followedRollId = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  // Position key (square id / realm / janmasthan) -> board-local center.
  const centers = useMemo(() => {
    const map = new Map<string | number, Point>();
    if (layout) {
      for (const cell of layout.positionedCells) {
        map.set(cell.id, getCellCenter(cell));
      }
      for (const oc of layout.offboardCells) {
        map.set(oc.key, getCellCenter(oc));
      }
    }
    return map;
  }, [layout]);

  // Snake spines (same as the soul uses) so the camera tracks a slithering
  // descent point-for-point instead of leaping to the tail.
  const snakeCenterlines = useMemo(
    () =>
      layout
        ? buildSnakeCenterlines(key => centers.get(key), layout.dimensions.cellSize)
        : new Map<number | string, Point[]>(),
    [centers, layout],
  );

  useEffect(() => {
    if (!layout || !lastMove || followedRollId.current === totalRolls) {
      return;
    }
    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return;
    }
    // Replay the SAME journey the soul plays (walk + snake-spine slither +
    // jumps) so the board travels in lock-step with it.
    const legs = buildSoulJourney(lastMove, centers, snakeCenterlines);
    if (!legs || legs.length === 0) {
      // Blocked move (or centers not ready). Mark handled so we don't loop.
      followedRollId.current = totalRolls;
      return;
    }
    followedRollId.current = totalRolls;

    const { boardWidth, boardHeight } = layout.dimensions;
    const s = scale.value; // sample the zoom at the start of the move

    // Offset that centers a given board-local point, clamped to pan bounds.
    const offsetFor = (point: Point) => ({
      x: clampOffset(
        (boardWidth / 2 - point.x) * s,
        boardWidth * s,
        viewportWidth,
      ),
      y: clampOffset(
        (boardHeight / 2 - point.y) * s,
        boardHeight * s,
        viewportHeight,
      ),
    });

    const offsets = legs.map(leg => ({
      ...offsetFor(leg),
      duration: leg.duration,
      easing: easingFor(leg.kind),
    }));

    // Reduced Motion: jump straight to the final framing, no glide.
    if (reduceMotion) {
      const last = offsets[offsets.length - 1];
      translateX.value = last.x;
      translateY.value = last.y;
      return;
    }

    const xSteps = offsets.map(o =>
      withTiming(o.x, { duration: o.duration, easing: o.easing }),
    );
    const ySteps = offsets.map(o =>
      withTiming(o.y, { duration: o.duration, easing: o.easing }),
    );

    // On a turn switch, first glide the camera to the new player's token
    // (its starting cell) before following the move — "scroll there first".
    if (turnSwitched) {
      const from = centers.get(positionKey(lastMove.from));
      if (from) {
        const o = offsetFor(from);
        const hold = { duration: SOUL_MOVEMENT.prePanMs, easing: Easing.linear };
        translateX.value = withSequence(withTiming(o.x, hold), ...xSteps);
        translateY.value = withSequence(withTiming(o.y, hold), ...ySteps);
        return;
      }
    }

    translateX.value = withSequence(...xSteps);
    translateY.value = withSequence(...ySteps);
  }, [
    layout,
    lastMove,
    totalRolls,
    turnSwitched,
    centers,
    snakeCenterlines,
    scale,
    translateX,
    translateY,
    viewportWidth,
    viewportHeight,
    reduceMotion,
  ]);
}
