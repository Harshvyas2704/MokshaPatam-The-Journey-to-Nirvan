/**
 * Feature: board
 *
 * Owns the data-driven board renderer + layout engine (Phase 2) and the
 * pinch-zoom / pan viewport with boundaries (Phase 3).
 */
export * from './types';
export * from './layout';
export * from './zoom';
export * from './components';
export { useBoardLayout } from './hooks/useBoardLayout';
