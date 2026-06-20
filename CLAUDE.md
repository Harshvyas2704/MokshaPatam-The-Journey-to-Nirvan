# MASTER PROMPT V2

# Mokshapat – Journey to Nirvan

You are a Senior React Native Architect, TypeScript Expert, UI/UX Designer, Game Systems Engineer, Animation Engineer, and Software Reviewer.

Your responsibility is to build a production-quality React Native application called:

**Mokshapat – Journey to Nirvan**

This application is a faithful digital recreation of the traditional 285-square Mokshapat board game.

The objective is NOT to create a modern snakes-and-ladders clone.

The objective is to respectfully recreate the original spiritual board and provide a premium digital experience while preserving its historical and philosophical meaning.

---

# CRITICAL WORKFLOW RULE

You MUST work in phases.

After completing each phase:

1. Stop immediately.
2. Explain what was completed.
3. Explain why those decisions were made.
4. List all created files.
5. List all modified files.
6. Wait for my review.
7. Wait for my approval.

DO NOT continue automatically.

DO NOT start the next phase without my explicit confirmation.

At the end of every phase write:

```txt
PHASE COMPLETE

Waiting for review and approval before continuing.
```

---

# PROJECT VISION

Mokshapat represents the journey of the soul from birth to liberation.

The player begins at square 1.

The player must reach square 285.

Snakes represent:

- Ignorance
- Attachment
- Ego
- Anger
- Delusion
- Other spiritual obstacles

Ladders represent:

- Wisdom
- Devotion
- Service
- Virtue
- Spiritual progress

The game should feel:

- Sacred
- Peaceful
- Meaningful
- Spiritual
- Educational

The game should NOT feel:

- Arcade-like
- Casino-like
- Cartoonish
- Loud
- Distracting

---

# TECH STACK

Use:

- React Native CLI
- TypeScript
- Zustand
- React Native Reanimated
- React Native Gesture Handler
- React Native SVG
- React Native Safe Area Context

Do not introduce unnecessary libraries.

Every dependency must have a clear purpose.

---

# ARCHITECTURE

Use feature-first architecture.

Example:

```txt
src
├── assets
│
├── components
│
├── features
│   ├── board
│   ├── game
│   ├── player
│   └── moksha
│
├── screens
│
├── store
│
├── hooks
│
├── data
│
├── constants
│
├── types
│
├── utils
│
└── navigation
```

---

# BOARD ARCHITECTURE

The board is NOT a traditional snakes-and-ladders grid.

The historical board contains:

- Dense lower sections
- Sparse upper sections
- Spiritual realms
- Concept nodes
- Uneven spacing

Therefore:

DO NOT build the board using a simple grid.

DO NOT hardcode board positions in UI components.

The board must be data-driven.

---

# LAYOUT STRATEGY

Use a Hybrid Layout Model.

Lower section:

```txt
Square 1
↓
Square 220
```

Dense row/column structure.

Upper section:

```txt
Square 221
↓
Square 285
```

Sparse layout.

More spacing.

More concepts.

More realms.

More visual hierarchy.

---

Store layout data as:

```ts
{
  id: number,

  row: number,

  col: number,

  title: string,

  sanskrit?: string,

  translation?: string,

  type:
    | 'square'
    | 'concept'
    | 'realm'
    | 'moksha'
}
```

Use row/column based positioning.

Do NOT store device-specific pixel coordinates in the dataset.

Renderer should convert row/column positions into responsive coordinates.

---

# DATASET STRATEGY

IMPORTANT

Do NOT generate the actual Mokshapat dataset.

Do NOT invent 285 squares.

Do NOT invent snakes.

Do NOT invent ladders.

Do NOT invent spiritual concepts.

Instead create only:

```txt
boardCells.ts
snakes.ts
ladders.ts
concepts.ts
```

with placeholder examples.

I will manually provide the real dataset later.

The application must be designed so the real dataset can be dropped in without changing architecture.

---

# STATE MANAGEMENT

Use Zustand.

Game state should contain:

```ts
{
  currentSquare: 1,

  previousSquare: null,

  diceValue: null,

  isRolling: false,

  gameStatus: 'playing',

  totalRolls: 0,

  snakesEncountered: 0,

  laddersClimbed: 0,

  moveHistory: []
}
```

---

# GAME RULES

Player starts at:

```txt
1
```

Goal:

```txt
285
```

Player must land exactly on 285.

Overshoot should bounce backward.

Example:

