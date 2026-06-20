/**
 * Game store (Zustand).
 *
 * Phase 5 implements the gameplay rules: dice rolling, exact-landing with
 * bounce-back, and snake/ladder resolution, plus auto-play. The store holds
 * STATE and orchestration; the actual math lives in the pure logic modules
 * (`@/features/game/logic`), which the store imports directly (no cycle).
 *
 * The token currently snaps to the resolved square; Phase 6 adds the animated
 * square-by-square walk using `MoveResult.steps`.
 */
import { create } from 'zustand';
import type { GameState } from '@/types';
import { GOAL_SQUARE, START_SQUARE } from '@/constants';
import {
  ladderMap,
  resolveMove,
  rollDie,
  snakeMap,
} from '@/features/game/logic';

/** The initial, freshly-born game state. */
export const initialGameState: GameState = {
  currentSquare: START_SQUARE,
  previousSquare: null,
  diceValue: null,
  isRolling: false,
  isMoving: false,
  isAutoPlaying: false,
  lastMove: null,
  gameStatus: 'idle',
  totalRolls: 0,
  snakesEncountered: 0,
  laddersClimbed: 0,
  moveHistory: [],
};

/** Actions exposed by the game store. */
export interface GameActions {
  /** Reset the session back to the initial state. */
  reset: () => void;
  /** Roll the dice once and apply the resulting move. */
  rollDice: () => void;
  /** Resolve and apply a move for a specific dice value (deterministic). */
  applyMove: (dice: number) => void;
  /** Start/stop auto-play. */
  setAutoPlay: (active: boolean) => void;
  /** Set whether the token is mid-animation (called by the movement layer). */
  setMoving: (moving: boolean) => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  reset: () => set({ ...initialGameState }),

  applyMove: (dice: number) => {
    const state = get();
    if (state.gameStatus === 'won') {
      return;
    }
    const result = resolveMove(
      state.currentSquare,
      dice,
      GOAL_SQUARE,
      snakeMap,
      ladderMap,
    );

    set(s => ({
      diceValue: dice,
      previousSquare: s.currentSquare,
      currentSquare: result.to,
      lastMove: result,
      // The movement layer plays the animation and clears this when done.
      isMoving: true,
      totalRolls: s.totalRolls + 1,
      snakesEncountered:
        s.snakesEncountered + (result.outcome === 'snake' ? 1 : 0),
      laddersClimbed:
        s.laddersClimbed + (result.outcome === 'ladder' ? 1 : 0),
      gameStatus: result.to === GOAL_SQUARE ? 'won' : 'playing',
      moveHistory: [
        ...s.moveHistory,
        {
          id: s.totalRolls + 1,
          from: result.from,
          to: result.to,
          dice,
          outcome: result.outcome,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  rollDice: () => {
    const state = get();
    if (state.gameStatus === 'won' || state.isMoving) {
      return;
    }
    state.applyMove(rollDie());
  },

  setAutoPlay: (active: boolean) =>
    set(s => ({
      // Can't auto-play a finished game.
      isAutoPlaying: active && s.gameStatus !== 'won',
    })),

  setMoving: (moving: boolean) => set({ isMoving: moving }),
}));
