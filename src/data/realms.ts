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

/** The realms that represent literal death (the death node and the grave). */
const DEATH_REALMS = new Set<string>([REALM.maran, REALM.grave]);

/** Whether landing here counts as a "death" (Maraṇa / the grave). */
export function isDeathRealm(realm: string): boolean {
  return DEATH_REALMS.has(realm);
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

/** Resolve a position to its layout key: 0 -> JANMASTHAN, string realm as-is. */
export function positionKey(position: number | string): string | number {
  if (position === JANMASTHAN) {
    return JANMASTHAN_KEY;
  }
  return position;
}
