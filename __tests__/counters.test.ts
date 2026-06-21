/**
 * Counter semantics for the game store: Narak visits + Lives.
 *
 *  - Narak: incremented on each ENTRY into a hell realm from the board.
 *    Moving realm→realm (महानरक → क्षुद्रनरक) must NOT recount.
 *  - Lives: incremented on each return to janmasthan.
 */
import { useGameStore, initialGameState } from '@/store';
import { REALM, JANMASTHAN } from '@/data';

const reset = () => useGameStore.setState({ ...initialGameState });
const set = (patch: Partial<ReturnType<typeof useGameStore.getState>>) =>
  useGameStore.setState(patch);

describe('Narak + Lives counters', () => {
  beforeEach(reset);

  it('counts a narak visit when entering a hell realm from a square', () => {
    // Square 11 is a snake head leading to मरण (a hell realm).
    set({ currentSquare: 10, realm: null });
    useGameStore.getState().applyMove(1); // 10 -> 11 -> मरण
    const s = useGameStore.getState();
    expect(s.realm).toBe(REALM.maran);
    expect(s.narakVisits).toBe(1);
    expect(s.lives).toBe(0);
  });

  it('does NOT recount when moving realm → realm without rebirth', () => {
    // In महानरक, the escape rule sends the soul to क्षुद्रनरक (realm → realm).
    set({ realm: REALM.mahanarak, narakVisits: 1 });
    useGameStore.getState().applyMove(3);
    const s = useGameStore.getState();
    expect(s.realm).toBe(REALM.kshudranarak);
    expect(s.narakVisits).toBe(1); // unchanged
  });

  it('counts a life each time the soul returns to janmasthan', () => {
    // क्षुद्रनरक escapes back to janmasthan.
    set({ realm: REALM.kshudranarak, lives: 0 });
    useGameStore.getState().applyMove(2);
    const s = useGameStore.getState();
    expect(s.currentSquare).toBe(JANMASTHAN);
    expect(s.realm).toBeNull();
    expect(s.lives).toBe(1);
  });
});
