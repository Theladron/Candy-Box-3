# Candy Box 3 — project rules

Incremental browser game inspired by [Candy Box](https://candybox2.github.io/candybox/): text-heavy UI, ASCII art, idle progression, currencies, unlocks, save/load.

**This document defines the target architecture.** Implement and extend toward this structure even if the current codebase does not match yet. Do not copy or preserve accidental patterns from existing files if they conflict with these rules.

---

## Stack

- Vite + React 18, **JavaScript only** (no TypeScript unless we explicitly switch).
- No game engine (Phaser, Pixi, etc.). React + CSS only.
- ASCII / monospace content: `<pre>`, monospace components, or dedicated presentational blocks.
- Persistence: `localStorage` with a `saveVersion` field and migrations.
- No new npm dependencies without stating why. No backend unless we explicitly add one.

---

## UI model: single game shell + tabs (not in-game routes)

The playable game lives on **one main screen**. Sub-areas (farm, inventory, quest, merchant, cauldron, computer, etc.) are **tabs**, not separate routed pages.

- `GameShell` owns `activeTab` and renders one **panel** at a time.
- Panel components live under `src/components/panels/`.
- Panels are **presentational**: read state, render UI, call `dispatch`. No game rules, no timers, no local copies of currencies or inventory.
- **Do not use React Router** for in-game areas. Optional routing later is only for static/meta screens (FAQ, credits) and must not own game state or the tick.
- Hiding a tab **must not** pause simulation, discard state, or skip processing for that system.

---

## What must always run (non-negotiable)

These stay active for the entire play session, regardless of `activeTab`:

| Concern | Where it lives | Must never |
|--------|----------------|------------|
| Game state | `GameProvider` at app root (`App` wraps the whole game) | Live inside a panel or a route that unmounts |
| Time / idle tick | `useGameTick` in `GameShell` or `GameProvider` | Move into a single tab/panel/route |
| Save/load | Dedicated hook or provider logic at root level | Depend on which tab is visible |
| Reducer transitions | `src/game/reducer.js` | Split across panels as `useState` |

**Rule:** Switching tabs only changes **what the player sees**. All systems (farm growth, passive candy, cooldowns, etc.) advance through the **global tick** and **reducer**, not through panel `useEffect` hooks.

If a feature needs periodic updates, add a **tick action** and handle it in the reducer (using pure helpers from `src/game/`), not a panel-local interval.

---

## Architecture layers
App └── GameProvider ← useReducer; always mounted during play └── GameShell ← useGameTick(); TabBar; active panel └── *Panel ← useGame(); render; dispatch only

src/game/ ← pure logic; NO React imports src/context/ ← GameProvider, useGame() src/hooks/ ← useGameTick, useSaveGame, etc. src/components/ ← GameShell, TabBar, shared UI src/components/panels/ ← one panel per tab


### `src/game/` (domain layer)

- `initialState.js` — full state shape
- `actions.js` — action type constants / creators
- `reducer.js` — all state transitions
- Per-system modules (`farm.js`, `merchant.js`, `quest.js`, …) — **pure functions**: formulas, unlock checks, tick deltas, combat resolution
- Optional `formulas.js` / selectors: `getCandiesPerSecond(state)`, etc.
- **No** `import` from `react` or any component

### `src/context/`

- `GameProvider` + `useGame()` exposing `{ state, dispatch }`

### `src/hooks/`

- `useGameTick` — **single owner** of `setInterval` / tick loop; dispatches tick actions
- `useSaveGame` — load on mount (`?slot=N`), autosave interval, `beforeunload` save

### `src/components/`

- `GameShell.jsx` — tab state, panel registry, calls `useGameTick`
- `TabBar.jsx` — tab buttons only
- `panels/*.jsx` — dumb UI per tab

### `App.jsx`

- Wrap game in `GameProvider` → `GameShell` only (no game logic in `App`)

---

## Integration checklist (follow for every feature)

1. **State** — extend `initialState.js`; keep a flat or clearly namespaced shape; document new fields.
2. **Actions** — add types in `actions.js`.
3. **Reducer** — handle all transitions in `reducer.js` (delegate to pure helpers).
4. **Pure logic** — implement rules/math in `src/game/<system>.js`.
5. **Tick** — if time-based, extend tick handling in reducer via a tick action (not a panel effect).
6. **UI** — add or update a panel; register tab in `GameShell`.
7. **Save** — wire save-worthy fields (see **Save / persistence** below); bump `SAVE_VERSION` in `save.js` and add a migration when the persisted shape changes.

**Do not** ship a feature that only works while its tab is open.

---

## Save / persistence

Gameplay state in `initialState.js` is persisted automatically via `src/game/save.js` (`serializeState` / `deserializeState`, slot storage, text export/import, URL `?slot=N`, autosave). User prefs (theme, language) live in `src/settings/userPrefs.js` — **not** in the game save blob.

**Whenever you add new state that is save-worthy, wire it into the save system in the same change:**

1. Add the field to `initialState.js` (and handle it in the reducer).
2. Confirm it is included in persistence — by default every `initialState` key is saved except keys listed in `NON_PERSISTENT_KEYS` in `save.js`.
3. If the field is **UI-only or ephemeral** (active tab, transient dialog index, one-shot animations), add it to `NON_PERSISTENT_KEYS` instead of relying on it being absent from `initialState`.
4. Extend `validateGameplayState` in `save.js` if the new field needs type/shape checks beyond the defaults.
5. If the on-disk format changes, bump `SAVE_VERSION` and add a migration in `save.js`.

**Save-worthy** means progression the player expects to keep across refresh, slot load, and text export: currencies, unlocks, equipment, quest progress, merchant state, HP, etc.

**Do not** store save-worthy progression only in React `useState`, `sessionStorage`, or panel-local state. **Do not** ship new progression fields without verifying they round-trip through save → load (and migration, if applicable).

---

## Panel contract

Every panel must:

- Use `useGame()` for `state` and `dispatch`
- Call `dispatch({ type, ... })` for player actions
- Use pure selectors/helpers from `src/game/` for displayed derived values
- Avoid: `useState` for progression, `useEffect` for game loops, inline formulas, fetching game rules from props

`GameShell` may pass only UI props (e.g. `activeTab`, layout). Not game state blobs that duplicate the store.

---

## Target folder layout
src/ App.jsx main.jsx index.css context/ GameContext.jsx hooks/ useGameTick.js useSaveGame.js game/ initialState.js actions.js reducer.js formulas.js farm.js merchant.js quest.js … components/ GameShell.jsx TabBar.jsx panels/ FarmPanel.jsx InventoryPanel.jsx QuestPanel.jsx …


One file per major **system** in `src/game/`; one panel per major **tab** in `panels/`.

---

## Conventions

- Tone: dry humor, text-heavy, incremental (Candy Box style).
- Small, focused changes; no drive-by refactors.
- Match existing naming once established; when refactoring toward this doc, prefer the layout above.

### ASCII art

- Each drawing lives in its own file under `src/components/ascii/` (PascalCase name ending in `Art.js`, e.g. `LollipopArt.js`).
- Export one constant per file (e.g. `LOLLIPOP_ART`).
- **No blank lines inside the drawing.** Rows in the template literal must be consecutive; only a single blank line after an optional title line is allowed.
- Escape backticks and backslashes in template literals when the art uses those characters.
- Render in `<pre>` with monospace styling. Do not break ASCII art with extra JSX whitespace, blank template lines, or CSS that inserts space between rows.
- Do not embed user-facing titles or labels in ASCII art files; use i18n keys in the UI instead.

### Internationalization (i18n)

- Use **i18next** + **react-i18next** (`useTranslation`, `Trans`) for all player-facing text.
- Store English strings in `src/i18n/locales/en.json`; add new locale files when translating.
- Do not hardcode UI copy in components, panels, or merchant definitions — use translation keys (e.g. `nameKey` in `merchant.js`, `labelKey` in tab config).
- Game logic in `src/game/` must not import React or i18n; pass keys through and translate at the UI layer.

### Comments (strict)

- **Do not add comments by default.** Code should be self-explanatory through naming and structure.
- **No file-header or top-of-file comments** (no module summaries, no “this file does…” blocks).
- **No agent-style comments** that narrate the approach, restate what the code obviously does, or document changes for the reader (“we eat all candies here”, “increases max HP”, etc.).
- **Only** add a short inline comment when a mechanism is genuinely non-obvious and cannot be clarified by a better name or a small extracted function — rare in this codebase.
- When in doubt, leave it uncommented.

---

## Anti-patterns (reject in review)

- Explanatory, narrative, or file-header comments (see **Comments** above)
- React Router for farm / shop / quest / inventory tabs
- `useGameTick` or currency `useState` inside a panel
- Game rules duplicated in JSX and reducer
- Tab visibility gating tick dispatch (“only tick farm when on farm tab”)
- `import React` in `src/game/`
- God files mixing reducer, UI, and formulas
- Adding Redux, a game engine, or TypeScript without explicit request
- Hardcoded player-facing strings in JSX instead of i18n translation keys
- New `initialState` progression fields not wired through `save.js` (missing validation, wrong `NON_PERSISTENT_KEYS`, or no migration after a format change)

---

## Agent behavior

- Do not add comments unless the **Comments** rules above allow it.
- Read `initialState.js`, `actions.js`, `reducer.js`, and `save.js` before changing gameplay state or persistence.
- Implement toward **this** structure; migrate misplaced logic (e.g. tick in a panel) toward the layers above.
- When the repo conflicts with these rules, **follow the rules** and say what was moved if restructuring.
- State why before adding any dependency.