/**
 * Zoom / pan boundary math (pure, testable).
 *
 * The board surface is centered in the viewport, then transformed with
 * translate + scale. These helpers keep the (scaled) board from being panned
 * past its edges and compute the allowed scale range. They are plain functions
 * so they can be unit-tested; the gesture worklets re-use the same formulas.
 */
import { BOARD_ZOOM } from '@/constants';
import { clamp } from '@/utils';

/**
 * Maximum translation offset (px) from center, in one axis, that still keeps
 * the scaled content covering the viewport. Zero when the content is smaller
 * than the viewport (it stays centered).
 */
export function getMaxOffset(scaledSize: number, viewportSize: number): number {
  return Math.max(0, (scaledSize - viewportSize) / 2);
}

/** Clamp a translation offset to the allowed range for the given sizes. */
export function clampOffset(
  value: number,
  scaledSize: number,
  viewportSize: number,
): number {
  const max = getMaxOffset(scaledSize, viewportSize);
  return clamp(value, -max, max);
}

/**
 * The smallest scale we allow: enough to fit the whole board in the viewport,
 * but never above 1 (we never force a zoom-out when the board already fits) and
 * never below the configured floor.
 */
export function computeMinScale(
  boardWidth: number,
  boardHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  if (boardWidth <= 0 || boardHeight <= 0) {
    return BOARD_ZOOM.minScaleFloor;
  }
  const fit = Math.min(
    viewportWidth / boardWidth,
    viewportHeight / boardHeight,
  );
  return clamp(Math.min(fit, 1), BOARD_ZOOM.minScaleFloor, 1);
}

/**
 * Initial vertical offset that aligns the BOTTOM of the board with the bottom
 * of the viewport — i.e. shows cell 1 (the soul's birth). A negative offset
 * shifts the content upward to reveal the bottom.
 */
export function getBottomAlignedTranslateY(
  scaledHeight: number,
  viewportHeight: number,
): number {
  return -getMaxOffset(scaledHeight, viewportHeight);
}
