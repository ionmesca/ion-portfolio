# DESIGN.md — the rebuilt system

The working map of what exists on `rebuild/v2` today. It is written for agents
and engineers picking the codebase up cold: where authority lives, what the
tokens are for, how motion is built, what every component is, and which traps
have already been paid for.

It is a map, not a specification. It restates no token value — values rot when
copied. Every section points at the file that owns the thing.

Superseded: this file previously described the pre-rebuild landing system
(`components/portfolio/*`, a gray-app-surface shell, a provisional orange
accent, an 8px radius ladder). None of that exists. It survives in git history.

---

## 1. Source of truth

### The hierarchy

1. **`app/globals.css`** — the ratified token contract. The actual values, in
   eight numbered sections: fonts, light values, dark values, the Tailwind v4
   `@theme inline` mapping, base layer, component utilities, scrollbar, reduced
   motion.
2. **`docs/design/token-contract.md`** — what each token means, which were
   deleted, and where CSS and Figma cannot mirror each other.
3. **`docs/design/*.html`** — the interaction labs. Behaviour is verified
   against these, and ported constants cite their line numbers.
   - `motion-lab.html` — the recipe catalog (icon swap, press, copy→check).
   - `popover-lab.html` — the container morph and the hover corridor.
   - `mobile-lab.html` — the mobile scroll controller, Option B.
   - `collection-lab.html` — the collection row rulebook.
   - `wheel-prototype.html` — the wheel physics, variant `calm`.
   - `motion-system-spec.md` — the seven motion principles, in prose.
4. **`docs/design/reference/*.png`** — Figma exports. Screens are verified
   against these.

### The law: values ratified, behaviour editable

A **value** in `globals.css` — a colour, a radius, a shadow layer, a type step,
a duration — is ratified. It does not change without a ruling from Ion. Only a
crew whose brief explicitly grants `globals.css` may edit it; everyone else
flags the need.

**Behaviour** is editable under review: how a surface moves, when a preview
opens, which spring a control rides. The constants those behaviours use still
come off the shelves (`lib/motion.ts`, `lib/morph-preview.ts`,
`lib/wheel-engine.ts`), never out of a component.

The practical rule: a raw `400` or a raw `#hex` inside a component is a bug.
The shelves exist to stop it.

### Provenance style

Ported constants carry their source in a comment — the lab file and line, the
Figma node id, or the measurement that decided them. Aliases (`SPRING_PRESS =
SPRING_CELL`) are kept as the *record of a decision*, not collapsed. When you
port a number, port the reason with it.

---

## 2. Tokens

Values: `app/globals.css`. Semantics: `docs/design/token-contract.md`.
Specimen page: `/dev` (`app/dev/page.tsx`) renders every step in both themes.

| Family | Shape | Owner |
|---|---|---|
| Colour | shadcn **stone** ramp — the 19 standard semantic roles, plus 7 project roles | globals.css §2 (light), §3 (dark) |
| Radius | one knob `--radius`, 8 derived steps (`sm`…`4xl`, `full`) | globals.css §2, §4 |
| Shadow | 4 elevation steps: subtle / raised / overlay / modal | globals.css §2, §3 |
| Type | 7 steps, Aeonik Pro | globals.css §4 |
| Motion | 2 easings, 3 durations, 2 stagger units, 2 blur garnishes | globals.css §2 |
| Spacing | **no tokens** — Tailwind defaults, canonical subset is a convention | token-contract.md 3.8 |
| Icons | system facts, not CSS | `lib/icons.ts`, token-contract.md 3.9 |

**Colour.** There is no brand accent. `--accent` is stone-100 (light) /
stone-800 (dark) — neutral by ruling. The 7 project roles beyond shadcn's 19
are `--primary-hover`, `--secondary-hover`, `--ghost-hover`,
`--primary-foreground-muted`, `--status-available`, `--scrim`,
`--kbd-foreground`. Asset colour — the Ledgy purple in `project-icon.tsx`, the
filled GitHub/X/LinkedIn glyphs — is deliberately *not* a token and is not
expected in globals.css.

**Radius.** Every step is `calc(var(--radius) * n)`. Concentric radii inside a
token step (a 32px avatar at 10px inside a 15px chip, a 24px icon at 8px inside
a 12px row) stay raw on purpose: writing them as tokens breaks the concentric
relationship. Those raw values are documented at their call sites.

