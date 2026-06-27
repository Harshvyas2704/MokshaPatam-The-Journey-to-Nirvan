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
import { positionKey } from '@/data';
import { useGameStore } from '@/store';
import { buildSnakeCenterlines } from '@/features/board/svg';
import { buildSoulJourney } from '@/features/game/logic';
import { SOUL_MOVEMENT } from '@/constants';
import type { JourneyLeg } from '@/features/game/logic';
import type { PlayerState } from '@/types';
import type { BoardLayout } from '@/features/board/types';
import { getSoulCenter } from '../positioning';

interface Point {
  x: number;
  y: number;
}

/** Motion curve for a leg: walk/slither glide linearly, a leap eases in-out. */
function easingFor(kind: JourneyLeg['kind']): (t: number) => number {
  return kind === 'jump' ? Easing.inOut(Easing.ease) : Easing.linear;
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

  // Per-head snake spines, so a downward snake hop glides along the very curve
  // the player sees instead of cutting straight to the tail.
  const snakeCenterlines = useMemo(
    () => buildSnakeCenterlines(key => centers.get(key), layout.dimensions.cellSize),
    [centers, layout.dimensions.cellSize],
  );

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

    // Build the journey (walk + snake-spine slither + jumps) — shared with the
    // camera so the board travels in step with the soul.
    const legs = buildSoulJourney(lastMove, centers, snakeCenterlines);
    if (!legs) {
      return; // some centers missing — wait until ready
    }
    animatedRollId.current = totalRolls;

    // Blocked move (overshoot / stuck on the grave): nothing to animate.
    if (legs.length === 0) {
      setMoving(false);
      return;
    }

    // Reduced Motion: snap straight to the final position.
    if (reduceMotion) {
      const last = legs[legs.length - 1];
      translateX.value = last.x;
      translateY.value = last.y;
      setMoving(false);
      return;
    }

    translateX.value = from.x;
    translateY.value = from.y;

    const lastIndex = legs.length - 1;
    // On a turn switch, hold at the start while the camera glides over.
    const hold = { duration: SOUL_MOVEMENT.prePanMs, easing: Easing.linear };
    const xSteps = legs.map(leg =>
      withTiming(leg.x, { duration: leg.duration, easing: easingFor(leg.kind) }),
    );
    const ySteps = legs.map((leg, i) =>
      withTiming(
        leg.y,
        { duration: leg.duration, easing: easingFor(leg.kind) },
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
    snakeCenterlines,
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
