/**
 * Instructions / "Game Introduction" content (data-driven).
 *
 * Kept out of the screen component so the educational text is editable in one
 * place and the screen stays a thin, reusable renderer. Faithful to the
 * traditional Mokshapat (Kaivalyapat) tradition of Saint Dnyaneshwar.
 */

/** A titled group of bullet points within a section. */
export interface InstructionGroup {
  title: string;
  points: string[];
}

/** One section of the introduction: a heading, optional prose, optional groups. */
export interface InstructionSection {
  heading: string;
  paragraphs?: string[];
  groups?: InstructionGroup[];
}

/** Eyebrow + title shown at the top of the Instructions screen. */
export const INSTRUCTIONS_TITLE = {
  eyebrow: 'Mokshapat',
  title: 'Game Introduction',
} as const;

/** Label for the call-to-action that enters the game. */
export const INSTRUCTIONS_CTA = '🎲  Start Game';

/** Footer credit. */
export const INSTRUCTIONS_CREDIT = 'rebuilt with ❤️ by Harsh Vyas';

export const INSTRUCTION_SECTIONS: InstructionSection[] = [
  {
    heading: 'Game Introduction',
    paragraphs: [
      'Mokshapat, also called Kaivalyapat (The Chart of Liberation) or Shrouta Krida Vishesh (A Special Vedic Game), is an ancient Indian spiritual board game created in the tradition of Saint Dnyaneshwar. It is the philosophical ancestor of modern Snakes & Ladders, but with profound spiritual meaning — each square, snake, and ladder represents a stage of the soul’s journey toward liberation (Moksha).',
      'The game transforms entertainment into spiritual practice. The ultimate goal is to reach Kaivalya (Absolute Liberation), with Parabhakti (Supreme Devotion) as the highest state. All other realms — heavens, hells, and various lokas — are merely detours on this path.',
    ],
  },
  {
    heading: 'Core Rules',
    groups: [
      {
        title: 'Basic Gameplay',
        points: [
          'Players start from Manushyaloka (human realm, cell 1) and move by rolling dice.',
          'Ladders = spiritual ascent; Snakes = spiritual fall.',
          'Land on a ladder → climb to its top; land on a snake’s head → descend to its tail.',
          'Neutral squares = stay and wait (periods of steady existence).',
        ],
      },
      {
        title: 'Special Destinations',
        points: [
          'Mahanarak (Great Hell): roll to move to Kshudranarak, then restart from the human realm.',
          'Mrityu (Death / Grave): must stay 3 turns, then automatically descend to Mahanarak.',
          'Brahmaloka, Shivaloka, Vaikuntha: “safe zones” where snakes lose their power.',
          'Cells 283–285: near Moksha. Cell 285 = ultimate victory.',
        ],
      },
      {
        title: 'Key Exceptions',
        points: [
          'Players in high celestial realms (Moksha states) cannot fall via snakes.',
          'Mlechha Mata (cell 38) leads to Behasta Lok (temporary paradise), but a snake there leads to Mrityu.',
          'Avatars (incarnations from high lokas) are immune to hell — they descend to serve, not to suffer.',
        ],
      },
      {
        title: 'Spiritual Conduct',
        points: [
          'No calculating what number you need — play with detachment (Nishkama Karma).',
          'No cheating — liberation cannot be attained through deceit.',
          'No ego — saying “this is MY piece” or insulting liberated players causes spiritual demotion.',
          'Begin each game by remembering your Kuladevata (family deity) or Guru.',
          'Maintain the feeling “I am that piece” — identification with the soul’s journey.',
        ],
      },
    ],
  },
  {
    heading: 'The Philosophy',
    paragraphs: [
      'The game teaches that spiritual progress comes through small, repeated moments of divine awareness (not just intense meditation); unity and friendship (no ill-will among players); and both grace AND personal effort — liberation requires cosmic alignment and individual readiness.',
    ],
  },
];
