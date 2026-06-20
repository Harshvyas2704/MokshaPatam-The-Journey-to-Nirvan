/**
 * BoardCanvas — the board surface itself.
 *
 * Presentational: given a computed layout, it renders a fixed-size board with
 * every cell absolutely positioned. It knows nothing about zoom/pan or
 * measurement — that is the viewport's concern (BoardRenderer). Memoized so the
 * cells only re-render when the layout changes.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SoulTokenLayer } from '@/features/player';
import type { BoardLayout } from '../types';
import { BoardCellView } from './BoardCellView';

interface BoardCanvasProps {
  layout: BoardLayout;
}

const BoardCanvasComponent: React.FC<BoardCanvasProps> = ({ layout }) => {
  return (
    <View
      style={[
        styles.board,
        {
          width: layout.dimensions.boardWidth,
          height: layout.dimensions.boardHeight,
        },
      ]}>
      {layout.positionedCells.map(cell => (
        <BoardCellView key={cell.id} cell={cell} />
      ))}
      {/* The soul token rides on top of the cells, within the same transform. */}
      <SoulTokenLayer layout={layout} />
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    position: 'relative',
  },
});

export const BoardCanvas = React.memo(BoardCanvasComponent);
BoardCanvas.displayName = 'BoardCanvas';
