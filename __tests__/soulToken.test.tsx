/**
 * Tests for the soul token: pure positioning + render smoke test.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { PositionedCell } from '@/features/board/types';
import { getSoulCenter } from '@/features/player';
import { SoulToken } from '@/features/player';

describe('getSoulCenter', () => {
  it('centers on the cell and carries the cell size', () => {
    const cell: PositionedCell = {
      id: 1,
      row: 0,
      col: 0,
      title: '1',
      type: 'square',
      x: 100,
      y: 200,
      size: 50,
    };
    expect(getSoulCenter(cell)).toEqual({
      centerX: 125,
      centerY: 225,
      cellSize: 50,
    });
  });
});

describe('SoulToken', () => {
  it('renders without crashing', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<SoulToken cellSize={48} />);
    });
  });
});
