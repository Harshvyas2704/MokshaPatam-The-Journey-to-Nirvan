/**
 * useAutoPlay
 *
 * While auto-play is active, rolls the dice repeatedly until the soul reaches
 * the goal, pacing rolls by AUTO_ROLL_INTERVAL_MS. Re-arms after each roll by
 * depending on `totalRolls`, and stops itself when the game is won.
 *
 * Timing lives here (a UI concern) rather than in the store.
 */
import { useEffect } from 'react';
import { AUTO_ROLL_INTERVAL_MS } from '@/constants';
import { useGameStore } from '@/store';

export function useAutoPlay(): void {
  const isAutoPlaying = useGameStore(state => state.isAutoPlaying);
  const gameStatus = useGameStore(state => state.gameStatus);
  const isMoving = useGameStore(state => state.isMoving);
  const rollDice = useGameStore(state => state.rollDice);
  const setAutoPlay = useGameStore(state => state.setAutoPlay);

  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }
    if (gameStatus === 'won') {
      setAutoPlay(false);
      return;
    }
    // Wait for the current move's animation to finish before scheduling the
    // next roll; `isMoving` flipping back to false re-arms this effect.
    if (isMoving) {
      return;
    }
    const timer = setTimeout(rollDice, AUTO_ROLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isAutoPlaying, gameStatus, isMoving, rollDice, setAutoPlay]);
}
