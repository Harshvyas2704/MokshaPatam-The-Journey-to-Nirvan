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
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { BOARD_OVERLAY } from '@/constants';
import { ladders, offboardLadders, snakeClusters } from '@/data';
import { lerp, mixHex } from '@/utils';
import {
  buildLadder,
  buildSnakeBody,
  buildSnakeHead,
  snakeHeadEyes,
  type Point,
} from '../svg';
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
  const headSize = headHalf * BOARD_OVERLAY.snakeHeadScale;
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

    // The gradient axis ACROSS a body segment (perpendicular to its direction),
    // centered on the segment, so the fill runs dark edge -> light core -> dark
    // edge and the ribbon reads as a rounded tube.
    const axisOf = (from: Point, to: Point, fromHalf: number, toHalf: number) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len; // unit perpendicular
      const py = dx / len;
      const w = Math.max(fromHalf, toHalf) * 1.15;
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      return { x1: mx + px * w, y1: my + py * w, x2: mx - px * w, y2: my - py * w };
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

    type Body = { d: string; gradId: string; x1: number; y1: number; x2: number; y2: number };
    type HeadGlyph = { d: string; eyes: [Point, Point] };
    const built: {
      id: string;
      headGradId: string;
      light: string;
      dark: string;
      bodies: Body[];
      heads: HeadGlyph[];
      /** Where a multi-headed serpent forks — a small bulge that fills the fork
       *  smoothly so the necks read as one body splitting, not piled snakes. */
      hub: { x: number; y: number; r: number } | null;
    }[] = [];

    snakeClusters.forEach((cluster, ci) => {
      const root = resolve(cluster.to);
      if (!root) {
        return;
      }
      const headPts: Point[] = [];
      for (const h of cluster.heads) {
        const p = resolve(h);
        if (p) {
          headPts.push(p);
        }
      }
      if (headPts.length === 0) {
        return;
      }

      // Tube tints derived from the snake's own semantic color (meaning kept).
      const base = colorOf(cluster.isHell, cluster.maxDrop);
      const light = mixHex(
        base,
        BOARD_OVERLAY.snakeTubeLightTint,
        BOARD_OVERLAY.snakeTubeLightMix,
      );
      const dark = mixHex(
        base,
        BOARD_OVERLAY.snakeTubeDarkTint,
        BOARD_OVERLAY.snakeTubeDarkMix,
      );

      const bodies: Body[] = [];
      const heads: HeadGlyph[] = [];
      const addBody = (from: Point, to: Point, fromHalf: number, toHalf: number) => {
        bodies.push({
          d: segment(from, to, fromHalf, toHalf),
          gradId: `sg${ci}b${bodies.length}`,
          ...axisOf(from, to, fromHalf, toHalf),
        });
      };

      let hub: { x: number; y: number; r: number } | null = null;
      if (headPts.length === 1) {
        // Lone snake: a single serpent from its head down to the destination.
        const h = headPts[0];
        addBody(h, root, headHalf, tailHalf);
        heads.push({
          d: buildSnakeHead(h, root, headSize),
          eyes: snakeHeadEyes(h, root, headSize),
        });
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
        addBody(junction, root, trunkHalf, tailHalf);
        for (const h of headPts) {
          addBody(h, junction, headHalf, neckHalf);
          heads.push({
            d: buildSnakeHead(h, junction, headSize),
            eyes: snakeHeadEyes(h, junction, headSize),
          });
        }
        hub = { x: junction.x, y: junction.y, r: trunkHalf * 1.25 };
      }

      built.push({ id: cluster.id, headGradId: `sg${ci}h`, light, dark, bodies, heads, hub });
    });
    return built;
  }, [
    centers,
    realmCenters,
    cellSize,
    headHalf,
    tailHalf,
    trunkHalf,
    neckHalf,
    headSize,
  ]);

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

      {/* Gradient defs: a cross-body tube gradient per segment + a sphere
          gradient per serpent's heads (reused across all its heads). */}
      <Defs>
        {snakeShapes.map(snake => (
          <React.Fragment key={`${snake.id}-defs`}>
            {snake.bodies.map(body => (
              <LinearGradient
                key={body.gradId}
                id={body.gradId}
                gradientUnits="userSpaceOnUse"
                x1={body.x1}
                y1={body.y1}
                x2={body.x2}
                y2={body.y2}>
                <Stop offset="0" stopColor={snake.dark} />
                <Stop offset="0.5" stopColor={snake.light} />
                <Stop offset="1" stopColor={snake.dark} />
              </LinearGradient>
            ))}
            <RadialGradient
              id={snake.headGradId}
              cx="0.35"
              cy="0.32"
              r="0.75">
              <Stop offset="0" stopColor={snake.light} />
              <Stop offset="1" stopColor={snake.dark} />
            </RadialGradient>
          </React.Fragment>
        ))}
      </Defs>

      {/* Soft drop shadow cast under every body + head for depth. */}
      <G
        transform={`translate(${BOARD_OVERLAY.snakeShadowDx} ${BOARD_OVERLAY.snakeShadowDy})`}
        opacity={BOARD_OVERLAY.snakeShadowOpacity}>
        {snakeShapes.map(snake => (
          <React.Fragment key={`${snake.id}-shadow`}>
            {snake.hub ? (
              <Circle
                cx={snake.hub.x}
                cy={snake.hub.y}
                r={snake.hub.r}
                fill={BOARD_OVERLAY.snakeShadowColor}
              />
            ) : null}
            {snake.bodies.map(body => (
              <Path
                key={`${body.gradId}-shadow`}
                d={body.d}
                fill={BOARD_OVERLAY.snakeShadowColor}
              />
            ))}
            {snake.heads.map((hd, i) => (
              <Path
                key={`${snake.id}-headshadow-${i}`}
                d={hd.d}
                fill={BOARD_OVERLAY.snakeShadowColor}
              />
            ))}
          </React.Fragment>
        ))}
      </G>

      {/* Each serpent is drawn inside ONE opacity group so its overlapping
          necks/trunk/hub composite a single time — no dark double-opacity seams
          where the body forks; it reads as one snake splitting into parts. */}
      {snakeShapes.map(snake => (
        <G key={snake.id} opacity={BOARD_OVERLAY.snakeBodyOpacity}>
          {/* Fork bulge first (under the necks) to fill the split smoothly. */}
          {snake.hub ? (
            <Circle
              cx={snake.hub.x}
              cy={snake.hub.y}
              r={snake.hub.r}
              fill={`url(#${snake.headGradId})`}
            />
          ) : null}
          {/* Shared trunk + branch necks, each filled as a rounded tube. */}
          {snake.bodies.map(body => (
            <Path key={body.gradId} d={body.d} fill={`url(#${body.gradId})`} />
          ))}
          {/* A tapered, shaded serpent head + two eyes at each source square. */}
          {snake.heads.map((hd, i) => (
            <React.Fragment key={`${snake.id}-head-${i}`}>
              <Path d={hd.d} fill={`url(#${snake.headGradId})`} />
              {hd.eyes.map((eye, e) => (
                <Circle
                  key={`${snake.id}-eye-${i}-${e}`}
                  cx={eye.x}
                  cy={eye.y}
                  r={Math.max(0.7, headSize * 0.16)}
                  fill={BOARD_OVERLAY.snakeEye}
                />
              ))}
            </React.Fragment>
          ))}
        </G>
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
