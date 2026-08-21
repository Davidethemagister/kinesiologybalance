# Kinesio Session

A single-panel, adaptive session-tracking tool for an Applied Kinesiology practitioner. Built to be used live, one-handed, during hands-on client sessions — there is no locked linear "wizard" flow; the practitioner can jump between the six panels (Pre-Checks, Goal, Integration, Pot Creation, Closing, Intervention) at any point.

Pre-Checks supports repeating the standard test set in multiple rounds (e.g. if the body calls for a retest) — each round is kept separate, past rounds are read-only, and nothing is overwritten. A Settings tab (gear icon, top right) lets each practitioner toggle individual Pre-Check and Integration-affirmation items on/off to match their own protocol; this is saved to the browser's `localStorage`.

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- **Local-only storage** via [Dexie](https://dexie.org/) (IndexedDB), no backend, no login. This app runs for one practitioner on one device — client and session data never leaves the browser it's used in. There's no cloud copy, so use the **Backup** / **Restore** buttons on the Clients screen periodically (exports/imports the whole local database as one JSON file).
- In-panel state during a session lives in a local `useReducer` (`src/context/SessionContext.tsx`), backend-agnostic by design — it's mirrored to Dexie by `src/lib/sessionSync.ts` on change and rehydrated by `src/lib/loadSession.ts` when a session is reopened.

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
  lib/         db.ts (Dexie schema), clients.ts (client/session CRUD), loadSession.ts / sessionSync.ts (load & save a session's panel data), dataExport.ts (per-client export + whole-database backup/restore)
  context/     ClientsContext (client list + session records), SessionContext (in-session panel state via useReducer), SettingsContext (per-device voice toggles, persisted to localStorage)
  views/       ClientListView, ClientDetailView — the screens before entering a session
  components/  Shared UI: EmotionChart (drill-down modal), StrongWeakToggle, Modal, EmptyGoalState, ClientFormModal
  panels/      The six top-level panels (PreChecks, Goal, Integration, PotCreation, Closing, Intervention) plus Settings
```

## Design notes

- Background `#FFFEF8`, primary accent (sage) `#A7D9DE`.
- Five Element colors (Wood/Fire/Earth/Metal/Water) are scoped to the Emotion Chart only — they are not used as the app's global palette.
- Large, thumb-friendly tap targets throughout since this is used one-handed, live, during a session.

## Data verification flags

A few emotion-word entries transcribed from the source material were unclear or partially illegible. These are marked with `// VERIFY:` comments in `src/data/organCategories.ts` — search that file for `VERIFY` and confirm/correct the wording before relying on it clinically.

## Next steps

- **Nutrition module**: Panel 4's "Nutrition" sub-branch is currently a "Coming soon" placeholder. It will eventually become its own multi-page nutrition decision tree, built as a separate module.
- **Deployment**: no deployment config has been added yet. The app is a standard Vite SPA (`npm run build` outputs static assets to `dist/`) — deployable anywhere that serves static files. Since storage is entirely local to the browser, whichever device/browser it's opened in is where its data lives; there's no server-side component to deploy.
- **Selling to other practitioners later**: if this ever needs to support multiple practitioners (not just one local device), the pieces are kept swappable on purpose — `SessionContext` doesn't know about storage at all, and the Supabase-specific version of `src/lib/{clients,loadSession,sessionSync}.ts` this app used previously (real auth, hosted Postgres, RLS scoped per practitioner) is recoverable from git history if that point is reached. `src/lib/db.ts`'s `PRACTITIONER_ID` constant is the one field a future multi-tenant setup would key ownership on.
