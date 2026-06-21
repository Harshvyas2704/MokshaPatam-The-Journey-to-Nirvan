/**
 * BoardRenderer — the interactive board viewport (Phase 3).
 *
 * Measures the available area, lays the board out to that width, then hosts the
 * board inside a pinch-to-zoom / pan surface built on Gesture Handler +
 * Reanimated (60fps, UI thread). Panning and zooming are bounded so the board
 * can never be dragged completely out of view, and a double-tap toggles zoom.
 *
 * Only the board moves; the surrounding screen controls stay fixed. The board
 * is initially aligned to its bottom so cell 1 (the soul's birth) is in view.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BOARD_ZOOM, colors, radius, spacing, typography } from '@/constants';
import { useBoardLayout } from '../hooks/useBoardLayout';
import { useFollowSoul } from '../hooks/useFollowSoul';
import type { ContainerSize, PositionedCell } from '../types';
import { computeMinScale, getMaxOffset } from '../zoom';
import { BoardCanvas } from './BoardCanvas';
import { CellDetailModal } from './CellDetailModal';

const ZERO_SIZE: ContainerSize = { width: 0, height: 0 };
const TIMING = { duration: 220 };

/** Worklet clamp of a translation offset to the centered-board bounds. */
function clampOffsetW(
  value: number,
  scaledSize: number,
  viewportSize: number,
): number {
  'worklet';
  const max = Math.max(0, (scaledSize - viewportSize) / 2);
  if (value > max) {
    return max;
  }
  if (value < -max) {
    return -max;
  }
  return value;
}