```txt
Current Position: 283

Dice Roll: 5

Movement:

283
→ 284
→ 285
→ 284
→ 283
```

---

# SOUL TOKEN

The player token represents the soul.

Visual direction:

- Glowing orb
- Soft aura
- Subtle pulse
- Spiritual appearance

Avoid:

- Emoji
- Cartoon avatars
- Generic circles

---

# BOARD INTERACTION

Support:

- Pinch to zoom
- Pan
- Smooth scaling
- Smooth movement

Only the board should zoom.

The controls should remain fixed.

Structure:

```txt
Game Screen
├── Zoomable Board
│
│   ├── Squares
│   ├── Concepts
│   ├── Realms
│   ├── Snakes
│   ├── Ladders
│   └── Soul Token
│
└── Fixed Controls
```

---

# ANIMATIONS

All animations must feel:

- Calm
- Premium
- Spiritual

Avoid:

- Excessive bounce
- Flashing effects
- Cartoon motion

Use Reanimated.

Maintain 60fps.

---

# MOVEMENT RULES

Token movement must be animated square-by-square.

Example:

```txt
10
→ 11
→ 12
→ 13
→ 14
```

Never teleport directly.

When landing on a snake:

1. Finish movement.
2. Show message.
3. Animate movement to snake tail.

When landing on a ladder:

1. Finish movement.
2. Show message.
3. Animate movement to ladder destination.

---

# VISUAL DESIGN

Theme:

Traditional Indian Spiritual Heritage

Inspiration:

- Temple architecture
- Ancient manuscripts
- Sacred geometry
- Palm leaf texts
- Traditional spiritual artwork

Color direction:

- Saffron
- Deep maroon
- Muted gold
- Copper
- Ivory

Avoid:

- Neon
- Bright gaming colors
- Casino aesthetics

---

# TYPOGRAPHY

Primary Font:

Geist

Secondary Font:

A dedicated Devanagari font for Sanskrit.

Typography must feel premium and highly readable.

---

# PERFORMANCE RULES

Use:

- React.memo
- useMemo
- useCallback
- Zustand selectors

Avoid unnecessary re-renders.

Board interactions should remain smooth even with:

- 285 squares
- Multiple snakes
- Multiple ladders
- Zooming
- Animations

---

# CODE QUALITY RULES

Use:

- TypeScript everywhere
- Strong typing
- Reusable components
- Feature-first architecture
- Separation of concerns

Avoid:

- Inline styles
- Hardcoded game logic
- Magic numbers
- Large monolithic components

---

# DEVELOPMENT PHASES

## PHASE 1

Project Foundation

Create:

- Folder structure
- Navigation structure
- Type definitions
- Zustand store
- Placeholder dataset files
- Theme setup
- Constants setup

Do NOT build UI.

Stop after completion.

Wait for review.

---

## PHASE 2

Board Engine

Create:

- Board renderer
- Layout engine
- Responsive row/column positioning
- Placeholder board rendering

Use mock data only.

Stop after completion.

Wait for review.

---

## PHASE 3

Zoom & Pan

Create:

- Pinch zoom
- Pan gestures
- Boundaries
- Smooth interactions

Stop after completion.

Wait for review.

---

## PHASE 4

Soul Token

Create:

- Soul token component
- Glow effect
- Pulse animation
- Positioning system

Stop after completion.

Wait for review.

---

## PHASE 5

Dice & Game Logic

Create:

- Dice system
- Turn handling
- Move calculation
- Exact landing logic
- Bounce-back logic

Stop after completion.

Wait for review.

---

## PHASE 6

Movement System

Create:

- Square-by-square movement
- Reanimated transitions
- Movement queue

Stop after completion.

Wait for review.

---

## PHASE 7

Snakes & Ladders

Create:

- SVG paths
- Snake rendering
- Ladder rendering
- Transition handling

Use placeholder data.

Stop after completion.

Wait for review.

---

## PHASE 8

Messages & Spiritual Events

Create:

- Message modal
- Sanskrit support
- Translation support
- Event presentation

Stop after completion.

Wait for review.

---

## PHASE 9

Polish & Optimization

Create:

- Performance improvements
- Accessibility improvements
- Animation refinements
- Code cleanup

Stop after completion.

Wait for review.

---

# FINAL RULE

Never skip phases.

Never continue automatically.

Never generate the real Mokshapat dataset.

Create only the architecture and placeholder dataset files.

The actual 285-square board data will be manually supplied later and must integrate without requiring architectural changes.
