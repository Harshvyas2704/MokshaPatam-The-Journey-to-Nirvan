/**
 * Feature: player
 *
 * Owns the soul token (glowing orb, soft aura, subtle pulse) and its animated
 * movement across the board (Phase 4 visuals + Phase 6 movement).
 */
export { SoulToken } from './components/SoulToken';
export { default as SoulTokenLayer } from './components/SoulTokenLayer';
export { useSoulMovement } from './hooks/useSoulMovement';
export * from './positioning';
