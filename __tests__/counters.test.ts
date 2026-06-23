/**
 * Per-player counter semantics for the game store: Narak visits + Lives,
 * plus turn handling (extra roll on a 6, rank assignment, turn advance).
 *
 *  - Narak: incremented on each ENTRY into a hell realm from the board.
 *    Moving realm→realm (महानरक → क्षुद्रनरक) must NOT recount.
 *  - Lives: incremented on each return to janmasthan.
 */
import { useGameStore } from '@/store';
import { REALM, JANMASTHAN } from '@/data';
import type { PlayerState } from '@/types';

/** Start a fresh game with `n` players (default names/colors). */
const start = (n = 1) =>
  useGameStore.getState().startGame(
    Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}`, colorId: i })),
  );

/** Patch the current player's fields (e.g. position) for a test setup. */
const patchCurrent = (patch: Partial<PlayerState>) =>
  useGameStore.setState(s => ({
    players: s.players.map((p, i) =>
      i === s.currentPlayerIndex ? { ...p, ...patch } : p,
    ),
  }));

const current = () => {
  const s = useGameStore.getState();
  return s.players[s.currentPlayerIndex];
};

describe('per-player Narak + Lives counters', () => {
  beforeEach(() => start(1));

  it('counts a narak visit when entering a hell realm from a square', () => {
    // Square 11 is a snake head leading to मरण (a hell realm).
    patchCurrent({ currentSquare: 10, realm: null });
    useGameStore.getState().applyMove(1); // 10 -> 11 -> मरण
    expect(current().realm).toBe(REALM.maran);
    expect(current().narakVisits).toBe(1);
    expect(current().lives).toBe(0);
  });

  it('does NOT recount when moving realm → realm without rebirth', () => {
    patchCurrent({ realm: REALM.mahanarak, narakVisits: 1 });
    useGameStore.getState().applyMove(3); // महानरक -> क्षुद्रनरक
    expect(current().realm).toBe(REALM.kshudranarak);
    expect(current().narakVisits).toBe(1); // unchanged
  });

  it('counts a life each time the soul returns to janmasthan', () => {
    patchCurrent({ realm: REALM.kshudranarak });
    useGameStore.getState().applyMove(2); // क्षुद्रनरक -> janmasthan
    expect(current().currentSquare).toBe(JANMASTHAN);
    expect(current().realm).toBeNull();
    expect(current().lives).toBe(1);
  });
});

describe('turns', () => {
  it('keeps the same player after rolling a 6 (extra roll)', () => {
    start(2);
    patchCurrent({ currentSquare: 5 });
    useGameStore.getState().applyMove(6);
    // Move done -> turn would advance, but a 6 means no advance.
    useGameStore.getState().setMoving(false);
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);
  });

  it('advances to the next player after a non-6 roll', () => {
    start(2);
    patchCurrent({ currentSquare: 5 });
    useGameStore.getState().applyMove(3);
    useGameStore.getState().setMoving(false);
    expect(useGameStore.getState().currentPlayerIndex).toBe(1);
  });

  it('assigns a rank and finishes a soul that reaches Moksha', () => {
    start(2);
    patchCurrent({ currentSquare: 284 });
    useGameStore.getState().applyMove(1); // 284 -> 285 (win)
    expect(useGameStore.getState().players[0].finished).toBe(true);
    expect(useGameStore.getState().players[0].rank).toBe(1);
    // Not everyone finished yet, so the game continues.
    expect(useGameStore.getState().gameStatus).toBe('playing');
    // Turn passes to player 2 (player 1 is finished and skipped).
    useGameStore.getState().setMoving(false);
    expect(useGameStore.getState().currentPlayerIndex).toBe(1);
  });
});
