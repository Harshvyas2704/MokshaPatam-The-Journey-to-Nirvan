# Mokshapat — Journey to Nirvan

A faithful, premium digital recreation of **Mokshapat** (also called _Kaivalyapat_, "The Chart of Liberation") — the ancient Indian spiritual board game in the tradition of Saint Dnyaneshwar, and the philosophical ancestor of modern Snakes & Ladders.

The board is not a generic grid: it is a 285-square journey of the soul from **Manushyaloka** (the human realm) toward **Moksha** (liberation). Snakes are spiritual falls (ignorance, attachment, ego); ladders are spiritual ascents (wisdom, devotion, service). The experience aims to feel sacred, calm, and meaningful — not arcade-like.

> Built with React Native CLI + TypeScript, with a data-driven board, a Zustand game engine, and Reanimated animations running on the UI thread for smooth 60fps interaction.

---

## ✨ Features

- **285-square spiritual board** with a hybrid layout — a dense 14-wide serpentine lower grid plus a sparse, scattered upper section (an oval ring of _loka_ cells and a centred pyramid of the highest realms), crowned by the central **हरिहर क्षेत्र (Harihar Kshetra)** medallion.
- **Authentic snakes, ladders & realms** — including off-board hells (_Mahanarak_, _Kshudranarak_), death (_Mrityu_ / the grave), and celestial _lokas_, with faithful escape and rebirth rules.
- **The soul token** — a luminous, breathing orb (no emoji/avatars) that moves square-by-square, never teleporting.
- **Pinch-zoom & pan** board viewport with fixed controls; manual roll and auto-roll, with a move-history log.
- **Counters** — _Narak_ visits (entries into a hell realm) and _Lives_ (returns to janmasthan).
- **Conditional path coloring** — snakes/ladders shaded light→dark by how far they carry the soul; cells tinted by role.
- **Board-only view** toggle to hide snakes & ladders and read the squares clearly.
- **Instructions screen** with the game's rules, philosophy, and a full ladder/snake listing.
- **Reduced-motion aware**, accessibility labels, and a heritage visual theme (saffron, maroon, gold, copper, ivory).

---

## 🧱 Tech Stack

| Concern        | Choice                               |
| -------------- | ------------------------------------ |
| Framework      | React Native CLI `0.83` · React `19` |
| Language       | TypeScript (strict)                  |
| State          | Zustand                              |
| Animation      | React Native Reanimated (+ Worklets) |
| Gestures       | React Native Gesture Handler         |
| Vector drawing | React Native SVG                     |
| Navigation     | React Navigation (native stack)      |
| Layout safety  | React Native Safe Area Context       |
| Testing        | Jest · react-test-renderer           |

Path alias `@/*` → `src/*` (via `babel-plugin-module-resolver` + `tsconfig`).

---

## 📁 Project Structure

Feature-first architecture — UI never hardcodes board positions or game logic; both are data-driven and pure.

```
src/
├── assets/          # fonts, images
├── components/      # shared, presentational components
├── constants/       # theme (colors, spacing, typography), board + layout constants
├── data/            # the dataset: cells, snakes, ladders, realms, instructions (pure)
├── features/
│   ├── board/       # layout engine, renderer, cells, snakes/ladders overlay, medallion
│   ├── game/        # dice, controls, move history
│   ├── moksha/      # spiritual-event glyphs & modals
│   └── player/      # the soul token + its movement
├── hooks/
├── navigation/      # routes + native-stack navigator
├── screens/         # Home → Instructions → Game
├── store/           # Zustand game store
├── types/           # domain + navigation types
└── utils/           # pure helpers (math, color)
```

Key idea: the **layout engine** (`src/features/board/layout`) converts the dataset's device-independent `row`/`col` grid into responsive pixel coordinates, and the **move logic** (`src/features/game/logic`) resolves dice rolls, snakes, ladders, and realm transitions as pure functions. Both are unit-tested independently of React.

---

## 🚀 Getting Started

> Complete the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) first (Xcode / Android Studio, JDK, etc.). Requires **Node ≥ 20**.

### 1. Install dependencies

```sh
npm install
```

### 2. iOS only — install pods

```sh
cd ios && bundle install && bundle exec pod install && cd ..
```

### 3. Start Metro

```sh
npm start
```

### 4. Run the app

```sh
# Android
npm run android

# iOS
npm run ios
```

---

## 🧪 Quality

```sh
npm test          # Jest unit tests (layout, movement, counters, dataset, …)
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript type-check
```

The pure modules (board layout, move resolution, counters, path listings, overlay geometry, zoom math) are covered by fast, framework-free unit tests.

---

## 🎮 How to Play

1. Begin at **Janmasthan** and enter the board at square 1 (the human realm).
2. Roll the dice and move forward, climbing toward **285 (Moksha)**.
3. **Ladders** carry the soul upward (virtue, devotion); **snakes** drop it downward (ego, delusion).
4. Some snakes lead **off-board** into hells; escape rules return the soul through _Kshudranarak_ back to _Janmasthan_ (a new life), while the grave (_Mrityu_) holds the soul for several turns.
5. Reaching square **285** attains liberation.

Play with detachment — the game is meant as a contemplative practice, not a race.

---

## 🙏 Credits

Game concept and dataset rooted in the traditional Mokshapat / Kaivalyapat board.
Rebuilt with ❤️ by **Harsh Vyas**.
