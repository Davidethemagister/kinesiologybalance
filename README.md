# Kinesio Session

A single-panel, adaptive session-tracking tool for an Applied Kinesiology practitioner. Built to be used live, one-handed, during hands-on client sessions — there is no locked linear "wizard" flow; the practitioner can jump between the six panels (Pre-Checks, Goal, Integration, Pot Creation, Closing, Intervention) at any point.

Pre-Checks supports repeating the standard test set in multiple rounds (e.g. if the body calls for a retest) — each round is kept separate, past rounds are read-only, and nothing is overwritten. A Settings tab (gear icon, top right) lets each practitioner toggle individual Pre-Check and Integration-affirmation items on/off to match their own protocol; this is saved to the browser's `localStorage`.

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Local React state (`useReducer` + Context) for all session data — no backend yet. The state shape (`src/context/SessionContext.tsx`) is structured so it can later be persisted to `localStorage` or synced to Supabase without a redesign.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To type-check and build for production:

```bash
npm run build
```

## Project structure

```
src/
  types/       Shared TypeScript types for the whole session data model
  data/        Static reference data (pre-check names, Five Element emotion chart, affirmations, pot branches)
  context/     SessionContext (app-wide session state via useReducer) and SettingsContext (per-device voice toggles, persisted to localStorage)
  components/  Shared UI: EmotionChart (drill-down modal), StrongWeakToggle, Modal, EmptyGoalState
  panels/      The six top-level panels (PreChecks, Goal, Integration, PotCreation, Closing, Intervention) plus Settings
```

## Design notes

- Background `#FFFEF8`, primary accent (sage) `#A7D9DE`.
- Five Element colors (Wood/Fire/Earth/Metal/Water) are scoped to the Emotion Chart only — they are not used as the app's global palette.
- Large, thumb-friendly tap targets throughout since this is used one-handed, live, during a session.

## Data verification flags

A few emotion-word entries transcribed from the source material were unclear or partially illegible. These are marked with `// VERIFY:` comments in `src/data/organCategories.ts` — search that file for `VERIFY` and confirm/correct the wording before relying on it clinically.

## Next steps

- **Supabase integration**: wire `SessionContext` up to Supabase (auth-free for now, or with practitioner auth) so sessions persist across reloads and devices. The reducer/state shape maps cleanly onto tables per panel (pre_checks, goals, integration_checks, pot_creations, closings).
- **Nutrition module**: Panel 4's "Nutrition" sub-branch is currently a "Coming soon" placeholder. It will eventually become its own multi-page nutrition decision tree, built as a separate module.
- **Deployment to Vercel**: no deployment config has been added yet. The app is a standard Vite SPA (`npm run build` outputs static assets to `dist/`), so it should deploy to Vercel with zero extra configuration — just connect the repo and use the Vite framework preset.
