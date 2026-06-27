import type { Snake } from '@/types';

/**
 * Raw authoritative snake map (head -> destination), copied from the source
 * dataset verbatim. Numeric heads slide to numeric tails; some heads lead to
 * off-board realms (महानरक and other hells), and a few off-board realms chain
 * onward. Nothing from the source is removed.
 *
 * `snakes` below is the typed, numeric-only view consumed by the board + game;
 * `offboardSnakes` preserves the realm-bound entries for later realm support.
 */
export const snakesRaw: Record<string, number | string> = {
  263:"महानरक", 259:103, 256:"महानरक", 254:256,
  251:1,   249:178, 248:154, 244:"महानरक",
  242:183, 240:"महानरक-लेफ्ट", 235:151, 234:151,
  229:1,   216:1,   214:67,  209:1,
  206:"महानरक", 203:1, 194:"महानरक-लेफ्ट", 187:"महानरक-राइट",
  182:"महानरक", 180:"महानरक", 171:"महानरक-लेफ्ट", 164:67,
  155:2,   147:77,  146:56,  144:26,
  141:"महानरक", 139:85, 137:"महानरक-राइट", 135:50,
  129:106, 125:"महानरक-लेफ्ट", 119:"महानरक", 117:"महानरक",
  115:"महानरक-राइट", 111:"महानरक-राइट", 108:"महानरक", 106:72,
  103:"महानरक-लेफ्ट", 96:"महानरक", 91:65, 88:"महानरक-राइट",
  84:"महानरक", 80:12,  77:26,  72:60,
  70:4,    64:"महानरक-राइट", 60:37,  58:"महानरक",
  52:11,   48:"महानरक", 46:1,   44:14,
  42:19,   40:"महानरक-राइट", 37:23,  31:26,
  26:"महानरक-लेफ्ट", 23:11,  21:12,  17:15,
  11:"मरण",
  "आत्मपरिभाण लोक":"महानरक-लेफ्ट",
  "शून्य लोक":"महानरक-लेफ्ट",
  "बेहस्त लोक":"मृत्यू उर्फ कबर",
};

export const snakeHeads = new Set(
  Object.keys(snakesRaw)
    .map(Number)
    .filter(n => !isNaN(n)),
);

export const snakeTails = new Set<number>();
(Object.values(snakesRaw) as (number | string)[]).forEach(v => {
  if (typeof v === 'number') snakeTails.add(v);
});

export const snakeTailFrom: Record<number, number[]> = {};
Object.entries(snakesRaw).forEach(([h, t]) => {
  if (typeof t === 'number') {
    if (!snakeTailFrom[t]) snakeTailFrom[t] = [];
    snakeTailFrom[t]!.push(Number(h));
  }
});

// Snakes with string (off-board) destinations / origins (realms, hells).
export const snakeToHell: Record<number | string, string> = {};
Object.entries(snakesRaw).forEach(([k, v]) => {
  if (typeof v === 'string') {
    const kn = Number(k);
    snakeToHell[isNaN(kn) ? k : kn] = v;
  }
});

/**
 * Playable snakes: numeric head -> numeric tail. Consumed by the board renderer
 * and the movement/jump logic.
 */
export const snakes: Snake[] = Object.entries(snakesRaw)
  .map(([fromKey, to]): Snake | null => {
    const from = Number(fromKey);
    if (Number.isNaN(from) || typeof to !== 'number') {
      return null;
    }
    return { id: `snake-${from}`, from, to };
  })
  .filter((s): s is Snake => s !== null);

/**
 * Off-board snakes — head and/or destination is a realm string (महानरक, etc.).
 * Preserved so no source data is lost; not yet rendered or played (a later
 * realms feature will consume these).
 */
export const offboardSnakes: { id: string; from: number | string; to: string }[] =
  Object.entries(snakesRaw)
    .filter(([fromKey, to]) => Number.isNaN(Number(fromKey)) || typeof to === 'string')
    .map(([from, to]) => ({
      id: `snake-off-${from}`,
      from: Number.isNaN(Number(from)) ? from : Number(from),
      to: String(to),
    }));

/**
 * The mahanarak hells. Snakes that fall into one of these are drawn RED
 * (the gravest descent); every other snake is green.
 */
const HELL_REALMS = new Set<string>([
  'महानरक',
  'महानरक-लेफ्ट',
  'महानरक-राइट',
]);

/**
 * A multi-headed serpent: every snake that shares a single destination, drawn
 * as ONE creature — a shared body rooted at the destination with a head at each
 * source square — rather than one full serpent per source (which overlapped
 * into a tangle). Derived purely from `snakesRaw`; the actual head→destination
 * data is unchanged (and still drives gameplay via `snakeToHell`).
 */
export interface SnakeCluster {
  id: string;
  /** Destination of every head: a numeric square or an off-board realm. */
  to: number | string;
  /** Source heads (numeric squares and/or realm origins) feeding this body. */
  heads: (number | string)[];
  /** Destination is a mahanarak hell (drawn red, not green). */
  isHell: boolean;
  /** Largest numeric drop among the heads (shading); null when off-board. */
  maxDrop: number | null;
}

export const snakeClusters: SnakeCluster[] = (() => {
  // Group every raw entry by its destination.
  const byDest = new Map<number | string, (number | string)[]>();
  for (const [headKey, dest] of Object.entries(snakesRaw)) {
    const headNum = Number(headKey);
    const head: number | string = Number.isNaN(headNum) ? headKey : headNum;
    const list = byDest.get(dest) ?? [];
    list.push(head);
    byDest.set(dest, list);
  }
  const clusters: SnakeCluster[] = [];
  byDest.forEach((heads, dest) => {
    const numericDrops =
      typeof dest === 'number'
        ? heads
            .filter((h): h is number => typeof h === 'number')
            .map(h => h - dest)
        : [];
    clusters.push({
      id: `snake-cluster-${dest}`,
      to: dest,
      heads,
      isHell: typeof dest === 'string' && HELL_REALMS.has(dest),
      maxDrop: numericDrops.length ? Math.max(...numericDrops) : null,
    });
  });
  return clusters;
})();

export const SNAKE_WAYPOINTS: Record<number, [number, number]> = {
  263: [215, 216],
  244: [179, 180],
  180: [155, 156],
  108: [107, 108],
  84:  [23, 24],
};
