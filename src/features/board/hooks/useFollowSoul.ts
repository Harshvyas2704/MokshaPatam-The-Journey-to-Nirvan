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
import { getMovePath } from '@/features/game/logic/movement';
import { getCellCenter } from '../layout';
import { clampOffset } from '../zoom';
import type { BoardLayout } from '../types';

interface Point {
  x: number;
  y: number;
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

  useEffect(() => {
    if (!layout || !lastMove || followedRollId.current === totalRolls) {
      return;
    }
    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return;
    }
    const targets = getMovePath(lastMove)
      .map(p => centers.get(positionKey(p)))
      .filter((p): p is Point => p !== undefined);
    if (targets.length === 0) {
      // Blocked move (or centers not ready). Mark handled so we don't loop.
      followedRollId.current = totalRolls;
      return;
    }
    followedRollId.current = totalRolls;

    const { boardWidth, boardHeight } = layout.dimensions;
    const s = scale.value; // sample the zoom at the start of the move
    const stepCount = lastMove.steps.length;

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

    // Match the soul's per-step / per-jump cadence so the camera tracks it.
    const timing = (i: number) =>
      i < stepCount
        ? { duration: SOUL_MOVEMENT.stepDurationMs, easing: Easing.linear }
        : {
            duration: SOUL_MOVEMENT.jumpDurationMs,
            easing: Easing.inOut(Easing.ease),
          };

    const offsets = targets.map(offsetFor);

    // Reduced Motion: jump straight to the final framing, no glide.
    if (reduceMotion) {
      const last = offsets[offsets.length - 1];
      translateX.value = last.x;
      translateY.value = last.y;
      return;
    }

    translateX.value = withSequence(
      ...offsets.map((o, i) => withTiming(o.x, timing(i))),
    );
    translateY.value = withSequence(
      ...offsets.map((o, i) => withTiming(o.y, timing(i))),
    );
  }, [
    layout,
    lastMove,
    totalRolls,
    centers,
    scale,
    translateX,
    translateY,
    viewportWidth,
    viewportHeight,
    reduceMotion,
  ]);
}
