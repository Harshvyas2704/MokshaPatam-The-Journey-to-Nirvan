/**
 * Spiritual event derivation (pure, testable).
 *
 * Maps a resolved move (`MoveResult`) to the teaching "event" that should be
 * presented to the player — a snake (vice), a ladder (virtue), moksha (the
 * liberation / win), or a concept node the soul has landed on. Plain squares
 * produce no event, so the modal only interrupts the journey for something
 * meaningful.
 *
 * This is data-driven: it reads the supplied snakes / ladders / concepts /
 * cells. The placeholder dataset works today; the authentic dataset (with its
 * own Sanskrit + translations) drops in without code changes.
 */
import type {
  BoardCell,
  BoardData,
  Concept,
  Ladder,
  MoveResult,
  Snake,
} from '@/types';

export type SpiritualEventKind = 'snake' | 'ladder' | 'moksha' | 'concept';

/**
 * A presentable spiritual event. `sanskrit` / `translation` are optional so the
 * modal can degrade gracefully when the dataset omits them.
 */
export interface SpiritualEvent {
  kind: SpiritualEventKind;
  /** Accent heading — the vice / virtue name, the concept title, or "Moksha". */
  label: string;
  /** Optional cell / concept title. */
  title?: string;
  /** Optional Sanskrit term (Devanagari). */
  sanskrit?: string;
  /** Optional translation / meaning. */
  translation?: string;
  /** Optional teaching text. */
  message?: string;
  /** Where the move began (for the journey indicator). */
  from: number;
  /** Where the soul came to rest. */
  to: number;
}

/** Pre-indexed dataset for O(1) lookups while resolving an event. */
export interface EventSources {
  cells: Map<number, BoardCell>;
  snakesByHead: Map<number, Snake>;
  laddersByBase: Map<number, Ladder>;
  conceptsByCell: Map<number, Concept>;
}

/** Build the lookup indexes from the (static) dataset. */
export function buildEventSources(data: BoardData): EventSources {
  return {
    cells: new Map(data.cells.map(c => [c.id, c])),
    snakesByHead: new Map(data.snakes.map(s => [s.from, s])),
    laddersByBase: new Map(data.ladders.map(l => [l.from, l])),
    conceptsByCell: new Map(data.concepts.map(c => [c.cellId, c])),
  };
}

/** Title-case a dataset vice/virtue keyword ("ego" -> "Ego"). */
function toLabel(kind: string): string {
  if (!kind) {
    return '';
  }
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

/**
 * Derive the spiritual event for a resolved move, or `null` for a plain square.
 *
 * Snake / ladder are keyed by `landing` (the head / base the soul stepped on
 * before the jump). Moksha is the win. Otherwise, landing on a concept node (or
 * a concept/realm cell carrying teaching text) surfaces that concept.
 */
export function describeEvent(
  move: MoveResult,
  sources: EventSources,
): SpiritualEvent | null {
  if (move.outcome === 'win') {
    const cell = sources.cells.get(move.to);
    return {
      kind: 'moksha',
      label: 'Moksha',
      title: cell?.title,
      sanskrit: cell?.sanskrit ?? 'मोक्ष',
      translation: cell?.translation ?? 'liberation',
      message:
        'The soul has reached liberation. The journey from birth to Nirvan is complete.',
      from: move.from,
      to: move.to,
    };
  }

  if (move.outcome === 'snake') {
    const snake = sources.snakesByHead.get(move.landing);
    if (snake) {
      const head = sources.cells.get(snake.from);
      return {
        kind: 'snake',
        label: toLabel(snake.kind),
        title: head?.title,
        sanskrit: head?.sanskrit,
        translation: head?.translation,
        message: snake.message,
        from: snake.from,
        to: snake.to,
      };
    }
  }

  if (move.outcome === 'ladder') {
    const ladder = sources.laddersByBase.get(move.landing);
    if (ladder) {
      const base = sources.cells.get(ladder.from);
      return {
        kind: 'ladder',
        label: toLabel(ladder.kind),
        title: base?.title,
        sanskrit: base?.sanskrit,
        translation: base?.translation,
        message: ladder.message,
        from: ladder.from,
        to: ladder.to,
      };
    }
  }

  // Plain landing: surface a concept node, if the cell carries teaching content.
  const concept = sources.conceptsByCell.get(move.to);
  if (concept) {
    return {
      kind: 'concept',
      label: concept.title,
      title: concept.title,
      sanskrit: concept.sanskrit,
      translation: concept.translation,
      message: concept.description,
      from: move.to,
      to: move.to,
    };
  }

  const cell = sources.cells.get(move.to);
  if (
    cell &&
    (cell.type === 'concept' || cell.type === 'realm') &&
    (cell.sanskrit || cell.translation)
  ) {
    return {
      kind: 'concept',
      label: cell.title,
      title: cell.title,
      sanskrit: cell.sanskrit,
      translation: cell.translation,
      from: move.to,
      to: move.to,
    };
  }

  return null;
}