**Shadow.** Each step is five layers: four black shadow layers on a
`y > blur` layered-smooth formula, plus a constant 1px hairline ring. Dark mode
keeps the four black layers and flips only the ring. Both the semantic names
(`shadow-subtle` … `shadow-modal`) and Tailwind's own scale (`shadow-2xs` …
`shadow-2xl`) resolve to the same four steps.

**Type.** Seven steps. Five ride Tailwind's own slots (`text-xs`, `text-sm`,
`text-base`, `text-lg`, `text-2xl`); two are custom (`text-small` 13,
`text-subhead` 15). Every step carries its own line-height, weight and
letter-spacing, so a step is one class and never a stack of them. Aeonik Pro is
loaded through `next/font/local` in `app/layout.tsx` — never re-declare
`@font-face` in CSS.

**Motion tokens.** `--motion-spring` (overshoot: press, pop) and
`--motion-glide` (strong decel: panels, reveals), re-exported as the
`ease-spring` / `ease-glide` utilities. `--duration-fast` / `-base` / `-slow`.
`--stagger-delay` (one row) and `--stagger-group` (half a unit, for groups).
`--blur-garnish` and the deeper `--blur-icon` for the icon-swap recipe. The
durations live in `:root` and not in `@theme` because Tailwind v4 has no
`--duration-*` namespace and `@theme inline` prunes unreferenced variables.

---

## 3. Motion

Principles: `docs/design/motion-system-spec.md`. Constants: `lib/motion.ts`.
Ruling of record: CLAUDE.md, 2026-08-18.

### The spring shelf — `lib/motion.ts`

Three families, lifted from interior.dev's snap-carousel registry payload
(reference only; it never entered the build path):

- `SPRING_CELL` — the **readout** spring. Snaps and settles.
- `SPRING_CROSSFADE` — the **content** spring. Slower, for text that swaps.
- `SPRING_WALL` — recorded, currently unused. Nothing here rubber-bands.

`SPRING_PRESS` and `SPRING_POP` are aliases of `SPRING_CELL`. The aliases exist
so the *argument* for reusing it survives: a button press and a hover-preview
card are both readouts — they answer a question and get out of the way — and
CELL lands on the ratified duration ladder where CROSSFADE does not.

### The duration ladder, twice

