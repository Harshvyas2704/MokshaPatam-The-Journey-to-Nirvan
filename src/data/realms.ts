/**
 * Off-board realms (naraka / loka) and the janmasthan start.
 *
 * Faithful to the reference game: a position can be a numbered square (1..285),
 * the janmasthan start (numeric 0), or an off-board REALM (a Devanagari string
 * such as महानरक). Snakes/ladders can lead off the board into these realms, and
 * each realm has its own escape rule when the soul rolls from it.
 *
 * These realm cells are laid out in a band BELOW square 1 (see boardLayout).
 */

/** The numeric janmasthan (birth / start) position. */
export const JANMASTHAN = 0;

/** Canonical realm strings (must match the dataset's Devanagari values). */
export const REALM = {
  mahanarak: 'महानरक',
  mahanarakLeft: 'महानरक-लेफ्ट',
  mahanarakRight: 'महानरक-राइट',
  kshudranarak: 'क्षुद्रनरक',
  maran: 'मरण',
  grave: 'मृत्यू उर्फ कबर',
  behesht: 'बेहस्त लोक',
  shunya: 'शून्य लोक',
  atmaparibhan: 'आत्मपरिभाण लोक',
} as const;

/** The sacred central medallion at the heart of the upper oval ring. */
export const HARIHAR_KSHETRA = {
  sanskrit: 'हरिहर क्षेत्र',
  english: 'Harihar Kshetra',
  mantra: 'ॐ नमः शिवाय · ॐ नमो विष्णवे',
} as const;

/** Short English label for each realm (for listings / legends). */
export const REALM_LABEL: Record<string, string> = {
  [REALM.mahanarak]: 'Mahanarak',
  [REALM.mahanarakLeft]: 'Mahanarak',
  [REALM.mahanarakRight]: 'Mahanarak',
  [REALM.kshudranarak]: 'Kshudranarak',
  [REALM.maran]: 'Mrityu',
  [REALM.grave]: 'Grave',
  [REALM.behesht]: 'Behasta Lok',
  [REALM.shunya]: 'Shunya Lok',
  [REALM.atmaparibhan]: 'Atmaparibhan Lok',
};

/** The three great-hell variants count as "mahanarak" for the escape rule. */
const MAHANARAK_SET = new Set<string>([
  REALM.mahanarak,
  REALM.mahanarakLeft,
  REALM.mahanarakRight,
]);

export function isMahanarak(realm: string): boolean {
  return MAHANARAK_SET.has(realm);
}

/** A realm reached off-board increments the naraka counter if it's a hell/grave. */
export function isNarak(realm: string): boolean {
  return MAHANARAK_SET.has(realm) || realm === REALM.grave;
}

/**
 * Rendered off-board cell. `key` is the realm string, or 'JANMASTHAN' for start.
 * `band` 0 sits just below square 1; band 1 sits below that. `col` is 0..7.
 */
export interface OffboardCellDef {
  key: string;
  sanskrit: string;
  english: string;
  kind: 'start' | 'narak';
  band: number;
  col: number;
}

/** Sentinel key for the janmasthan cell (numeric position 0). */
export const JANMASTHAN_KEY = 'JANMASTHAN';

/**
 * The off-board cells the soul can actually rest on. The transitional realms
 * (behesht / shunya / atmaparibhan) are NOT rendered — the soul never rests
 * there (they chain straight on to a hell/grave), so they need no cell.
 *
 * Band 0 (just below square 1) is the row the player asked for:
 *   महानरक · क्षुद्रनरक · महानरक · जन्मस्थान · महानरक
 */
export const OFFBOARD_CELLS: OffboardCellDef[] = [
  { key: REALM.mahanarakLeft, sanskrit: 'महानरक', english: 'Mahānarak (Great Hell)', kind: 'narak', band: 0, col: 0 },
  { key: REALM.kshudranarak, sanskrit: 'क्षुद्रनरक', english: 'Kshudra-narak (Lesser Hell)', kind: 'narak', band: 0, col: 2 },
  { key: REALM.mahanarak, sanskrit: 'महानरक', english: 'Mahānarak (Great Hell)', kind: 'narak', band: 0, col: 4 },
  { key: JANMASTHAN_KEY, sanskrit: 'जन्मस्थान', english: 'Janmasthan (Start)', kind: 'start', band: 0, col: 5 },
  { key: REALM.mahanarakRight, sanskrit: 'महानरक', english: 'Mahānarak (Great Hell)', kind: 'narak', band: 0, col: 7 },
  { key: REALM.maran, sanskrit: 'मरण', english: 'Maraṇa (Death)', kind: 'narak', band: 1, col: 2 },
  { key: REALM.grave, sanskrit: 'मृत्यू उर्फ कबर', english: 'Death / the Grave', kind: 'narak', band: 1, col: 5 },
];

/** How many off-board bands hang below the board. */
export const OFFBOARD_BANDS = 2;

/**
 * Side "loka" realm cells, rendered in the left/right gutters beside the grid.
 * A ladder climbs from `sourceCell` into the loka, which then chains onward to a
 * hell/grave (see the realm chains in snakes.ts). `void: true` marks शून्य लोक,
 * the deceptive Void that reads differently from the celestial lokas.
 */
export interface SideLokaDef {
  key: string;
  sanskrit: string;
  english: string;
  side: 'left' | 'right';
  /** Numeric square whose ladder leads here. */
  sourceCell: number;
  /**
   * Numeric square whose ROW the cell is aligned to (vertical placement only).
   * Sits a few rows above `sourceCell` so the connector rises like a ladder.
   * Falls back to `sourceCell` when omitted.
   */
  anchorCell?: number;
  void?: boolean;
}

export const SIDE_LOKAS: SideLokaDef[] = [
  { key: REALM.atmaparibhan, sanskrit: 'आत्मपरिभाण लोक', english: 'Self-realization', side: 'left', sourceCell: 55, anchorCell: 85 },
  { key: REALM.shunya, sanskrit: 'शून्य लोक', english: 'Void World', side: 'left', sourceCell: 33, anchorCell: 84, void: true },
  { key: REALM.behesht, sanskrit: 'बेहस्त लोक', english: 'Paradise', side: 'right', sourceCell: 38, anchorCell: 84 },
];

/** Resolve a position to its layout key: 0 -> JANMASTHAN, string realm as-is. */
export function positionKey(position: number | string): string | number {
  if (position === JANMASTHAN) {
    return JANMASTHAN_KEY;
  }
  return position;
}
