/**
 * useSpiritualEvent
 *
 * Watches the game store and, when a move's animation FINISHES (`isMoving`
 * falls), derives the spiritual event for that move and surfaces it for the
 * modal. Each roll is presented at most once.
 *
 * During auto-play the journey flows uninterrupted, so mid-journey events are
 * suppressed — except moksha (the climax), which always shows and also stops
 * auto-play.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { boardData } from '@/data';
import { useGameStore } from '@/store';
import {
  buildEventSources,
  describeEvent,
  type SpiritualEvent,
} from '../events';

interface UseSpiritualEventResult {
  event: SpiritualEvent | null;
  dismiss: () => void;
}

export function useSpiritualEvent(): UseSpiritualEventResult {
  const lastMove = useGameStore(state => state.lastMove);
  const totalRolls = useGameStore(state => state.totalRolls);
  const isMoving = useGameStore(state => state.isMoving);
  const isAutoPlaying = useGameStore(state => state.isAutoPlaying);
  const setAutoPlay = useGameStore(state => state.setAutoPlay);

  // Dataset is static; index it once.
  const sources = useMemo(() => buildEventSources(boardData), []);
  const [event, setEvent] = useState<SpiritualEvent | null>(null);
  const shownRollId = useRef<number | null>(null);

  useEffect(() => {
    // Reset (no move) clears any open event.
    if (!lastMove) {
      shownRollId.current = null;
      setEvent(null);
      return;
    }
    // Wait for the walk/jump to finish, and present each roll only once.
    if (isMoving || shownRollId.current === totalRolls) {
      return;
    }
    shownRollId.current = totalRolls;

    const next = describeEvent(lastMove, sources);
    if (!next) {
      return;
    }
    if (next.kind === 'moksha') {
      setAutoPlay(false);
      setEvent(next);
    } else if (!isAutoPlaying) {
      setEvent(next);
    }
  }, [lastMove, totalRolls, isMoving, isAutoPlaying, sources, setAutoPlay]);

  const dismiss = useCallback(() => setEvent(null), []);

  return { event, dismiss };
}
