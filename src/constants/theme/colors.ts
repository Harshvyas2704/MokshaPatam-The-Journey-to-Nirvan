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

  // Soul token (Phase 4)
  soul: '#FFE9B0',
  soulAura: '#FFD27A',

  // Utility
  border: '#4A3225',
  overlay: 'rgba(12, 6, 4, 0.72)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
