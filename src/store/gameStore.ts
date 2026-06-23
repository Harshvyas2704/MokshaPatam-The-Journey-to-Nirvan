/**
 * Game store (Zustand) — multiplayer turn-based.
 *
 * Holds STATE and orchestration; the move math lives in the pure logic modules
 * (`@/features/game/logic`). Each player (soul) tracks its own position
 * (`realm ?? currentSquare`, 0 = janmasthan), counters, and grave timer.
 *
 * Turn flow:
 *  - `applyMove` resolves the current player's roll and commits the result
 *    immediately, then the movement layer replays the animation.
 *  - Rolling a 6 grants another roll (the turn does NOT advance).
 *  - Otherwise the turn advances to the next unfinished player WHEN the move
 *    animation finishes (so the soul lands before the next player begins).
 *  - Reaching Moksha (285) finishes that soul with the next rank; the game ends
 *    ('won') once every soul is liberated.
 */
import { create } from 'zustand';
import type { GameState, PlayerConfig, PlayerState, Position } from '@/types';
import { JANMASTHAN } from '@/data';
import { resolveMove, rollDie } from '@/features/game/logic';

/** A freshly-born player at janmasthan. */
function makePlayer(id: number, name: string, colorId: number): PlayerState {
  return {
    id,
    name,
    colorId,
    currentSquare: JANMASTHAN,
    realm: null,
    mrutyuRollCount: 0,
    narakVisits: 0,
    lives: 0,
    finished: false,
    rank: null,
  };
}

/** Reset a player to the start while keeping identity (name / color). */
function rebirth(player: PlayerState): PlayerState {
  return makePlayer(player.id, player.name, player.colorId);
}

/** Per-session globals shared by `reset` and `startGame`. */
const FRESH_GLOBALS = {
  currentPlayerIndex: 0,
  finishedCount: 0,
  diceValue: null,
  isRolling: false,
  isMoving: false,
  isAutoPlaying: false,
  lastMove: null,
  lastMovePlayerId: null,
  lastMoveTurnSwitched: false,
  pendingAdvance: false,
  gameStatus: 'idle' as const,
  totalRolls: 0,
  moveHistory: [],
};

/** The initial state: a single default player (until `startGame` is called). */
export const initialGameState: GameState = {
  ...FRESH_GLOBALS,
  players: [makePlayer(0, 'Player 1', 0)],
};

/** Index of the next unfinished player after `from` (wraps around). */
function nextUnfinishedIndex(players: PlayerState[], from: number): number {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + step) % n;
    if (!players[i].finished) {
      return i;
    }
  }
  return from; // everyone finished — caller ends the game
}

/** Actions exposed by the game store. */
export interface GameActions {
  /** Configure the players and begin a fresh game. */
  startGame: (configs: PlayerConfig[]) => void;
  /** Restart the current players at janmasthan. */
  reset: () => void;
  /** Roll for the current player (no-op while moving or finished). */
  rollDice: () => void;
  /** Resolve and apply a move for a specific dice value (deterministic). */
  applyMove: (dice: number) => void;
  setAutoPlay: (active: boolean) => void;
  setMoving: (moving: boolean) => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  startGame: (configs: PlayerConfig[]) =>
    set({
      ...FRESH_GLOBALS,
      gameStatus: 'playing',
      players: configs.map((c, i) => makePlayer(i, c.name, c.colorId)),
    }),

  reset: () =>
    set(s => ({
      ...FRESH_GLOBALS,
      gameStatus: s.players.length > 0 ? 'playing' : 'idle',
      players: s.players.map(rebirth),
    })),

  applyMove: (dice: number) => {
    const state = get();
    if (state.gameStatus === 'won') {
      return;
    }
    const player = state.players[state.currentPlayerIndex];
    if (!player || player.finished) {
      return;
    }

    const position: Position = player.realm ?? player.currentSquare;
    const resolved = resolveMove(position, dice, player.mrutyuRollCount);
    const { move } = resolved;

    // Derive the new resting place from the move's final position.
    const landedNumeric = typeof move.to === 'number';
    const currentSquare = landedNumeric
      ? (move.to as number)
      : player.currentSquare;
    const realm = landedNumeric ? null : (move.to as string);

    // Narak visit: ENTER a hell realm from the board (not realm→realm).
    const enteredNarak =
      typeof move.to === 'string' && typeof move.from !== 'string';
    // A new life: returned to janmasthan from anywhere else.
    const returnedToBirth = move.to === JANMASTHAN && move.from !== JANMASTHAN;

    const finishedNow = resolved.won && !player.finished;
    const rank = finishedNow ? state.finishedCount + 1 : player.rank;
    const finishedCount = state.finishedCount + (finishedNow ? 1 : 0);
    const allFinished = finishedCount === state.players.length;

    // Rolling a 6 grants another roll (unless the soul just got liberated).
    const extraRoll = dice === 6 && !finishedNow;
    const turnSwitched = state.lastMovePlayerId !== player.id;

    const updatedPlayer: PlayerState = {
      ...player,
      currentSquare,
      realm,
      mrutyuRollCount: resolved.mrutyuRollCount,
      narakVisits: player.narakVisits + (enteredNarak ? 1 : 0),
      lives: player.lives + (returnedToBirth ? 1 : 0),
      finished: player.finished || finishedNow,
      rank,
    };

    set(s => ({
      players: s.players.map(p => (p.id === player.id ? updatedPlayer : p)),
      diceValue: dice,
      lastMove: move,
      lastMovePlayerId: player.id,
      lastMoveTurnSwitched: turnSwitched,
      // The movement layer plays the animation and clears this when done.
      isMoving: true,
      // Advance the turn after the animation, unless this soul rolls again.
      pendingAdvance: !extraRoll && !allFinished,
      finishedCount,
      totalRolls: s.totalRolls + 1,
      gameStatus: allFinished ? 'won' : 'playing',
      moveHistory: [
        ...s.moveHistory,
        {
          id: s.totalRolls + 1,
          playerId: player.id,
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

  setMoving: (moving: boolean) =>
    set(s => {
      if (moving) {
        return { isMoving: true };
      }
      // Move finished: advance the turn if one is pending.
      if (!s.pendingAdvance) {
        return { isMoving: false };
      }
      return {
        isMoving: false,
        pendingAdvance: false,
        currentPlayerIndex: nextUnfinishedIndex(
          s.players,
          s.currentPlayerIndex,
        ),
      };
    }),
}));
