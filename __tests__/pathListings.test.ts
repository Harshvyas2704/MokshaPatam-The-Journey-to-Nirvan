/**
 * Ladder / snake listings shown on the Instructions screen.
 */
import { ladderListings, snakeListings } from '@/data';

const isSortedByFrom = (rows: { from: number }[]) =>
  rows.every((r, i) => i === 0 || rows[i - 1].from <= r.from);

describe('path listings', () => {
  it('are non-empty and sorted by starting square', () => {
    expect(ladderListings.length).toBeGreaterThan(0);
    expect(snakeListings.length).toBeGreaterThan(0);
    expect(isSortedByFrom(ladderListings)).toBe(true);
    expect(isSortedByFrom(snakeListings)).toBe(true);
  });

  it('formats numeric destinations as the square number', () => {
    // Ladder 9 → 49 (the example from the request).
    const l9 = ladderListings.find(l => l.from === 9);
    expect(l9?.to).toBe('49');
  });

  it('formats off-board destinations with a short realm label', () => {
    // Ladder 33 climbs to शून्य लोक; snake 11 falls to मरण.
    expect(ladderListings.find(l => l.from === 33)?.to).toBe('Shunya Lok');
    expect(snakeListings.find(s => s.from === 11)?.to).toBe('Mrityu');
  });
});
