/**
 * Feature: game
 *
 * Owns dice, move calculation (exact-landing / bounce-back), snake/ladder
 * resolution, auto-play, and the play controls (Phase 5). The animated
 * square-by-square movement arrives in Phase 6.
 *
 * NOTE: the store imports the pure logic directly from `./logic` to avoid a
 * cycle (this barrel also exports hooks/components that depend on the store).
 */
export * from './logic';
export { useAutoPlay } from './hooks/useAutoPlay';
export * from './components';
