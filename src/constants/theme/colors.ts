/**
 * Color palette — Traditional Indian Spiritual Heritage.
 *
 * Direction: saffron, deep maroon, muted gold, copper, ivory.
 * Deliberately avoids neon / bright gaming / casino aesthetics.
 *
 * These are placeholder-but-intentional values for Phase 1. Exact tones can be
 * refined during the polish phase; the keys form the stable contract.
 */
export const colors = {
  // Core heritage palette
  saffron: '#E58A2B',
  maroon: '#5C1A1B',
  gold: '#C9A227',
  copper: '#B06A3B',
  ivory: '#F4ECD8',

  // Surfaces / backgrounds
  background: '#1C0F0A', // deep, warm near-black for a sacred, calm canvas
  surface: '#2A1813',
  surfaceMuted: '#3A241C',

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
  border: '#4A3225',
  overlay: 'rgba(12, 6, 4, 0.72)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