`globals.css` owns the ladder; `lib/motion.ts` mirrors it as `D_FAST`,
`D_BASE`, `D_SLOW`. The duplication is deliberate: a custom property cannot be
read synchronously, and `getComputedStyle` inside a rAF tick or a pointer
handler forces an unbudgeted style recalculation. **Those three constants are
the only place JS may spell those numbers.** Derived timings on the shelf —
`SWAP_EXIT_MS` (95% of CELL's travel), `ENTRANCE_TEARDOWN` (`D_SLOW + 300`),
`REDUCED_CROSSFADE` (seconds, for the motion package) — are written as
expressions off the ladder, not as literals.

### The rAF integrator vs the `motion` package

The `motion` package is sanctioned for **micro-interactions only**, and only
behind a *proven* split point: `LazyMotion` + `m.` components, `strict` on, and
the feature bundle reached through a dynamic `import()`.

- `components/ui/motion-provider.tsx` — the only place the runtime is switched
  on. `features` is a function, so the engine is fetched after hydration.
- `components/ui/motion-features.ts` — `domAnimation` alone in its own module,
  purely so the bundler has an edge to split on. **Import it statically from
  anywhere and the guarantee is gone.**
- `components/landing/mobile/mobile-indicator-lazy.tsx` — the one proven split
  point on the site: `next/dynamic` behind a mobile gate, so the chunk never
  reaches the desktop landing route.

Everything else uses **`createSpring`** in `lib/motion.ts` — the same constants,
our own integrator. Semi-implicit (symplectic) Euler on a fixed 1/240s
sub-step, with a `SPRING_MAX_FRAME` ceiling that discards anything longer than
four frames rather than integrating a gap. **Velocity is never reset on
`set()`** — that is the whole point: a reversal carries its speed through
instead of restarting from a standstill, which a CSS transition cannot do.
`snap()` is the reduced-motion, first-paint and unmount-safe path.

`useSpringStyle` returns a **callback ref**, writes `element.style` directly and
re-renders nothing. The first target is always snapped: a control must not
animate into existence on mount.

Measured cost of pulling `motion/react` into a desktop-critical route: ~41–43KB
gzipped. The rAF path costs ~3KB gz at most. That is the whole reason the
escape hatch exists.

### The channel pattern

A JS-driven visual is one JS-owned `0 → 1` number written to a custom property;
every visual lane is derived from it in CSS. Lanes cannot then desynchronise
from each other or from an interruption.

| Channel | Owner | Reader |
|---|---|---|
| `--morph-p` | `lib/morph.ts` | `.palette-surface`, `.hover-pop` in globals.css §6 |
| `--pop-p` (`POP_CHANNEL`) | `lib/motion.ts` spring | `.hover-pop-inner` |
| `--swap-p` (`SWAP_CHANNEL`) | `lib/motion.ts` spring | `.icon-swap`, `.label-swap` |

### The big vanilla systems

These stay hand-written. Do not rewrite them onto the motion package.

- **⌘K zero-jump morph** — `components/landing/command-palette.tsx` on
  `lib/morph.ts`. The identity chip *is* the palette: one surface, absolutely
  positioned inside a slot that holds its place in flow, so growing it never
  reflows the page. The avatar, name and keycap exist once and are placed once,
  measured from the live DOM. A FLIP container on one rAF lerp with a JS bezier
  solver (a CSS timing function cannot be sampled from script), 400ms
  symmetric, no scrim. 400 and not the preview family's 200 because duration
  scales with the distance the surface travels.
- **Landing document-scroll wheel** — `components/landing/use-wheel.ts` with
  `components/landing/media-column.tsx`. The panel stack *is* the input:
  nothing is hijacked, no wheel listener, no `preventDefault`. Selection is read
  off the document scroll.
- **Section wheel** — `components/nav/section-rail.tsx` on
  `lib/wheel-engine.ts`, which carries the shared physics (`WHEEL`, `LENS`,
  `lensOpacity` / `lensTransform` / `lensBlur` / `lensFill`, `smoothstep`,
  `documentTop`). Same physics as the home wheel by ruling.
- **Hover-preview engine** — `lib/morph-preview.ts` (+ `lib/morph.ts`). One
  container morphing anchor-to-anchor, an intent/grace pointer corridor, a
  desktop gate, and a reduced-motion mode. Three consumers share it:
  `components/collections/preview-popover.tsx`,
  `components/landing/social-previews.tsx`,
  `components/landing/ledgy-preview.tsx`.
- **Hover token ladder** — plain CSS. Hover states **snap in (0ms) and ease out
  (150ms)**, done by zeroing `transition-duration` on `:hover` so only the
  out-transition reads from the base rule. `components/ui/button.tsx` refines
  this: the duration is a four-value list matched 1:1 to the property list, so
  the colour lanes snap while `scale` keeps its spring in both directions.

### Reduced motion

`globals.css` §8 collapses every CSS animation and transition to `0.01ms`.
JS-driven motion must make the same promise itself — call
`prefersReducedMotion()` and `snap()`. Read it per `set`, never cache it: the
OS setting can change while the page is open.

---

## 4. Component inventory

### `components/ui/` — primitives

| File | What |
|---|---|
| `button.tsx` | The button primitive. CVA variants, the hover-snap duration list, `active:scale-[0.97]` as the no-JS fallback. |
| `sheet.tsx` | Radix Dialog restyled onto the tokens (the shipped shadcn file's raw values are all gone). The mobile menu's bottom sheet. |
| `kbd.tsx` | Inline keycap. `muted` fill, `kbd-foreground` label, `rounded-sm`. |
| `icon-swap.tsx` | The catalog's icon-swap recipe as one element: two glyphs stacked, scale .6↔1 + blur crossfade, driven off `--swap-p`. |
| `press-spring.tsx` | Puts a control's press and release on `SPRING_PRESS` via `createSpring`. |
| `text-effect.tsx` | The hero resolving out of blur, unit by unit. A rebuild of motion-primitives' `TextEffect`, not an import — the original pulls `motion/react` onto `/`. |
| `motion-provider.tsx` | `LazyMotion`, strict, features-as-function. |
| `motion-features.ts` | `domAnimation`, isolated so it splits. |

### `components/landing/`

Desktop rail and media column, plus the shared data.

- `command-palette.tsx` — the ⌘K morph palette (see §3). Hover opens it on the
  preview family's own corridor. The lean panel: no search row, no group
  caption rows, no footer hint bar.
- `palette-items.tsx` — the palette's rows, in Figma order.
- `identity-chip.tsx` — **frozen geometry.** The morph grows out of this chip,
  so its internal offsets cannot move.
- `intro.tsx` — headline, subline, actions row.
- `intro-reveal.tsx` — the landing's entrance choreography (`Reveal`,
  `useIntroReveal`, `INTRO_DELAY`, `INTRO_ROW_STEP`). Groups: chip 0 → hero 50
  → actions 100 → rows 150 (+25 each) → media 250, finished inside 400ms.
- `project-list.tsx` / `project-icon.tsx` — the rail's rows and their marks.
  Hover is a *layer*, not the row: the row's own opacity and transform are
  written per frame by the wheel and must not be caught by a transition.
- `media-column.tsx` — the panel stack the document scrolls through.
- `use-wheel.ts` — the wheel physics controller.
- `active-project.tsx` — the shared selection index, in a provider because the
  list and the panels live in different columns.
- `social-previews.tsx`, `ledgy-preview.tsx`, `socials.ts`, `brand-glyphs.tsx`
  — the social cluster and its hover previews. Brand glyphs are filled marks,
  deliberately outside `lib/icons.ts`.
- `theme-segment.tsx`, `sound-segment.tsx` — the Preferences controls. Siblings,
  not a shared generic: `ThemeSegment` closes over its own options, value type,
  track width and label, and it is ratified. The *language* is reused.

### `components/landing/mobile/`

- `mobile-landing.tsx` — the whole mobile tree: sticky top bar, the absent-at-
  rest indicator, hero, one card per project, footer. **The cards are the page.**
- `use-mobile-scroll.ts` — the controller. Native scroll is the only input
  (Option B, "scroll as control"). `ACTIVE_LINE` 0.40 matches the desktop wheel.
- `mobile-indicator.tsx` / `mobile-indicator-lazy.tsx` — the sticky indicator
  and its code split. The bar's own arrive/leave stays in CSS; the three moving
  parts inside it ride the Motion springs.
- `progress-channel.ts` — a ref mailbox between the controller and the split
  indicator, so progress can be published before its consumer exists.
- `mobile-menu.tsx` — the bottom-sheet menu.

### `components/collections/`

- `collection-shell.tsx` — the chassis. `RailShell` plus the collections' one
  difference from the letter: a 16px narrow-screen gutter, not 24.
- `collection-list.tsx` — the 640 column: title block, grouped rows, footer
  caption. Exports `CollectionList` and `ArticleList`.
- `collection-row.tsx` — the row (see §5). Exports `CollectionRow` and
  `ArticleRow`.
- `preview-popover.tsx` — the hover preview's collection-specific faces on the
  shared engine.
- `install-chip.tsx` — the one place a row holds a click target that is not the
  row. Those rows have no `href`, and the chip stops the click.

### `components/nav/`

- `rail-shell.tsx` — one grid, four pages (about + three collections).
- `section-rail.tsx` — the back button and the conditional section wheel.

### `components/letter/`

- `prose.tsx` — the reading column's renderers (`TitleBlock`, `Section`,
  `Photo`, `PhotoRow`, `Footnote`, `Signature`). Server Components. Every type
  step maps onto the contract; there is not one arbitrary font size in it.