const BoardRenderer: React.FC = () => {
  const [viewport, setViewport] = useState<ContainerSize>(ZERO_SIZE);
  const layout = useBoardLayout(viewport);
  const hasAligned = useRef(false);

  // Board-only view: hide the snakes & ladders overlay to read the squares.
  const [showOverlay, setShowOverlay] = useState(true);
  const onToggleOverlay = useCallback(() => setShowOverlay(v => !v), []);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const boardWidth = layout?.dimensions.boardWidth ?? 0;
  const boardHeight = layout?.dimensions.boardHeight ?? 0;
  const viewportWidth = viewport.width;
  const viewportHeight = viewport.height;

  const minScale = useMemo(
    () =>
      computeMinScale(boardWidth, boardHeight, viewportWidth, viewportHeight),
    [boardWidth, boardHeight, viewportWidth, viewportHeight],
  );

  // Tap-to-inspect: the selected cell drives the detail modal.
  const [selectedCell, setSelectedCell] = useState<PositionedCell | null>(null);
  const onPickCell = useCallback(
    (localX: number, localY: number) => {
      if (!layout) {
        return;
      }
      const cell = layout.positionedCells.find(
        c =>
          localX >= c.x &&
          localX <= c.x + c.size &&
          localY >= c.y &&
          localY <= c.y + c.size,
      );
      if (cell) {
        setSelectedCell(cell);
      }
    },
    [layout],
  );
  const onCloseDetail = useCallback(() => setSelectedCell(null), []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  // Start at a readable zoom focused on square 1 (bottom-left) once measured.
  // The user can pinch out from here to reach the whole-board overview.
  useEffect(() => {
    if (
      hasAligned.current ||
      !layout ||
      viewportWidth <= 0 ||
      viewportHeight <= 0
    ) {
      return;
    }
    hasAligned.current = true;
    const s = BOARD_ZOOM.initialScale;
    scale.value = s;
    savedScale.value = s;
    // Reveal the bottom (the naraka band + janmasthan, where the soul starts),
    // centered horizontally.
    const initialX = 0;
    const initialY = -getMaxOffset(boardHeight * s, viewportHeight);
    translateX.value = initialX;
    savedTranslateX.value = initialX;
    translateY.value = initialY;
    savedTranslateY.value = initialY;
  }, [
    layout,
    boardWidth,
    boardHeight,
    viewportWidth,
    viewportHeight,
    scale,
    savedScale,
    translateX,
    savedTranslateX,
    translateY,
    savedTranslateY,
  ]);

  // Keep the moving soul in view by gliding the pan offset along its path.
  useFollowSoul({
    layout,
    scale,
    translateX,
    translateY,
    viewportWidth,
    viewportHeight,
  });

  const gesture = useMemo(() => {
    const { maxScale, doubleTapScale, initialScale } = BOARD_ZOOM;

    const pan = Gesture.Pan()
      .onStart(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate(event => {
        translateX.value = clampOffsetW(
          savedTranslateX.value + event.translationX,
          boardWidth * scale.value,
          viewportWidth,
        );
        translateY.value = clampOffsetW(
          savedTranslateY.value + event.translationY,
          boardHeight * scale.value,
          viewportHeight,
        );
      });

    const pinch = Gesture.Pinch()
      .onStart(() => {
        savedScale.value = scale.value;
      })
      .onUpdate(event => {
        const next = Math.min(
          maxScale,
          Math.max(minScale, savedScale.value * event.scale),
        );
        // Keep the point under the fingers fixed (focal-point zoom).
        const focalX = event.focalX - viewportWidth / 2;
        const focalY = event.focalY - viewportHeight / 2;
        const ratio = next / scale.value;
        translateX.value = clampOffsetW(
          focalX - (focalX - translateX.value) * ratio,
          boardWidth * next,
          viewportWidth,
        );
        translateY.value = clampOffsetW(
          focalY - (focalY - translateY.value) * ratio,
          boardHeight * next,
          viewportHeight,
        );
        scale.value = next;
      })
      .onEnd(() => {
        savedScale.value = scale.value;
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        // Toggle between the readable home zoom and a closer zoom (never out;
        // zooming out to the overview is reserved for pinch).
        const target =
          scale.value >= (initialScale + doubleTapScale) / 2
            ? initialScale
            : doubleTapScale;
        scale.value = withTiming(target, TIMING);
        translateX.value = withTiming(
          clampOffsetW(translateX.value, boardWidth * target, viewportWidth),
          TIMING,
        );
        translateY.value = withTiming(
          clampOffsetW(translateY.value, boardHeight * target, viewportHeight),
          TIMING,
        );
        savedScale.value = target;
      });

    // Single tap inspects the tapped cell. Convert the viewport tap point into
    // board-local coordinates (undo the current pan/zoom), then hit-test in JS.
    const singleTap = Gesture.Tap()
      .numberOfTaps(1)
      .maxDuration(260)
      .onEnd(event => {
        const localX =
          (event.x - viewportWidth / 2 - translateX.value) / scale.value +
          boardWidth / 2;
        const localY =
          (event.y - viewportHeight / 2 - translateY.value) / scale.value +
          boardHeight / 2;
        runOnJS(onPickCell)(localX, localY);
      });

    // Double tap wins over single tap (so a double doesn't also open details).
    const taps = Gesture.Exclusive(doubleTap, singleTap);
    return Gesture.Simultaneous(pan, pinch, taps);
  }, [
    boardWidth,
    boardHeight,
    viewportWidth,
    viewportHeight,
    minScale,
    scale,
    translateX,
    translateY,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    onPickCell,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Gestures are attached to the (untransformed) viewport, so tap
          coordinates are in viewport space and hit-testing is correct. */}
      <GestureDetector gesture={gesture}>
        <View style={styles.viewport} onLayout={onLayout}>
          {layout ? (
            <Animated.View style={[styles.surface, animatedStyle]}>
              <BoardCanvas layout={layout} showOverlay={showOverlay} />
            </Animated.View>
          ) : null}
        </View>
      </GestureDetector>

      {/* Floating toggle to show the bare board (snakes & ladders hidden). */}
      <TouchableOpacity
        style={styles.overlayToggle}
        onPress={onToggleOverlay}
        accessibilityRole="button"
        accessibilityState={{ selected: !showOverlay }}
        accessibilityLabel={
          showOverlay ? 'Hide snakes and ladders' : 'Show snakes and ladders'
        }>
        <Text style={styles.overlayToggleText}>
          {showOverlay ? 'Board only' : 'Show paths'}
        </Text>
      </TouchableOpacity>

      <CellDetailModal cell={selectedCell} onClose={onCloseDetail} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayToggle: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.copper,
    backgroundColor: colors.overlay,
  },
  overlayToggleText: {
    color: colors.ivory,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export default BoardRenderer;
