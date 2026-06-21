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
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BOARD_ZOOM, colors } from '@/constants';
import { useBoardLayout } from '../hooks/useBoardLayout';
import { useFollowSoul } from '../hooks/useFollowSoul';
import type { ContainerSize } from '../types';
import { computeMinScale, getBottomAlignedTranslateY } from '../zoom';
import { BoardCanvas } from './BoardCanvas';

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

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  // Align to the bottom (cell 1) once, when the board is first measured.
  useEffect(() => {
    if (hasAligned.current || !layout || viewportHeight <= 0) {
      return;
    }
    hasAligned.current = true;
    const initialY = getBottomAlignedTranslateY(boardHeight, viewportHeight);
    translateY.value = initialY;
    savedTranslateY.value = initialY;
  }, [layout, boardHeight, viewportHeight, translateY, savedTranslateY]);

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
    const { maxScale, doubleTapScale } = BOARD_ZOOM;

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
        const target = scale.value > 1 ? 1 : doubleTapScale;
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

    return Gesture.Simultaneous(pan, pinch, doubleTap);
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
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.viewport} onLayout={onLayout}>
      {layout ? (
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.surface, animatedStyle]}>
            <BoardCanvas layout={layout} />
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default BoardRenderer;