### `lib/`

| File | What |
|---|---|
| `motion.ts` | The spring shelf, the JS duration ladder, `createSpring`, `useSpringStyle`. |
| `morph.ts` | The container FLIP engine + the JS cubic-bezier solver + `GLIDE`. |
| `morph-preview.ts` | The hover-preview engine: media gate, placement solver, hover corridor, morph controller. |
| `wheel-engine.ts` | Wheel physics shared by both wheels. |
| `utils.ts` | `cn`, with the custom token groups registered on tailwind-merge (see §6). |
| `icons.ts` | The lucide barrel and the icon convention. |
| `theme.ts` | Hand-rolled light/dark/system. No `next-themes`. Exports the blocking `THEME_INIT_SCRIPT`. |
| `sound.ts` | One synthesised tick, no assets. Commit actions only, desktop only, optional. |
| `use-copy.ts` | Clipboard + the tick's only call site. |
| `projects.ts`, `articles.ts`, `article-slug.ts`, `types.ts` | Data and the file-based article index (server only). |

### shadcn policy

`components.json` is configured (`new-york`, RSC, lucide). Its `baseColor` is
still `zinc` while the ratified palette is **stone**, so a fresh pull's
generated CSS variables will not match — take the component, drop the
variables. Extend primitives
through semantic tokens and variants; do not fork `components/ui/` upstream
files beyond retheming. Most shadcn primitives were **deleted** in the rebuild —
if you need one back, re-pull it with `bunx shadcn@latest add [name]` and
retheme it onto the tokens rather than writing it by hand. Expect a fresh pull
to arrive with raw values (`bg-black/50`, hardcoded durations, `border-t`);
`sheet.tsx` is the worked example of what converting one looks like.

