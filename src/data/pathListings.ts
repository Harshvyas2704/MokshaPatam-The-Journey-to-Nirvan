/**
 * Display listings of every ladder and snake (for the Instructions screen).
 *
 * Derived from the authoritative raw maps so nothing is missed — including the
 * off-board entries whose destination is a realm (rendered with a short English
 * label). Each listing is `from → to`, sorted by the starting square. These are
 * static, so they are computed once at module load.
 */
import { laddersRaw } from './ladders';
import { snakesRaw } from './snakes';
import { cellNamesEnglish } from './cellNamesEnglish';
import { REALM_LABEL } from './realms';

/**
 * One "from → to" listing row. `to` is a square number or a realm label;
 * `fromTitle`/`toTitle` are the human-readable square (or realm) names.
 */
export interface PathListing {
  id: string;
  from: number;
  to: string;
  fromTitle: string;
  toTitle: string;
}

/** Format a raw destination (number or realm string) to a display string. */
function formatTo(to: number | string): string {
  if (typeof to === 'number') {
    return String(to);
  }
  return REALM_LABEL[to] ?? to;
}

/** Human-readable name for a square number or realm string. */
function titleFor(value: number | string): string {
  if (typeof value === 'number') {
    return cellNamesEnglish[value] ?? `Square ${value}`;
  }
  return REALM_LABEL[value] ?? value;
}

/** Build sorted listings from a raw map, skipping non-numeric (realm) origins. */
function buildListings(
  raw: Record<string, number | string>,
  prefix: string,
): PathListing[] {
  return Object.entries(raw)
    .map(([from, to]) => ({ from: Number(from), to }))
    .filter(entry => !Number.isNaN(entry.from))
    .sort((a, b) => a.from - b.from)
    .map(({ from, to }) => ({
      id: `${prefix}-${from}`,
      from,
      to: formatTo(to),
      fromTitle: titleFor(from),
      toTitle: titleFor(to),
    }));
}

/** Every ladder as a `from → to` listing, ordered by starting square. */
export const ladderListings: PathListing[] = buildListings(
  laddersRaw,
  'ladder-list',
);

/** Every snake as a `head → tail` listing, ordered by the head square. */
export const snakeListings: PathListing[] = buildListings(
  snakesRaw,
  'snake-list',
);
