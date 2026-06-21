/**
 * SnakesLaddersLayer — draws the snakes and ladders over the board (SVG).
 *
 * Lives inside the board surface (between the cells and the soul token) so it
 * zooms/pans with everything else. Ladders are faint, thin two-rail shapes that
 * recede behind the cells; snakes are more present — an undulating body with a
 * proper head (ellipse, eyes, forked tongue) so they read as serpents.
 *
 * Purely a function of the layout: it does NOT subscribe to game state, so it
 * renders once and never re-reconciles during a move — keeping movement smooth.
 */
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { BOARD_OVERLAY } from '@/constants';
import { ladders, offboardSnakes, snakes } from '@/data';
import { buildLadder, buildSnakeBody, type Point } from '../svg';
import { getCellCenter } from '../layout';
import type { BoardLayout } from '../types';

interface SnakesLaddersLayerProps {
  layout: BoardLayout;
}

const SnakesLaddersLayerComponent: React.FC<SnakesLaddersLayerProps> = ({
  layout,
}) => {
  const cellSize = layout.dimensions.cellSize;
  const ladderStroke = Math.max(1.5, cellSize * BOARD_OVERLAY.ladderStrokeRatio);
  const headHalf = Math.max(2.5, cellSize * BOARD_OVERLAY.snakeHeadHalfRatio);
  const tailHalf = Math.max(0.6, cellSize * BOARD_OVERLAY.snakeTailHalfRatio);
  const railOffset = cellSize * BOARD_OVERLAY.railOffsetRatio;
  const rungSpacing = cellSize * BOARD_OVERLAY.rungSpacingRatio;

  const centers = useMemo(() => {
    const map = new Map<number, Point>();
    for (const cell of layout.positionedCells) {
      map.set(cell.id, getCellCenter(cell));
    }
    return map;
  }, [layout]);

  // Realm cells (महानरक etc.) keyed by their string key, for off-board snakes.
  const realmCenters = useMemo(() => {
    const map = new Map<string, Point>();
    for (const cell of layout.offboardCells) {
      map.set(cell.key, getCellCenter(cell));
    }
    return map;
  }, [layout]);

  const snakeShapes = useMemo(() => {
    // On-board snakes + off-board snakes (numeric head -> realm cell).
    const entries: { id: string; head: Point; tail: Point }[] = [];
    for (const s of snakes) {
      const head = centers.get(s.from);
      const tail = centers.get(s.to);
      if (head && tail) {
        entries.push({ id: s.id, head, tail });
      }
    }
    for (const s of offboardSnakes) {
      if (typeof s.from !== 'number') {
        continue; // realm->realm chains aren't drawn on the board
      }
      const head = centers.get(s.from);
      const tail = realmCenters.get(s.to);
      if (head && tail) {
        entries.push({ id: s.id, head, tail });
      }
    }
    return entries
      .map(({ id, head, tail }) => {
        const distance = Math.hypot(tail.x - head.x, tail.y - head.y);
        const waves = Math.max(
          2,
          Math.round((distance / cellSize) * BOARD_OVERLAY.snakeWavesPerCell),
        );
        // Unit direction head->tail, and its perpendicular, for eye placement.
        const ux = (tail.x - head.x) / (distance || 1);
        const uy = (tail.y - head.y) / (distance || 1);
        return {
          id,
          body: buildSnakeBody(
            head,
            tail,
            distance * BOARD_OVERLAY.snakeAmplitudeRatio,
            waves,
            headHalf,
            tailHalf,
          ),
          head,
          eye: {
            x: head.x + ux * headHalf * 0.5 + -uy * headHalf * 0.42,
            y: head.y + uy * headHalf * 0.5 + ux * headHalf * 0.42,
          },
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [centers, realmCenters, cellSize, headHalf, tailHalf]);

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
          geometry: buildLadder(
            base,
            top,
            railOffset,
            rungSpacing,
            BOARD_OVERLAY.maxRungs,
          ),
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [centers, railOffset, rungSpacing]);

  return (
    <Svg
      style={styles.overlay}
      width={layout.dimensions.boardWidth}
      height={layout.dimensions.boardHeight}
      pointerEvents="none">
      {ladderShapes.map(ladder => (
        <React.Fragment key={ladder.id}>
          {ladder.geometry.rails.map((rail, i) => (
            <Line
              key={`${ladder.id}-rail-${i}`}
              x1={rail.x1}
              y1={rail.y1}
              x2={rail.x2}
              y2={rail.y2}
              stroke={BOARD_OVERLAY.ladderRail}
              strokeWidth={ladderStroke}
              strokeLinecap="round"
              opacity={BOARD_OVERLAY.ladderOpacity}
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
              strokeWidth={ladderStroke * 0.7}
              strokeLinecap="round"
              opacity={BOARD_OVERLAY.ladderOpacity}
            />
          ))}
        </React.Fragment>
      ))}

      {snakeShapes.map(snake => (
        <React.Fragment key={snake.id}>
          {/* Tapered serpent body (wide head -> thin tail). */}
          <Path
            d={snake.body}
            fill={BOARD_OVERLAY.snakeColor}
            opacity={BOARD_OVERLAY.snakeOpacity}
          />
          {/* Rounded head + a single small eye (subtle, not cartoonish). */}
          <Circle
            cx={snake.head.x}
            cy={snake.head.y}
            r={headHalf}
            fill={BOARD_OVERLAY.snakeColor}
            opacity={BOARD_OVERLAY.snakeOpacity}
          />
          <Circle
            cx={snake.eye.x}
            cy={snake.eye.y}
            r={Math.max(0.8, headHalf * 0.28)}
            fill={BOARD_OVERLAY.snakeEye}
            opacity={BOARD_OVERLAY.snakeOpacity}
          />
        </React.Fragment>
      ))}
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