---

## 5. Page anatomy

### Routes

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Landing. Desktop rail + media column; mobile tree below `lg`. |
| `/about` | `app/about/page.tsx` | The letter. Route and nav label are About; the prose is still a letter. |
| `/stack` | `app/stack/page.tsx` | Collection flavour 1 — tools, site previews. |
| `/agents` | `app/agents/page.tsx` | Collection flavour 2 — adds credit line, "How I use it", install chip. |
| `/writing` | `app/writing/page.tsx` | Collection flavour 3 — iconless rows, wheel of years. |
| `/writing/[slug]` | `app/writing/[slug]/page.tsx` | Article detail. The letter's chassis with one word changed. |
| `/dev` | `app/dev/page.tsx` | **Dev-only specimen. `noindex`, unlinked, delete before cutover.** |

**Routes were renamed on 2026-08-19 (Ion): Articles → Writing, Letter →
About — label AND route, because the site is pre-launch and an address that
disagrees with its menu is a thing to fix now rather than a redirect to keep
forever.** CODE NAMES DID NOT MOVE and are not meant to: `components/letter/`,
`content/letter.ts`, `content/articles/*.mdx` and `lib/articles.ts` still say
letter and articles. A directory is what the code calls a thing; a route is
what a reader is told it is called, and only the second one is a promise to
anybody outside the repo.

`app/layout.tsx` loads Aeonik through `next/font/local`, inlines the blocking
theme script (`suppressHydrationWarning` on `<html>` is deliberate and covers
exactly that one attribute), sets `metadataBase` to `https://ionmesca.com`, and
mounts Vercel Analytics + Speed Insights.

`app/template.tsx` adds `.page-enter` and removes it after
`ENTRANCE_TEARDOWN`. It is a **template and not a layout** because a layout's
DOM is reused across navigations and an entrance written there plays once. The
re-creation *is* the replay mechanism — there is no "have I played?" flag. The
landing is exempt and gets no wrapper at all: it has its own choreography
(`intro-reveal.tsx`), and its sticky rail and measured media column should not
have to reason about an extra element.

### Landing

Flat `background`; there is no shell or chassis behind it. At 1512 the frame
reads 164 gutter / 263 rail / 48 gap / right column / 24 gutter, top offset 136.
**The page scrolls and the rail does not.** The right column stacks two media
panels per project, so the document is long and the rail's selection is read off
the column's position — one project per pair of panels.

### About, collections, article detail — `RailShell`

One grid, four pages. At 1512: `164 │ 272 rail │ 640 reading │ 272 tail │ 164`.
The tail is empty; it is what keeps the reading column centred.

Above 1024 there is **one fluid range and no steps** — only whitespace moves:

```
left gutter = clamp(32px, (100vw − 912px) × 164 / 600, 164px)
```

912 is the fixed structure (272 rail + 640 text); 600 is the frame's slack;
164/600 is the left gutter's share of it. The right gutter uses the same
expression and the tail is `1fr`. **The reading column never gives** — it is 640
at every width. Below `lg` the grid collapses to one column, the wheel hides,
and the back button stays.

### The conditional wheel

`SectionRail` renders a destination-labelled back button (letter and
collections → Home; an article → its index) and, when it qualifies, the section
wheel.

The wheel qualifies only if the reading column is at least `WHEEL_MIN_RATIO`
(1.5) viewports tall. It is in the DOM from the server render and stays in
flow; only `opacity` changes, and the measurement runs in a **layout** effect so
a qualifying page never paints a frame in the wrong state. A wheel that has not
qualified is `inert` and `aria-hidden` — dropped in every sense a reader can
perceive — but keeps its 200px of rail column so the geometry cannot move.

### Row signatures

- **Collection row** — h48, radius `md`, pad-x 12, gap 12. Icon 20 (raw r6),
  name at `text-subhead`, one-liner at `text-base` muted and **truncating**,
  ↗ 16 muted at the far right. One line per item is a rule: a collection row
  never wraps and never grows. Everything else lives in the preview.
