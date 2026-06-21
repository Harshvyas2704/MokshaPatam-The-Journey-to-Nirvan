/**
 * Game store (Zustand).
 *
 * Holds STATE and orchestration; the move math lives in the pure logic modules
 * (`@/features/game/logic`). The soul's position is `realm ?? currentSquare`
 * (0 = janmasthan). Movement is faithful to the reference: enter from
 * janmasthan, no bounce-back, snakes/ladders that lead into realms, and
 * realm-escape rules.
 *
 * The store commits the resolved result immediately; the movement layer replays
 * the animation and clears `isMoving` when it finishes.
 */
import { create } from 'zustand';
import type { GameState, Position } from '@/types';
import { JANMASTHAN } from '@/data';
import { resolveMove, rollDie } from '@/features/game/logic';

/** The initial, freshly-born game state (at janmasthan). */
export const initialGameState: GameState = {
  currentSquare: JANMASTHAN,
  realm: null,
  diceValue: null,
  isRolling: false,
  isMoving: false,
  isAutoPlaying: false,
  lastMove: null,
  gameStatus: 'idle',
  totalRolls: 0,
  snakesEncountered: 0,
  laddersClimbed: 0,
  narakCount: 0,
  narakVisits: 0,
  lives: 0,
  mrutyuRollCount: 0,
  moveHistory: [],
};

/** Actions exposed by the game store. */
export interface GameActions {
  reset: () => void;
  rollDice: () => void;
  /** Resolve and apply a move for a specific dice value (deterministic). */
  applyMove: (dice: number) => void;
  setAutoPlay: (active: boolean) => void;
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
    const position: Position = state.realm ?? state.currentSquare;
    const resolved = resolveMove(position, dice, state.mrutyuRollCount);
    const { move } = resolved;

    // Derive the new resting place from the move's final position.
    const landedNumeric = typeof move.to === 'number';
    const currentSquare = landedNumeric
      ? (move.to as number)
      : state.currentSquare;
    const realm = landedNumeric ? null : (move.to as string);

    // Narak visit: the soul ENTERS a hell realm from the board (a numeric
    // square or janmasthan). A realm→realm move (e.g. महानरक → क्षुद्रनरक) keeps
    // `from` a string, so it is not recounted until the soul has been reborn.
    const enteredNarak =
      typeof move.to === 'string' && typeof move.from !== 'string';
    // A new life: the soul returns to janmasthan (0) from anywhere else.
    const returnedToBirth =
      move.to === JANMASTHAN && move.from !== JANMASTHAN;

    set(s => ({
      diceValue: dice,
      currentSquare,
      realm,
      lastMove: move,
      // The movement layer plays the animation and clears this when done.
      isMoving: true,
      totalRolls: s.totalRolls + 1,
      snakesEncountered: s.snakesEncountered + resolved.snake,
      laddersClimbed: s.laddersClimbed + resolved.ladder,
      narakCount: s.narakCount + resolved.narak,
      narakVisits: s.narakVisits + (enteredNarak ? 1 : 0),
      lives: s.lives + (returnedToBirth ? 1 : 0),
      mrutyuRollCount: resolved.mrutyuRollCount,
      gameStatus: resolved.won ? 'won' : 'playing',
      moveHistory: [
        ...s.moveHistory,
        {
          id: s.totalRolls + 1,
          from: move.from,
          to: move.to,
          dice,
          outcome: move.outcome,
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
      isAutoPlaying: active && s.gameStatus !== 'won',
    })),

  setMoving: (moving: boolean) => set({ isMoving: moving }),
}));
