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
import { MedallionView } from './MedallionView';
import { OffboardCellView } from './OffboardCellView';
import { SnakesLaddersLayer } from './SnakesLaddersLayer';

interface BoardCanvasProps {
  layout: BoardLayout;
  /** When false, the snakes & ladders overlay is hidden (board-only view). */
  showOverlay?: boolean;
}

const BoardCanvasComponent: React.FC<BoardCanvasProps> = ({
  layout,
  showOverlay = true,
}) => {
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
      {/* Realm / janmasthan cells in the band below square 1. */}
      {layout.offboardCells.map(cell => (
        <OffboardCellView key={cell.key} cell={cell} />
      ))}
      {/* Snakes & ladders sit above the cells, below the soul token.
          Hidden in the board-only view so the squares can be read clearly. */}
      {showOverlay ? <SnakesLaddersLayer layout={layout} /> : null}
      {/* The sacred हरिहर क्षेत्र medallion at the heart of the oval ring,
          above the snake/ladder lines so they read as passing behind it. */}
      {layout.medallion ? <MedallionView box={layout.medallion} /> : null}
      {/* The soul token rides on top, within the same transform. */}
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
