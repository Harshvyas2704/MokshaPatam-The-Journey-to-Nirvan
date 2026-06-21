/**
 * useBoardLayout
 *
 * Memoized bridge between the (static) board dataset and the pure layout
 * engine. Recomputes only when the measured container size changes. Returns
 * `null` until the container has been measured (width/height > 0).
 */
import { useMemo } from 'react';
import { boardCells } from '@/data';
import { computeBoardLayout } from '../layout';
import type { BoardLayout, ContainerSize } from '../types';

export function useBoardLayout(container: ContainerSize): BoardLayout | null {
  const { width, height } = container;
  return useMemo<BoardLayout | null>(() => {
    if (width <= 0 || height <= 0) {
      return null;
    }
    // Cell size is fixed; the container size only gates readiness.
    return computeBoardLayout(boardCells);
  }, [width, height]);
}
