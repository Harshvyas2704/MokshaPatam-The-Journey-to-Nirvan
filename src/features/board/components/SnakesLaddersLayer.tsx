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
import { ladders, offboardLadders, snakeClusters } from '@/data';
import { lerp, mixHex } from '@/utils';
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
  const trunkHalf = headHalf * BOARD_OVERLAY.snakeTrunkScale;
  const neckHalf = headHalf * BOARD_OVERLAY.snakeNeckScale;
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
    // Resolve a head/destination key (numeric square or realm string) to a point.
    const resolve = (key: number | string): Point | undefined =>
      typeof key === 'number' ? centers.get(key) : realmCenters.get(key);

    // One tapered body segment (wide head -> thinner tail) with length-based sway.
    const segment = (
      from: Point,
      to: Point,
      fromHalf: number,
      toHalf: number,
    ): string => {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const waves = Math.max(
        2,
        Math.round((distance / cellSize) * BOARD_OVERLAY.snakeWavesPerCell),
      );
      return buildSnakeBody(
        from,
        to,
        distance * BOARD_OVERLAY.snakeAmplitudeRatio,
        waves,
        fromHalf,
        toHalf,
      );
    };

    // A small eye dot on the head, nudged toward where the body leaves the head.
    const eyeOf = (head: Point, toward: Point) => {
      const d = Math.hypot(toward.x - head.x, toward.y - head.y) || 1;
      const ux = (toward.x - head.x) / d;
      const uy = (toward.y - head.y) / d;
      return {
        x: head.x + ux * headHalf * 0.5 - uy * headHalf * 0.42,
        y: head.y + uy * headHalf * 0.5 + ux * headHalf * 0.42,
      };
    };

    // Shade green snakes by drop distance (short = light, long = dark); hell
    // snakes are red (deepest). Off-board destinations take the darkest shade.
    const greenDrops = snakeClusters
      .filter(c => !c.isHell && c.maxDrop !== null)
      .map(c => c.maxDrop as number);
    const minDrop = greenDrops.length ? Math.min(...greenDrops) : 0;
    const maxDrop = greenDrops.length ? Math.max(...greenDrops) : 1;
    const colorOf = (isHell: boolean, drop: number | null): string => {
      if (isHell) {
        return BOARD_OVERLAY.snakeHellDarkColor; // every great hell = deep red
      }
      const t = drop === null ? 1 : (drop - minDrop) / (maxDrop - minDrop || 1);
      const shade = lerp(BOARD_OVERLAY.pathShadeFloor, 1, t);
      return mixHex(
        BOARD_OVERLAY.snakeLightColor,
        BOARD_OVERLAY.snakeDarkColor,
        shade,
      );
    };

    type HeadGlyph = { x: number; y: number; eyeX: number; eyeY: number };
    const built: {
      id: string;
      color: string;
      paths: string[];
      heads: HeadGlyph[];
    }[] = [];

    for (const cluster of snakeClusters) {
      const root = resolve(cluster.to);
      if (!root) {
        continue;
      }
      const headPts: Point[] = [];
      for (const h of cluster.heads) {
        const p = resolve(h);
        if (p) {
          headPts.push(p);
        }
      }
      if (headPts.length === 0) {
        continue;
      }

      const color = colorOf(cluster.isHell, cluster.maxDrop);
      const paths: string[] = [];
      const heads: HeadGlyph[] = [];

      if (headPts.length === 1) {
        // Lone snake: a single serpent from its head down to the destination.
        const h = headPts[0];
        paths.push(segment(h, root, headHalf, tailHalf));
        const eye = eyeOf(h, root);
        heads.push({ x: h.x, y: h.y, eyeX: eye.x, eyeY: eye.y });
      } else {
        // Multi-headed serpent: a thick trunk rises from the destination to a
        // junction, then thin necks branch out to each head. The junction is
        // pulled toward the destination (not the bare centroid) so every neck
        // points INTO the destination — fixing heads that sit on the far side.
        const cx = headPts.reduce((s, p) => s + p.x, 0) / headPts.length;
        const cy = headPts.reduce((s, p) => s + p.y, 0) / headPts.length;
        const bias = BOARD_OVERLAY.snakeJunctionBias;
        const junction: Point = {
          x: root.x + (cx - root.x) * bias,
          y: root.y + (cy - root.y) * bias,
        };
        paths.push(segment(junction, root, trunkHalf, tailHalf));
        for (const h of headPts) {
          paths.push(segment(h, junction, headHalf, neckHalf));
          const eye = eyeOf(h, junction);
          heads.push({ x: h.x, y: h.y, eyeX: eye.x, eyeY: eye.y });
        }
      }

      built.push({ id: cluster.id, color, paths, heads });
    }
    return built;
  }, [centers, realmCenters, cellSize, headHalf, tailHalf, trunkHalf, neckHalf]);

  const ladderShapes = useMemo(() => {
    const built: {
      id: string;
      mag: number | null;
      base: Point;
      top: Point;
    }[] = [];
    for (const ladder of ladders) {
      const base = centers.get(ladder.from);
      const top = centers.get(ladder.to);
      if (base && top) {
        built.push({ id: ladder.id, mag: ladder.to - ladder.from, base, top });
      }
    }
    // Off-board ladders climb from a numeric square into a side loka cell.
    for (const l of offboardLadders) {
      const base = centers.get(l.from);
      const top = realmCenters.get(l.to);
      if (base && top) {
        built.push({ id: l.id, mag: null, base, top });
      }
    }

    // Shade each ladder RED by climb distance (short = light, long = dark;
    // off-board "loka" ladders take the darkest shade).
    const numericMags = built
      .map(l => l.mag)
      .filter((m): m is number => m !== null);
    const minMag = numericMags.length ? Math.min(...numericMags) : 0;
    const maxMag = numericMags.length ? Math.max(...numericMags) : 1;

    return built.map(({ id, mag, base, top }) => {
      const t = mag === null ? 1 : (mag - minMag) / (maxMag - minMag || 1);
      const shade = lerp(BOARD_OVERLAY.pathShadeFloor, 1, t);
      return {
        id,
        color: mixHex(
          BOARD_OVERLAY.ladderLightColor,
          BOARD_OVERLAY.ladderDarkColor,
          shade,
        ),
        geometry: buildLadder(
          base,
          top,
          railOffset,
          rungSpacing,
          BOARD_OVERLAY.maxRungs,
        ),
      };
    });
  }, [centers, realmCenters, railOffset, rungSpacing]);

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
              stroke={ladder.color}
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
              stroke={ladder.color}
              strokeWidth={ladderStroke * 0.7}
              strokeLinecap="round"
              opacity={BOARD_OVERLAY.ladderOpacity}
            />
          ))}
        </React.Fragment>
      ))}

      {snakeShapes.map(snake => (
        <React.Fragment key={snake.id}>
          {/* Shared trunk + branch necks (wide head -> thin tail), all one body. */}
          {snake.paths.map((d, i) => (
            <Path
              key={`${snake.id}-body-${i}`}
              d={d}
              fill={snake.color}
              opacity={BOARD_OVERLAY.snakeOpacity}
            />
          ))}
          {/* A rounded head + a single small eye at each source square. */}
          {snake.heads.map((hd, i) => (
            <React.Fragment key={`${snake.id}-head-${i}`}>
              <Circle
                cx={hd.x}
                cy={hd.y}
                r={headHalf}
                fill={snake.color}
                opacity={BOARD_OVERLAY.snakeOpacity}
              />
              <Circle
                cx={hd.eyeX}
                cy={hd.eyeY}
                r={Math.max(0.8, headHalf * 0.28)}
                fill={BOARD_OVERLAY.snakeEye}
                opacity={BOARD_OVERLAY.snakeOpacity}
              />
            </React.Fragment>
          ))}
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
