/**
 * Unit tests for the pure spiritual-event derivation.
 */
import type { BoardData, MoveResult } from '@/types';
import { buildEventSources, describeEvent } from '@/features/moksha';

const data: BoardData = {
  cells: [
    { id: 1, row: 0, col: 0, title: 'Birth', type: 'square' },
    { id: 8, row: 1, col: 1, title: 'Devotion Gate', type: 'square' },
    {
      id: 42,
      row: 6,
      col: 0,
      title: 'Example Concept',
      sanskrit: 'उदाहरण',
      translation: 'example',
      type: 'concept',
    },
    {
      id: 285,
      row: 47,
      col: 0,
      title: 'Moksha',
      sanskrit: 'मोक्ष',
      translation: 'liberation',
      type: 'moksha',
    },
  ],
  snakes: [{ id: 's1', from: 40, to: 12, kind: 'ego', message: 'down' }],
  ladders: [{ id: 'l1', from: 8, to: 31, kind: 'devotion', message: 'up' }],
  concepts: [
    {
      id: 'c1',
      cellId: 42,
      title: 'Example Concept',
      sanskrit: 'उदाहरण',
      translation: 'example',
      description: 'desc',
    },
  ],
};

const sources = buildEventSources(data);

function move(partial: Partial<MoveResult>): MoveResult {
  return {
    from: 1,
    dice: 1,
    steps: [],
    landing: 1,
    to: 1,
    outcome: 'normal',
    hops: [],
    ...partial,
  };
}

describe('describeEvent', () => {
  it('derives a snake event keyed by the landing (head)', () => {
    const ev = describeEvent(
      move({ from: 38, landing: 40, to: 12, outcome: 'snake' }),
      sources,
    );
    expect(ev).not.toBeNull();
    expect(ev!.kind).toBe('snake');
    expect(ev!.label).toBe('Ego'); // title-cased vice
    expect(ev!.from).toBe(40);
    expect(ev!.to).toBe(12);
    expect(ev!.message).toBe('down');
  });

  it('derives a ladder event with the title-cased virtue', () => {
    const ev = describeEvent(
      move({ from: 6, landing: 8, to: 31, outcome: 'ladder' }),
      sources,
    );
    expect(ev!.kind).toBe('ladder');
    expect(ev!.label).toBe('Devotion');
    expect(ev!.to).toBe(31);
  });

  it('derives the moksha event on a win', () => {
    const ev = describeEvent(
      move({ from: 280, landing: 285, to: 285, outcome: 'win' }),
      sources,
    );
    expect(ev!.kind).toBe('moksha');
    expect(ev!.sanskrit).toBe('मोक्ष');
    expect(ev!.translation).toBe('liberation');
  });

  it('derives a naraka event when the soul falls off-board', () => {
    const ev = describeEvent(
      move({ from: 103, landing: 103, to: 'महानरक', outcome: 'narak' }),
      sources,
    );
    expect(ev!.kind).toBe('narak');
    expect(ev!.sanskrit).toBe('महानरक');
  });

  it('surfaces a concept when landing on a concept cell', () => {
    const ev = describeEvent(move({ from: 41, landing: 42, to: 42 }), sources);
    expect(ev!.kind).toBe('concept');
    expect(ev!.sanskrit).toBe('उदाहरण');
    expect(ev!.from).toBe(ev!.to); // no journey indicator for a concept
  });

  it('returns null for a plain square', () => {
    expect(describeEvent(move({ from: 1, landing: 2, to: 2 }), sources)).toBeNull();
  });
});
