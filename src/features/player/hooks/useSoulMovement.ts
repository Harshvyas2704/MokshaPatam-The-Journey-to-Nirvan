/**
 * useSoulMovement
 *
 * Drives the soul token's animated position. The store commits the logical
 * result of a move immediately and records it as `lastMove`; this hook plays the
 * VISUAL journey: it animates the token square-by-square along the move's walk
 * path (including the bounce off the goal), then performs the snake/ladder jump
 * as a final, longer eased segment — never teleporting.
 *
 * Returns an animated style that positions the token's box so its center sits on
 * the current cell center. Clears `isMoving` when the sequence finishes.
 */
import { useEffect, useMemo, useRef } from 'react';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { SOUL_MOVEMENT } from '@/constants';
import { useGameStore } from '@/store';
import { getMovePath } from '@/features/game/logic/movement';
import type { BoardLayout } from '@/features/board/types';
import { getSoulCenter } from '../positioning';

interface Point {
  x: number;
  y: number;
}

export function useSoulMovement(
  layout: BoardLayout,
  boxSize: number,
): AnimatedStyle {
  const currentSquare = useGameStore(state => state.currentSquare);
  const lastMove = useGameStore(state => state.lastMove);
  const totalRolls = useGameStore(state => state.totalRolls);
  const setMoving = useGameStore(state => state.setMoving);

  // Square id -> pixel center, rebuilt only when the layout changes.
  const centers = useMemo(() => {
    const map = new Map<number, Point>();
    for (const cell of layout.positionedCells) {
      const c = getSoulCenter(cell);
      map.set(cell.id, { x: c.centerX, y: c.centerY });
    }
    return map;
  }, [layout]);

  // Start the token at the current cell (correct on first render / reset).
  const start = centers.get(currentSquare);
  const translateX = useSharedValue(start ? start.x : 0);
  const translateY = useSharedValue(start ? start.y : 0);
  const animatedRollId = useRef<number | null>(null);

  // Snap to the current square when idle (no pending move) — e.g. after reset.
  useEffect(() => {
    if (lastMove) {
      return;
    }
    const center = centers.get(currentSquare);
    if (center) {
      translateX.value = center.x;
      translateY.value = center.y;
    }
    animatedRollId.current = null;
  }, [lastMove, centers, currentSquare, translateX, translateY]);

  // Play the walk + jump whenever a new move is recorded.
  useEffect(() => {
    if (!lastMove || animatedRollId.current === totalRolls) {
      return;
    }
    const from = centers.get(lastMove.from);
    const targets = getMovePath(lastMove)
      .map(id => centers.get(id))
      .filter((p): p is Point => p !== undefined);
    if (!from || targets.length === 0) {
      return; // centers not ready yet; re-runs when they are
    }
    animatedRollId.current = totalRolls;

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

    translateX.value = withSequence(
      ...targets.map((p, i) => withTiming(p.x, timing(i))),
    );
    translateY.value = withSequence(
      ...targets.map((p, i) =>
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
      ),
    );
  }, [lastMove, totalRolls, centers, setMoving, translateX, translateY]);

  return useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - boxSize / 2 },
      { translateY: translateY.value - boxSize / 2 },
    ],
  }));
}
