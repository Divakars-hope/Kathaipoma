# AUREVA — Women's Health AI

A private, anonymous, bilingual (English / தமிழ்) health awareness and
**preliminary screening** companion — not a diagnosis tool, not a hospital.
Built as an installable Progressive Web App so it keeps working on a weak
rural connection.

> ⚠️ **Scope note, read before presenting this as finished:** this repo is a
> real, working frontend implementing the structure, screening logic,
> bilingual content, TTS, and offline-first PWA shell described in the brief.
> It does **not** include illustrations/video assets, a live government
> hospital directory, or a backend — see "What's intentionally left out"
> below. The medical questionnaires and scoring here are for awareness
> purposes only and must be reviewed by a qualified clinician before any
> public or competition use.

---

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

No `.env`, no API keys, no backend required — everything runs client-side.

---

## What's here

- **Landing page** — hero, trust messaging ("no name, no phone number, no
  account"), language toggle, three screening module cards.
- **Screening flow** (`/screening/:moduleId`) — consent gate → one question
  at a time → progress bar → 🔊 listen-in-English / listen-in-Tamil on every
  question (browser `SpeechSynthesis` API, no server round trip) → results.
- **Results page** — health-awareness score, risk meter, diet / exercise /
  lifestyle recommendations, emergency warning card when a high-risk answer
  is chosen, downloadable PDF summary.
- **Education mode** (`/education`) — plain-language + medical explanation,
  myth vs. truth, "when to see a doctor," and emergency symptoms, per
  condition, fully bilingual with TTS.
- **About & Privacy** — the no-login/no-tracking commitments, spelled out.
- **Floating ♀ background** — ambient, CSS-only, respects
  `prefers-reduced-motion`.
- **AUREVA AI** — a small dismissible assistant bubble that greets and
  explains, with its own listen button.
- Installable **PWA**: manifest, offline app-shell caching via Workbox
  (`vite-plugin-pwa`), so the screening still loads with a flaky connection.

### Screening modules included
Breast cancer awareness, PCOS, and menopause — each with a doctor-reviewable
question bank (see below), transparent additive risk scoring, and bilingual
recommendations.

---

## Editing the question bank

Every question, option, and score lives in one plain, typed file:
`src/data/questions.ts`. A clinician or domain expert can add/reword
questions or change scoring **without touching any component code** — the UI
renders whatever is in that file. Recommendations text lives in
`src/data/recommendations.ts`, and the scoring thresholds (low / moderate /
high) live in `src/data/riskEngine.ts`.

The scoring is a simple, transparent additive model, **not a diagnostic
algorithm**. Its only job is to sort answers into an awareness bucket and
decide whether to show the "please see a doctor" messaging. Have every
question, score, and threshold reviewed by a qualified clinician before
using this with real users.

---

## Adding a language / editing translations

UI strings live in `src/i18n/locales/en.json` and `src/i18n/locales/ta.json`
(`react-i18next`). Question text and recommendation text are bilingual
fields directly inside `src/data/*.ts` (`textEn` / `textTa`, etc.) rather
than the i18n files, since they're structured data, not UI chrome.

To add a third language: duplicate `ta.json`, register it in
`src/i18n/index.ts`, add a button to `src/components/LanguageToggle.tsx`,
and add the matching `*En/*Ta`-style fields (rename the pattern) in the data
files.

---

## Deployment

### GitHub Pages
A workflow at `.github/workflows/deploy.yml` builds and deploys `dist/` to
GitHub Pages automatically on every push to `main`. In your repo settings,
set **Settings → Pages → Source → GitHub Actions**.

If this repo is *not* deployed at the domain root (i.e. it's a project page
like `username.github.io/aureva`), set the Vite base path before
building:

```ts
// vite.config.ts
export default defineConfig({
  base: '/aureva/', // your repo name
  // ...
})
```

### Vercel
`vercel.json` is included (build command, output dir, SPA rewrite). Import
the repo at vercel.com — no configuration needed beyond that.

### Local / offline
`npm run build && npm run preview` serves the production build locally; the
PWA still installs and works offline once loaded once.

---

## Privacy & data

- No login, no accounts, no passwords.
- No name, phone number, or identity is ever collected.
- Screening answers stay in memory for the current session only (passed via
  in-app navigation state) — nothing is written to `localStorage`,
  `sessionStorage`, or a server by default.
- No tracking cookies, no ads, no data sale.
- If you later add anonymous analytics to improve the question bank, surface
  that clearly on the consent screen (`src/components/ConsentGate.tsx`)
  before collecting anything — the current copy already states this intent
  but no analytics call is wired up.

---

## What's intentionally left out (and why)

These are things a human designer/clinician/ops team needs to add — they
can't be responsibly auto-generated:

- **Illustrations, photography, and videos.** Placeholder-free design was
  used instead (typography, color, motion, glassmorphism) so nothing here
  is a stand-in stock image. Commission or source licensed illustrations
  for the hero and Education mode.
- **A real nearby-hospital / government facility finder.** This needs a
  live, maintained data source (e.g. a government open-data API or a
  manually curated list) — it isn't safe to invent one.
- **A doctor-configurable question bank UI.** The question bank is already
  decoupled into a single typed data file that a non-engineer can edit in a
  text editor or via a pull request; a full no-code admin UI would need a
  backend and auth, which conflicts with the "no accounts" privacy stance
  unless scoped very carefully to clinician staff only.
- **Voice input (speech-to-text answers).** TTS (reading questions aloud) is
  implemented; STT was left out because reliable Tamil speech recognition
  in-browser is inconsistent across devices — worth a dedicated pass with
  real device testing before shipping.
- **Cervical cancer, pregnancy/postpartum modules, menstrual tracker.** The
  architecture (`src/data/questions.ts`, `ModuleId` type) is built to make
  adding another module a data-only change — add a new entry to `MODULES`
  and `MODULE_LIST` and it appears everywhere automatically.
- **A backend.** Everything currently runs client-side by design (fastest
  path to a genuinely private, no-login tool). If you later want aggregate,
  fully anonymous analytics to improve the question bank, that's a
  deliberate, separate decision — don't wire it up silently.

---

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · React Router ·
React Hook Form + Zod · react-i18next · Web `SpeechSynthesis` API ·
`vite-plugin-pwa` (Workbox) · jsPDF · Lucide icons.

## Disclaimer

AUREVA provides health **awareness and preliminary screening only**. It
is not a medical device and does not diagnose disease. Anyone using it
should be encouraged to consult a qualified doctor for actual diagnosis and
treatment — this is reinforced throughout the UI (emergency warning card,
results disclaimer, footer on every page).
