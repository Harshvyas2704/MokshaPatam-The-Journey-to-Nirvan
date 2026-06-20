/**
 * SnakesLaddersLayer — draws the snakes and ladders over the board (SVG).
 *
 * Lives inside the board surface (between the cells and the soul token) so it
 * zooms/pans with everything else. Snake bodies are smooth S-curves with a head
 * + eye; ladders are two rails with rungs. The snake/ladder used by the latest
 * move is drawn at full opacity ("transition handling"), the rest are dimmed.
 *
 * Uses placeholder snake/ladder data; the geometry is data-driven, so the real
 * dataset drops in without changes.
 */
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { BOARD_OVERLAY } from '@/constants';
import { ladders, snakes } from '@/data';
import { useGameStore } from '@/store';
import { buildLadder, buildSnakePath, type Point } from '../svg';
import { getCellCenter } from '../layout';
import type { BoardLayout } from '../types';

interface SnakesLaddersLayerProps {
  layout: BoardLayout;
}

const SnakesLaddersLayerComponent: React.FC<SnakesLaddersLayerProps> = ({
  layout,
}) => {
  const lastMove = useGameStore(state => state.lastMove);

  const cellSize = layout.dimensions.cellSize;
  const strokeWidth = Math.max(2, cellSize * BOARD_OVERLAY.strokeRatio);
  const headRadius = cellSize * BOARD_OVERLAY.snakeHeadRatio;
  const railOffset = cellSize * BOARD_OVERLAY.railOffsetRatio;
  const rungSpacing = cellSize * BOARD_OVERLAY.rungSpacingRatio;

  const centers = useMemo(() => {
    const map = new Map<number, Point>();
    for (const cell of layout.positionedCells) {
      map.set(cell.id, getCellCenter(cell));
    }
    return map;
  }, [layout]);

  const snakeShapes = useMemo(() => {
    return snakes
      .map(snake => {
        const head = centers.get(snake.from);
        const tail = centers.get(snake.to);
        if (!head || !tail) {
          return null;
        }
        const distance = Math.hypot(tail.x - head.x, tail.y - head.y);
        return {
          id: snake.id,
          from: snake.from,
          path: buildSnakePath(
            head,
            tail,
            distance * BOARD_OVERLAY.snakeAmplitudeRatio,
          ),
          head,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [centers]);

  const ladderShapes = useMemo(() => {
    return ladders
      .map(ladder => {
        const base = centers.get(ladder.from);
        const top = centers.get(ladder.to);
        if (!base || !top) {
          return null;
        }
        return {
          id: ladder.id,
          from: ladder.from,
          geometry: buildLadder(base, top, railOffset, rungSpacing),
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [centers, railOffset, rungSpacing]);

  const activeSnakeFrom =
    lastMove && lastMove.outcome === 'snake' ? lastMove.landing : null;
  const activeLadderFrom =
    lastMove && lastMove.outcome === 'ladder' ? lastMove.landing : null;

  return (
    <Svg
      style={styles.overlay}
      width={layout.dimensions.boardWidth}
      height={layout.dimensions.boardHeight}
      pointerEvents="none">
      {ladderShapes.map(ladder => {
        const opacity =
          ladder.from === activeLadderFrom
            ? BOARD_OVERLAY.activeOpacity
            : BOARD_OVERLAY.idleOpacity;
        return (
          <React.Fragment key={ladder.id}>
            {ladder.geometry.rails.map((rail, i) => (
              <Line
                key={`${ladder.id}-rail-${i}`}
                x1={rail.x1}
                y1={rail.y1}
                x2={rail.x2}
                y2={rail.y2}
                stroke={BOARD_OVERLAY.ladderRail}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity={opacity}
              />
            ))}
            {ladder.geometry.rungs.map((rung, i) => (
              <Line
                key={`${ladder.id}-rung-${i}`}
                x1={rung.x1}
                y1={rung.y1}
                x2={rung.x2}
                y2={rung.y2}
                stroke={BOARD_OVERLAY.ladderRung}
                strokeWidth={strokeWidth * 0.7}
                strokeLinecap="round"
                opacity={opacity}
              />
            ))}
          </React.Fragment>
        );
      })}

      {snakeShapes.map(snake => {
        const active = snake.from === activeSnakeFrom;
        const opacity = active
          ? BOARD_OVERLAY.activeOpacity
          : BOARD_OVERLAY.idleOpacity;
        return (
          <React.Fragment key={snake.id}>
            <Path
              d={snake.path}
              stroke={BOARD_OVERLAY.snakeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              opacity={opacity}
            />
            <Circle
              cx={snake.head.x}
              cy={snake.head.y}
              r={headRadius}
              fill={BOARD_OVERLAY.snakeColor}
              opacity={opacity}
            />
            <Circle
              cx={snake.head.x}
              cy={snake.head.y}
              r={Math.max(1.5, headRadius * 0.28)}
              fill={BOARD_OVERLAY.snakeEye}
              opacity={opacity}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export const SnakesLaddersLayer = React.memo(SnakesLaddersLayerComponent);
SnakesLaddersLayer.displayName = 'SnakesLaddersLayer';
