/**
 * Unit tests for the (pure) move resolution against the real dataset.
 */
import { getMovePath, resolveMove } from '@/features/game/logic';
import { REALM } from '@/data';

describe('resolveMove', () => {
  it('enters the board from janmasthan at square 1 only on a 6', () => {
    const { move } = resolveMove(0, 6, 0);
    expect(move.to).toBe(1);
    expect(move.outcome).toBe('enter');
    expect(move.steps).toEqual([1]);
  });

  it('blocks janmasthan entry on a non-6 (the turn is skipped)', () => {
    const { move } = resolveMove(0, 4, 0);
    expect(move.from).toBe(0);
    expect(move.to).toBe(0);
    expect(move.outcome).toBe('blocked');
    expect(move.steps).toEqual([]);
  });

  it('does not bounce: an overshoot past 285 stays put', () => {
    const { move } = resolveMove(283, 5, 0);
    expect(move.to).toBe(283);
    expect(move.outcome).toBe('blocked');
    expect(move.steps).toEqual([]);
  });

  it('wins on reaching 285', () => {
    const { move, won } = resolveMove(284, 1, 0);
    expect(move.to).toBe(285);
    expect(move.outcome).toBe('win');
    expect(won).toBe(true);
  });

  it('slides down a numeric snake (251 -> 1)', () => {
    const { move, snake } = resolveMove(250, 1, 0);
    expect(move.outcome).toBe('snake');
    expect(move.to).toBe(1);
    expect(snake).toBe(1);
  });

  it('climbs a numeric ladder (7 -> 29)', () => {
    const { move, ladder } = resolveMove(6, 1, 0);
    expect(move.outcome).toBe('ladder');
    expect(move.to).toBe(29);
    expect(ladder).toBe(1);
  });

  it('routes a loka ladder through the loka, then onward to a hell (33)', () => {
    // 32 + 1 -> 33 -> शून्य लोक (ladder) -> महानरक-लेफ्ट (chain).
    const { move } = resolveMove(32, 1, 0);
    expect(move.to).toBe(REALM.mahanarakLeft);
    // The animation path visibly passes through the loka before the hell.
    const path = getMovePath(move);
    expect(path).toEqual([33, REALM.shunya, REALM.mahanarakLeft]);
  });

  it('falls off-board into a naraka (103 -> महानरक-लेफ्ट)', () => {
    const { move, narak } = resolveMove(102, 1, 0);
    expect(move.outcome).toBe('narak');
    expect(move.to).toBe(REALM.mahanarakLeft);
    expect(narak).toBe(1);
  });

  it('escapes mahanarak to kshudranarak', () => {
    const { move } = resolveMove(REALM.mahanarakLeft, 3, 0);
    expect(move.outcome).toBe('escape');
    expect(move.to).toBe(REALM.kshudranarak);
  });

  it('escapes kshudranarak back to janmasthan (0)', () => {
    const { move } = resolveMove(REALM.kshudranarak, 2, 0);
    expect(move.outcome).toBe('escape');
    expect(move.to).toBe(0);
  });

  it('the grave needs four rolls before releasing to महानरक', () => {
    const stuck = resolveMove(REALM.grave, 1, 0);
    expect(stuck.move.outcome).toBe('blocked');
    expect(stuck.mrutyuRollCount).toBe(1);

    const released = resolveMove(REALM.grave, 1, 3);
    expect(released.move.outcome).toBe('narak');
    expect(released.move.to).toBe(REALM.mahanarakRight);
    expect(released.mrutyuRollCount).toBe(0);
  });
});
