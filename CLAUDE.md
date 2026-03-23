# LucidGreen - Sustainable Investment Landing Page

## Project Overview
- **Site**: LucidGreen sustainable investment landing page
- **Deployment**: Netlify at transparentinvestment.netlify.app
- **Language**: French — all visible text uses proper French accents (é, è, ê, à, â, ç, etc.)

## Two Codebases

### 1. Legacy static site (`site/` → root)
- **Stack**: Vanilla HTML / CSS / JS (no frameworks)
- **Currently deployed** on Netlify from root files

```
site/                ← Source directory (edit here)
  index.html          ← Main HTML (~970 lines)
  styles.css          ← Main stylesheet (~3400+ lines)
  main.js             ← Main JavaScript (~1080+ lines)
index.html            ← Root copy (synced from site/ for Netlify)
styles.css            ← Root copy
main.js               ← Root copy
```

### 2. Next.js frontend (`frontend/`)
- **Stack**: Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS 4 / shadcn/ui 4
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **App Router** with `src/app/` structure

```
frontend/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
    components/
      ui/
        animated-hero.tsx
        button.tsx
    lib/
  package.json
  next.config.ts
  tsconfig.json
  postcss.config.mjs
  components.json       ← shadcn config
```

## Deployment Workflow (legacy site)
1. Edit files in `site/`
2. Copy to root: `cp site/index.html index.html && cp site/styles.css styles.css && cp site/main.js main.js`
3. Git add, commit, push → Netlify auto-deploys from root

## Frontend Dev (Next.js)
- `cd frontend && npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Git Conventions
- **Commit messages**: French, no co-author line
- **SSH key**: Run `ssh-add ~/.ssh/sshkey` before push if needed
- **Branch**: main

## Important CSS/HTML Rules
- **HTML IDs must stay ASCII** (no accents): `id="problematique"`, `id="methodologie"`, `id="equipe"`
- **href anchors must stay ASCII**: `href="#problematique"`, etc.
- **CSS class names must stay ASCII**
- **Display text** (nav links, headings, aria-labels, paragraphs) must use proper French accents

## Key Visual Effects

### Glowing Border Effect (conic-gradient)
- Uses `mask-composite: subtract` / `-webkit-mask-composite: source-out`
- Two mask layers: conic gradient (border-box) + opaque (padding-box)
- The subtract formula `αa × (1 - αb)` reveals glow only in the border area
- Color palette: green (`#34d399`, `#10b981`, `#059669`, `#6ee7b7`)
- Angle tracks pointer via `Math.atan2` in JS setting `--glow-start`
- Cards with `overflow: hidden` require `inset: 0` (not negative inset)
- `background-attachment: fixed` must NOT be used (breaks with CSS transforms)
- Scroll handler shares `updateCards()` with pointermove using stored `lastMx`/`lastMy`

### Other Effects
- Full-page sparkles via `position: fixed` canvas
- Liquid glass: `backdrop-filter: blur() saturate()`
- CSS custom properties driven by JS for animations

## Common Pitfalls
- Always sync `site/` → root after edits, before commit
- Never use `mask-composite: intersect` with transparent first layer (renders invisible)
- `.feature` and `.fund-card` have `overflow: hidden` — pseudo-elements must not extend beyond
- When running scripts, ensure working directory targets `site/` not root
- Avoid force-push unless necessary; prefer `--force-with-lease`
