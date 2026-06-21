/**
 * Per-cell snake / ladder connections (including off-board realms).
 *
 * Reads the raw authoritative maps so nothing is hidden — a square can be the
 * start of a snake/ladder (sliding to a number OR to an off-board realm such as
 * महानरक) and/or the end of one or more snakes/ladders. Used by the cell-detail
 * modal so the player can inspect any square.
 */
import { cellNamesEnglish } from './cellNamesEnglish';
import { ladderEndFrom, laddersRaw } from './ladders';
import { snakeTailFrom, snakesRaw } from './snakes';

/** A connection endpoint: a numbered square, or a named off-board realm. */
export type Endpoint = number | string;

export interface CellConnection {
  kind: 'snake' | 'ladder';
  /** 'start' = this cell is the head/base; 'end' = this cell is the tail/top. */
  role: 'start' | 'end';
  from: Endpoint;
  to: Endpoint;
}

/**
 * Human-readable gloss for the off-board realms the snakes/ladders lead to.
 * (The dataset itself tags some with "-लेफ्ट"/"-राइट" = left/right.)
 */
export const REALM_GLOSS: Record<string, string> = {
  महानरक: 'Great Hell (Mahānarak)',
  'महानरक-लेफ्ट': 'Great Hell — left',
  'महानरक-राइट': 'Great Hell — right',
  मरण: 'Death (Maraṇa)',
  'मृत्यू उर्फ कबर': 'Death / the Grave',
  'शून्य लोक': 'Void Realm (Śūnya Loka)',
  'बेहस्त लोक': 'Heaven Realm (Behesht)',
  'आत्मपरिभाण लोक': 'Realm of Self-Limitation',
};

/** Label an endpoint for display ("Square 200" or the realm name + gloss). */
export function endpointLabel(endpoint: Endpoint): string {
  if (typeof endpoint === 'number') {
    return `Square ${endpoint}`;
  }
  const gloss = REALM_GLOSS[endpoint];
  return gloss ? `${endpoint} — ${gloss}` : endpoint;
}

/** All snake/ladder connections touching a given square. */
export function getCellConnections(id: number): CellConnection[] {
  const out: CellConnection[] = [];

  const snakeStart = snakesRaw[id];
  if (snakeStart !== undefined) {
    out.push({ kind: 'snake', role: 'start', from: id, to: snakeStart });
  }
  const ladderStart = laddersRaw[id];
  if (ladderStart !== undefined) {
    out.push({ kind: 'ladder', role: 'start', from: id, to: ladderStart });
  }
  for (const head of snakeTailFrom[id] ?? []) {
    out.push({ kind: 'snake', role: 'end', from: head, to: id });
  }
  for (const base of ladderEndFrom[id] ?? []) {
    out.push({ kind: 'ladder', role: 'end', from: base, to: id });
  }
  return out;
}

/** English name of a square (for the detail header). */
export function cellEnglishName(id: number): string {
  return cellNamesEnglish[id] ?? `Square ${id}`;
}
