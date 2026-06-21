/**
 * Integration checks for the authentic Mokshapat dataset.
 *
 * Guards the derivation from the raw source maps: every square is present and
 * well-formed, the playable snakes/ladders are numeric and in range, and no
 * source entry is dropped (playable + off-board === raw total).
 */
import {
  boardCells,
  COLUMN_COUNT,
  ladders,
  laddersRaw,
  offboardLadders,
  offboardSnakes,
  snakes,
  snakesRaw,
} from '@/data';
import { ladderMap, snakeMap } from '@/features/game/logic';

describe('boardCells', () => {
  it('has all 285 cells with unique ids 1..285', () => {
    expect(boardCells).toHaveLength(285);
    const ids = boardCells.map(c => c.id).sort((a, b) => a - b);
    expect(ids[0]).toBe(1);
    expect(ids[284]).toBe(285);
    expect(new Set(ids).size).toBe(285);
  });

  it('carries English title + Sanskrit for every cell', () => {
    for (const cell of boardCells) {
      expect(typeof cell.title).toBe('string');
      expect(cell.title.length).toBeGreaterThan(0);
      expect(typeof cell.sanskrit).toBe('string');
      expect(cell.sanskrit!.length).toBeGreaterThan(0);
    }
  });

  it('positions every cell within the serpentine grid', () => {
    for (const cell of boardCells) {
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(COLUMN_COUNT);
      expect(cell.row).toBeGreaterThanOrEqual(0);
    }
  });

  it('marks square 285 as moksha', () => {
    expect(boardCells.find(c => c.id === 285)!.type).toBe('moksha');
  });
});

describe('snakes', () => {
  it('are numeric head -> numeric tail, all in 1..285', () => {
    expect(snakes.length).toBeGreaterThan(0);
    for (const s of snakes) {
      expect(Number.isInteger(s.from)).toBe(true);
      expect(Number.isInteger(s.to)).toBe(true);
      expect(s.from).toBeGreaterThanOrEqual(1);
      expect(s.from).toBeLessThanOrEqual(285);
      expect(s.to).toBeGreaterThanOrEqual(1);
      expect(s.to).toBeLessThanOrEqual(285);
    }
  });

  it('loses no source data (playable + off-board === raw total)', () => {
    expect(snakes.length + offboardSnakes.length).toBe(
      Object.keys(snakesRaw).length,
    );
  });

  it('feeds the snake jump map', () => {
    for (const s of snakes) {
      expect(snakeMap[s.from]).toBe(s.to);
    }
  });
});

describe('ladders', () => {
  it('are numeric base -> numeric top, climbing upward, in 1..285', () => {
    expect(ladders.length).toBeGreaterThan(0);
    for (const l of ladders) {
      expect(Number.isInteger(l.from)).toBe(true);
      expect(Number.isInteger(l.to)).toBe(true);
      expect(l.to).toBeGreaterThan(l.from);
      expect(l.to).toBeLessThanOrEqual(285);
    }
  });

  it('loses no source data (playable + off-board === raw total)', () => {
    expect(ladders.length + offboardLadders.length).toBe(
      Object.keys(laddersRaw).length,
    );
  });

  it('feeds the ladder jump map', () => {
    for (const l of ladders) {
      expect(ladderMap[l.from]).toBe(l.to);
    }
  });
});