- **Article row** — the iconless flavour: title + date, grouped by year, with an
  excerpt-card preview.
- **Install chip** — pad 4/8, gap 6, `muted` fill, 1px `border`, `rounded-sm`.
  On Ion's own skills only.
- **Project row (landing)** — 24px mark at a raw concentric r8; the year renders
  only on the active row. Hover is ignored on the active row *physically*: the
  active fill is an opaque `muted` rectangle painted over the hover tint.

### Hover previews

Desktop pointer only, by ruling — there is no hover to intend with on touch, and
the media query also excludes narrow desktop windows where the card has nowhere
to go. The corridor is `INTENT` in / `GRACE` out; placement respects `GAP` and
`EDGE`; the anchor-to-anchor morph runs on `MORPH_MS`. All of those are
`lib/morph-preview.ts` constants, all carried from `popover-lab.html`.

### Content

`content/letter.ts`, `content/collections.ts`, `lib/projects.ts` are
**placeholder copy transcribed verbatim from the Figma frames.** Do not
"improve" it — Ion curates the real lists after the build. `content/articles/
*.mdx` is live: one file per slug, three frontmatter fields (`title`, quoted
`date`, `summary`), indexed at build time by `lib/articles.ts` and rendered
through `mdx-components.tsx` onto the letter's prose steps. `next.config.ts`
wires `@next/mdx` with `remark-frontmatter` only; articles are *imported*, not
routes, so `pageExtensions` is deliberately not extended.

`content/work/*.mdx` is pre-rebuild case-study content with **no route and no
importer**. Treat it as historical until a `/work` surface is ruled.

---

## 6. Working culture

### Verification is right-sized

This is a portfolio, not production. Verify what a visitor sees and feels:
build, lint, screenshots or frame strips of the surface you touched, plus
whatever single suite your brief names. No new test ceremony, no byte-identity
proofs, no deep a11y sweeps. No shortcuts on anything visible.

### Trap: the class-drop teardown

An entrance holds a `backwards` fill so late groups stay hidden through their
delay — and **a filling animation keeps its element a stacking context for as
long as it is applied.** A stacked project row paints over the open ⌘K panel; a
stacked reading column paints over the collections' hover previews. So the
animation classes come off once the show is over, at `ENTRANCE_TEARDOWN`. The
final frame is the settled page, so the drop is invisible.

That constant lives in `lib/motion.ts` and not next to either choreography, for
bytes: `app/template.tsx` is loaded by every route, and importing the constant
from `intro-reveal.tsx` dragged `cn` (clsx + tailwind-merge, ~8.6KB gz) onto
routes with no client JavaScript at all. A shared constant belongs in the leaf
both sides can reach.

### Trap: tailwind-merge and custom tokens

tailwind-merge classifies a bare class **by name**, and its guess for `x-word`
is usually "that is a colour" — which files the class in the wrong conflict
group, so merging silently keeps both. This has been paid for twice:

- `text-small` / `text-subhead` were read as text *colours*, so
  `cn("text-small", "text-kbd-foreground")` dropped the colour.
- The four elevation steps were read as shadow *colours*, so `shadow-none` — a
  shadow *size* — did not override them.

Both are fixed at the root in `lib/utils.ts`, which registers the custom groups
on `extendTailwindMerge`. **Any new custom token namespace must be registered
there**, or the trap re-springs in a new component.

### Trap: rAF under headless capture

The rAF clock stops when the page is not being rendered, and a headless capture
that reaches beyond the viewport fires a resize — either one snaps a morph
mid-flight and produces a frame that never happens in a real browser. Take
**viewport-only** captures. `createSpring`'s `SPRING_MAX_FRAME` guards the same
hazard from the other side: a tab that comes back after two seconds must not
integrate a two-second step.

### Trap: the motion bundle

Importing `motion/react` into a desktop-critical route costs ~41–43KB gz —
measured twice. `components/ui/motion-features.ts` is the only edge in the graph
that pulls the animation engine, and it is reached by dynamic `import()`. A
single static import of that module silently un-splits the bundle. If you add a
Motion consumer, prove the split point and report the first-load JS delta.

### Local rules

- `bun`, always. Work on `rebuild/v2`.
- Never touch `main` or another worktree. Never bind port 3000 — that is the
  live dev server. Verify against your own throwaway server on a throwaway port.
- Parallel crews share this worktree with disjoint file surfaces. On an
  `index.lock` failure, wait and retry. Never `rm -rf .next`.
