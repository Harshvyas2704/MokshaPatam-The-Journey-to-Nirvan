/**
 * Color palette — Traditional Indian Spiritual Heritage.
 *
 * Theme: "Indigo Temple Night" — a deep blue-violet night canvas with warm
 * saffron/gold accents. The cool dark gives the painted serpents, the green/red
 * cells, and the blue soul flame maximum contrast. The नरक (hell) zone keeps its
 * own warm red surface (see OffboardCellView) — only the canvas turns cool.
 *
 * Deliberately avoids neon / bright gaming / casino aesthetics.
 */
export const colors = {
  // Core heritage accents (warm, glow against the night canvas)
  saffron: '#E58A2B',
  maroon: '#C2622E', // primary action / CTA — burnt saffron on the indigo canvas
  gold: '#D4AE33',
  copper: '#B06A3B',
  ivory: '#F4ECD8',

  // Surfaces / backgrounds — deep indigo "temple night"
  background: '#0E1326', // deep indigo night for a sacred, calm canvas
  surface: '#18223F',
  surfaceMuted: '#232E52',

  // Text
  textPrimary: '#F4ECD8', // ivory
  textSecondary: '#D8C5A0',
  textMuted: '#9C8460',

  // Semantic (spiritual events)
  snake: '#7A2E2E', // descent / obstacle
  ladder: '#3E6B4F', // ascent / virtue
  moksha: '#E6C25A', // liberation glow

  // Board cells — light "manuscript" tiles (default white; tinted by role).
  cellBg: '#F7F2E8', // default near-white tile
  cellBorder: '#D8C9AD',
  cellLadderBg: '#DCEAD3', // ladder destination — light green
  cellLadderBgFrom: '#EAF4E1', // gradient top-left (lighter green)
  cellLadderBgTo: '#C2DAB1', // gradient bottom-right (deeper green)
  cellLadderBorder: '#7FA86A',
  cellSnakeBg: '#F5D9D4', // snake head / start — light red
  cellSnakeBgFrom: '#FCE8E4', // gradient top-left (lighter red)
  cellSnakeBgTo: '#EDBEB5', // gradient bottom-right (deeper red)
  cellSnakeBorder: '#CC7A6E',
  cellText: '#3E2A1C', // dark ink for light tiles
  cellTextMuted: '#7A6048',

  // Central sacred medallion (Harihar Kshetra) — calm temple blue.
  medallionBg: '#E6F0F7',
  medallionBorder: '#6E9FC9',
  medallionText: '#2F5E8C',
  medallionMuted: '#5E83A8',

  // Soul token — a small blue flame (hot white-blue core, blue aura).
  soul: '#E6F2FF',
  soulAura: '#4FA3FF',

  // Utility
  border: '#2E3A63', // indigo-tinted hairline
  overlay: 'rgba(6, 9, 22, 0.74)', // cool modal backdrop
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
