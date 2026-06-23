/**
 * useSoulMovement (per player)
 *
 * Drives one player's soul token. The store commits the logical result of a
 * move immediately and records it as `lastMove` (+ `lastMovePlayerId`); this
 * hook plays the VISUAL journey for the ACTIVE player — animating square-by-
 * square along the walk path, then the snake/ladder/realm jump — never
 * teleporting. Tokens that aren't the active mover simply rest on their cell.
 *
 * When the turn switches to a different player, the token first HOLDS in place
 * for `prePanMs` (while the camera glides to it), then moves — so the board
 * "scrolls there first, then starts the soul's motion".
 *
 * Only the active token clears `isMoving` when its animation finishes.
 */
import { useEffect, useMemo, useRef } from 'react';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { SOUL_MOVEMENT } from '@/constants';
import { positionKey } from '@/data';
import { useGameStore } from '@/store';
import { getMovePath } from '@/features/game/logic/movement';
import type { PlayerState } from '@/types';
import type { BoardLayout } from '@/features/board/types';
import { getSoulCenter } from '../positioning';

interface Point {
  x: number;
  y: number;
}

export function useSoulMovement(
  player: PlayerState,
  layout: BoardLayout,
  boxSize: number,
  offset: Point = { x: 0, y: 0 },
): AnimatedStyle {
  const lastMove = useGameStore(state => state.lastMove);
  const lastMovePlayerId = useGameStore(state => state.lastMovePlayerId);
  const turnSwitched = useGameStore(state => state.lastMoveTurnSwitched);
  const totalRolls = useGameStore(state => state.totalRolls);
  const setMoving = useGameStore(state => state.setMoving);
  const reduceMotion = useReducedMotion();

  const isActive = lastMovePlayerId === player.id;

  // Position key (square id, realm string, or JANMASTHAN) -> pixel center.
  const centers = useMemo(() => {
    const map = new Map<string | number, Point>();
    for (const cell of layout.positionedCells) {
      const c = getSoulCenter(cell);
      map.set(cell.id, { x: c.centerX, y: c.centerY });
    }
    for (const oc of layout.offboardCells) {
      map.set(oc.key, { x: oc.x + oc.size / 2, y: oc.y + oc.size / 2 });
    }
    return map;
  }, [layout]);

  const posKey = positionKey(player.realm ?? player.currentSquare);
  const start = centers.get(posKey);
  const translateX = useSharedValue(start ? start.x : 0);
  const translateY = useSharedValue(start ? start.y : 0);
  const animatedRollId = useRef<number | null>(null);

  // Idle: when this token is NOT the active mover (or before any move), pin it
  // to its resting cell. Re-snaps if the player's position changes.
  useEffect(() => {
    if (lastMove && isActive) {
      return; // the active token is being animated by the effect below
    }
    const center = centers.get(posKey);
    if (center) {
      translateX.value = center.x;
      translateY.value = center.y;
    }
    animatedRollId.current = null;
  }, [lastMove, isActive, centers, posKey, translateX, translateY]);

  // Play the (optional pre-pan hold +) walk + jump for the active mover's roll.
  useEffect(() => {
    if (!lastMove || !isActive || animatedRollId.current === totalRolls) {
      return;
    }
    const from = centers.get(positionKey(lastMove.from));
    if (!from) {
      return; // centers not ready yet; re-runs when they are
    }
    const rawPath = getMovePath(lastMove);
    const targets = rawPath
      .map(p => centers.get(positionKey(p)))
      .filter((p): p is Point => p !== undefined);
    if (rawPath.length > 0 && targets.length !== rawPath.length) {
      return; // some centers missing — wait until ready
    }
    animatedRollId.current = totalRolls;

    // Blocked move (overshoot / stuck on the grave): nothing to animate.
    if (targets.length === 0) {
      setMoving(false);
      return;
    }

    // Reduced Motion: snap straight to the final position.
    if (reduceMotion) {
      const last = targets[targets.length - 1];
      translateX.value = last.x;
      translateY.value = last.y;
      setMoving(false);
      return;
    }

    translateX.value = from.x;
    translateY.value = from.y;

    const stepCount = lastMove.steps.length;
    const lastIndex = targets.length - 1;
    const timing = (i: number) =>
      i < stepCount
        ? { duration: SOUL_MOVEMENT.stepDurationMs, easing: Easing.linear }
        : {
            duration: SOUL_MOVEMENT.jumpDurationMs,
            easing: Easing.inOut(Easing.ease),
          };

    // On a turn switch, hold at the start while the camera glides over.
    const hold = { duration: SOUL_MOVEMENT.prePanMs, easing: Easing.linear };
    const xSteps = targets.map((p, i) => withTiming(p.x, timing(i)));
    const ySteps = targets.map((p, i) =>
      withTiming(
        p.y,
        timing(i),
        i === lastIndex
          ? (finished?: boolean) => {
              'worklet';
              if (finished) {
                runOnJS(setMoving)(false);
              }
            }
          : undefined,
      ),
    );

    if (turnSwitched) {
      translateX.value = withSequence(withTiming(from.x, hold), ...xSteps);
      translateY.value = withSequence(withTiming(from.y, hold), ...ySteps);
    } else {
      translateX.value = withSequence(...xSteps);
      translateY.value = withSequence(...ySteps);
    }
  }, [
    lastMove,
    isActive,
    turnSwitched,
    totalRolls,
    centers,
    setMoving,
    translateX,
    translateY,
    reduceMotion,
  ]);

  return useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - boxSize / 2 + offset.x },
      { translateY: translateY.value - boxSize / 2 + offset.y },
    ],
  }));
}
