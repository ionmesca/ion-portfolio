# Token contract — portfolio design system v2

**Status: proposal, all five open questions now ratified. Nothing has been
applied. No file in the repo was touched.**

Two files came out of this:

| File | What it is |
|---|---|
| `globals.v2.css` | The complete proposed replacement for `app/globals.css`. It compiles. |
| `token-contract.md` | This briefing. |

---

## 1. The short version

The portfolio currently has **two colour systems fighting each other**: a
hand-rolled one (`bg-base`, `text-primary`, `border-subtle`) and the shadcn one
that every off-the-shelf component expects. v2 deletes the hand-rolled one and
keeps only shadcn's, using the **stone** palette — a warm grey. The orange
accent is gone.

Three things change that you will *see*, not just read about:

1. **Everything gets rounder.** The corner scale moves from 6/8/10/12/16/24px to
   9/12/15/21/27/33px. A standard card corner goes from 8px to 12px. This
   happens automatically the day the file lands, across the whole site.
2. **Shadows get much lighter.** Today's shadows are 40–60% black — they were
   written for a dark theme and never re-tuned for the white site. The new ones
   top out at 6%. Cards will look like they are resting on the page instead of
   bruising it.
3. **The orange goes away.** So does the purple/pink brand pair. Nothing on the
   site is accent-coloured any more except the availability dot, which becomes
   green.

**Cost to actually switch:** roughly **440 individual edits** across **~30
files**. Most are mechanical find-and-replace. Details in section 4.

---

## 2. The five decisions — all ratified

All five are closed. Nothing here is waiting on you any more. Kept in the
document as a record of what was decided and why.

### OQ-1 — Shadow shape. **RATIFIED as written.**

I flagged the shadow numbers as a probable typo: each layer drops further down
than it is blurred, which normally gives you four faint hard-edged copies of a
card instead of one soft cloud. I was wrong to doubt it.

The numbers come from a generator
(`github.com/flornkm/shadow-plugin`). At size 8 / intensity 4% it emits
`0 1px 1px 4%, 0 3px 2px 3%, 0 6px 3px 2%, 0 10px 4px 1%` — our Raised step,
byte for byte. The drop-bigger-than-blur relationship is the whole point of the
look. **No change: all four steps keep their four shadow layers exactly as
they were.**

**One thing did change**, from that same source. The 1px hairline ring — the
fifth layer, the thin edge that keeps a card readable even where the shadow is
too faint to see — is a **constant**, not something that scales with the step.
It was scaling. Now it does not:

| | Ring value | Applies to |
|---|---|---|
| Light | black 5% | All four steps |
| Dark | white 18% | All four steps |

**And that closes the dark-shadow gap.** The earlier draft said dark mode had
no shadow set and would read flat. It now has one, and it was three lines, not
a project: the four black shadow layers are *identical* in dark — light still
falls from above — and only the ring flips from black to white so an edge
survives on a near-black surface. Figma carries the matching
`Dark/Subtle` … `Dark/Modal` effect styles, built in a parallel pass, so the
two sides mirror each other again.

### OQ-2 — The availability green. **RATIFIED.**

The little "available" dot needs a green that does not clash with warm grey.
Tailwind's stock greens are too electric next to stone.

| Option | Value | Looks like |
|---|---|---|
| **A (ratified)** | `oklch(0.68 0.14 152)` = **#48b06c** | Muted, slightly warm garden green |
| B | `oklch(0.70 0.15 155)` = #3bb974 | Brighter, more "online" green |
| C | `oklch(0.65 0.13 150)` = #4ca563 | Deeper, more olive |

**A** stands. In dark mode it lifts to `oklch(0.72 0.15 152)` = #4dbf74 so it
stays visible on near-black. The **#22c55e** in the original mock is
**superseded** — it is the electric one, and it fights the warm grey.

### OQ-3 — Scrim strength. **RATIFIED.**

The scrim is the dimming layer behind a dialog. **20% black in light, 50% in
dark**, as proposed. They are deliberately not matched: 20% black over a
near-black background is invisible, and the dialog would float with nothing
separating it from the page.

`scrim` and `status-available` now also exist as **Figma semantic variables**
(parallel pass), so both live in both places.

### OQ-4 — The `Prose` type step. **RATIFIED.**

The 16px/170% step for long-form writing (the MDX case studies) stays. It is
now `text-base` — see OQ-5.

### OQ-5 — Type naming. **CHANGED — we use Tailwind's own names.**

I had proposed seven invented names: `text-title`, `text-heading`,
`text-subhead`, `text-body`, `text-small`, `text-caption`, `text-prose`.

Ion's call: *"why not use tailwind defaults, I like them more, just make sure
they carry the right values."* Done. Five of the seven steps now **take over
Tailwind's own slots** and load them with our values:

| Now | Was | Value | Figma text style |
|---|---|---|---|
| `text-xs` | `text-caption` | 12px / 140% / Regular 400 / 0 | Caption |
| `text-small` | `text-small` | 13px / 145% / Regular 400 / 0 | Small |
| `text-sm` | `text-body` | 14px / 150% / Regular 400 / 0 | Body |
| `text-subhead` | `text-subhead` | 15px / 135% / Medium 500 / 0 | Subhead |
| `text-base` | `text-prose` | 16px / 170% / Regular 400 / 0 | Prose |
| `text-lg` | `text-heading` | 18px / 130% / Medium 500 / −1% | Heading |
| `text-2xl` | `text-title` | 24px / 125% / Medium 500 / −1% | Title |

**Why this is better than inventing names.** Everybody — every developer, every
shadcn component you install, every code snippet you paste — already reaches
for `text-sm`. Before, those defaults sat *alongside* our scale and quietly
escaped it. Now they *are* our scale: writing `text-sm` gets Aeonik at 14px,
150% leading, Regular, our tracking. Nothing has to be remembered or converted.
It is the same trick already used on shadows, where `shadow-sm` is aliased onto
our Subtle step.

**Two steps keep custom names.** 13px and 15px have no Tailwind slot to take
over, so they stay as `text-small` and `text-subhead` — the exact names of
their Figma text styles, on purpose.

**⚠️ One footgun, worth knowing about:** `text-sm` is 14px (Tailwind's slot,
our Body step) and `text-small` is 13px (ours, the Figma "Small" style). One
keystroke apart, both real classes, no error either way. If a label ever looks
one notch off, this is the first thing to check. It is called out loudly in the
CSS file too.

**`text-xl` (20px)** is left exactly as Tailwind ships it. The system has no
20px step, so nothing should use it. It is mentioned only so the gap between
`text-lg` and `text-2xl` does not read as an oversight.

Trade-off, unchanged: one class still sets size, line height, weight *and*
letter spacing together, so nobody can use the right size with the wrong
weight — and the steps still map one-to-one onto Figma text styles. `.typo-*`
could never do either.

---

## 3. The token contract

Status key: **NEW** = did not exist · **KEPT** = same name, same meaning ·
**CHANGED** = same name, different value · **DEAD** = deleted.

### 3.1 Colour — the 19 shadcn roles (stone)

Every one of these is **CHANGED**: the names already existed but pointed at the
old hand-rolled palette. Now they hold real stone values with proper dark
counterparts.

| Token | Light | Dark | What it's for |
|---|---|---|---|
| `background` | white | stone-950 `#0c0a09` | The page |
| `foreground` | stone-950 | stone-50 `#fafaf9` | Default text |
| `card` | white | stone-900 `#1c1917` | Card surface |
| `card-foreground` | stone-950 | stone-50 | Text on cards |
| `popover` | white | stone-900 | Popover / dropdown / identity panel surface |
| `popover-foreground` | stone-950 | stone-50 | Text inside those |
| `primary` | stone-900 | stone-200 `#e7e5e4` | Solid button fill |
| `primary-foreground` | stone-50 | stone-900 | Label on a solid button |
| `secondary` | stone-100 `#f5f5f4` | stone-800 `#292524` | Quiet button fill |
| `secondary-foreground` | stone-900 | stone-50 | Label on a quiet button |
| `muted` | stone-100 | stone-800 | Inert surfaces, rails, wells |
| `muted-foreground` | stone-500 `#79716b` | stone-400 `#a6a09b` | Secondary text |
| `accent` | stone-100 | stone-800 | Hover/active surface. **Neutral, not a brand hue** |
| `accent-foreground` | stone-900 | stone-50 | Text on accent |
| `destructive` | `#e7000b` | `#ff6467` | Delete, error |
| `destructive-foreground` | stone-50 | stone-50 | Text on destructive |
| `border` | stone-200 | white 10% | All hairlines |
| `input` | stone-200 | white 15% | Field borders |
| `ring` | stone-400 | stone-500 | Focus ring |

### 3.2 Colour — the six new roles

These are the debts that piled up during design: things components already
needed but had to hard-code.

| Token | Light | Dark | Status | What it's for |
|---|---|---|---|---|
| `primary-hover` | stone-700 `#44403b` | stone-300 `#d6d3d1` | **NEW** | Solid button on hover |
| `secondary-hover` | stone-100 (= muted) | stone-800 | **NEW** | White/quiet button on hover |
| `ghost-hover` | stone-100 (= muted) | stone-800 | **NEW** | Borderless button on hover |
| `primary-foreground-muted` | stone-400 `#a6a09b` | stone-500 | **NEW** | Dimmed icon *inside* a solid dark button |
| `status-available` | `#48b06c` | `#4dbf74` | **NEW** | The availability dot (see OQ-2) |
| `scrim` | black 20% | black 50% | **NEW** | Dimming behind dialogs (see OQ-3) |

Dark values for the hover and muted-icon roles were my call — the spec only
specified light. They follow the same logic: in dark mode `primary` is light, so
its hover state goes one step *darker*, not lighter.

### 3.3 Colour — deleted

| Token | Value it held | Why it dies |
|---|---|---|
| `--color-accent` | `#ff9f6a` orange | No brand accent in v2 |
| `--color-accent-soft` | orange 10% | Same |
| `--color-accent-hover` | `#ff8c4a` | Same — and it had **zero** uses |
| `--color-brand-ledgy` | `#5A1EFF` purple | Zero uses |
| `--color-brand-beets` | `#C5475F` pink | Zero uses |
| `--color-bg-glass` | black 2% | Glass is not the default card style |
| `--color-bg-base/surface/elevated` | white / #f5f5f5 | Replaced by `background` / `muted` / `card` |
| `--color-text-primary/secondary/tertiary/muted/subtitle/label` | greys | Replaced by `foreground` / `muted-foreground` |
| `--color-border-default/subtle/strong` | greys | Replaced by `border` / `ring` |
| `--color-success` / `--color-warning` | `#34d399` / `#fbbf24` | `success` becomes `status-available`; `warning` had no design home |
| `--identity-panel-*` (12 tokens) | aliases | A private alias layer over the old palette. Nine of the twelve had zero uses |

`accent` and `accent-foreground` survive **as names** — shadcn's navigation menu
uses them 16 times — but they now resolve to neutral stone, not orange.

### 3.4 Radius — one knob

**CHANGED across the board.** Every step gets bigger.

| Step | Old | New | Multiplier |
|---|---|---|---|
| `rounded-sm` | 6px | **9px** | `--radius` × 0.6 |
| `rounded-md` | 8px | **12px** | × 0.8 |
| `rounded-lg` | 10px | **15px** | × 1.0 (the knob itself) |
| `rounded-xl` | 12px | **21px** | × 1.4 |
| `rounded-2xl` | 16px | **27px** | × 1.8 |
| `rounded-3xl` | 24px | **33px** | × 2.2 |
| `rounded-4xl` | — | **39px** | × 2.6 — **NEW** |
| `rounded-full` | 9999px | 9999px | **KEPT** |

One knob: `--radius: 0.9375rem` (15px). Change that single number and all eight
steps move together, at runtime.

**The three rules to write down:**

1. **Controls are never `full`.** Buttons, inputs, chips, tabs, toggles use
   sm/md/lg. `rounded-full` is for avatars, dots, and genuinely circular things.
   There are **27 `rounded-full` uses today** that need a pass against this rule.
2. **The identity chip is the only near-pill**, and it uses `lg` (15px).
3. **Concentric corners: inner = outer − gap.** A 12px-radius card with 4px
   padding holds a 8px-radius child. Not the same radius — it looks wrong.

### 3.5 Shadow — four steps

**NEW names, replacing a broken set.** Today's `shadow-sm` is `0 2px 4px
rgba(0,0,0,0.4)` — 40% black. On a white page that is a smudge, not a shadow.
Seven components use those. That is a live visual bug, not just tech debt.

| Token | Size / intensity | Use on |
|---|---|---|
| `shadow-subtle` | s 4, 4% | Buttons, identity chip, inputs |
| `shadow-raised` | s 8, 4% | Cards, project rows, media tiles |
| `shadow-overlay` | s 16, 5% | Popovers, dropdowns, tooltips, identity panel |
| `shadow-modal` | s 32, 6% | Dialogs, sheets, the ⌘K palette |

Each is five layers: four soft ones plus a 1px hairline ring, so a card reads as
having an edge even where the shadow is too faint to see. The four soft layers
scale with the step; **the ring does not** — it is black 5% at every step in
light, white 18% at every step in dark (OQ-1).

**Design decision I made:** Tailwind's own shadow names (`shadow-xs`,
`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`) are **aliased**
onto these four. Practical effect: any shadcn component you install from now on
picks up our shadows automatically, instead of escaping the system. Nobody has
to remember to convert it.

**Dark mode: resolved, not deferred.** An earlier draft of this document listed
"no dark shadow set" as a known cost. That is out of date. Dark mode now has its
own set: same four black shadow layers — light still falls from above — with the
hairline ring flipped to white 18%. That single change is what makes elevation
read on a near-black surface. Figma carries matching `Dark/Subtle` …
`Dark/Modal` effect styles.

| Deleted shadow | Why |
|---|---|
| `--shadow-card` | Replaced by `shadow-raised`. **21 uses to convert** — the single biggest shadow edit |
| `--shadow-glow-accent` | **Broken today.** It points at `--color-accent-glow`, which is never defined anywhere. Zero uses, and it would not have worked |
| `--shadow-glow-white` | Zero uses |
| `--shadow-glass` | Zero uses |

### 3.6 Type — seven steps

**Old scale DEAD** (8 steps, `.typo-*`). **New scale** = 7 steps on `text-*`,
five of them Tailwind's own slots redefined with our values (OQ-5).

| Token | Size | Weight | Line height | Tracking | Status |
|---|---|---|---|---|---|
| `text-xs` | 12px | Regular 400 | 140% | 0 | **CHANGED** — Tailwind slot, our values |
| `text-small` | 13px | Regular 400 | 145% | 0 | **NEW** — no Tailwind slot at 13px |
| `text-sm` | 14px | Regular 400 | 150% | 0 | **CHANGED** — Tailwind slot, our values |
| `text-subhead` | 15px | Medium 500 | 135% | 0 | **NEW** — no Tailwind slot at 15px |
| `text-base` | 16px | Regular 400 | 170% | 0 | **CHANGED** — Tailwind slot, our values |
| `text-lg` | 18px | Medium 500 | 130% | −1% | **CHANGED** — Tailwind slot, our values |
| `text-xl` | 20px | — | — | — | **KEPT** — stock Tailwind, unused by the system |
| `text-2xl` | 24px | Medium 500 | 125% | −1% | **CHANGED** — Tailwind slot, our values |

Practical effect of taking over the default slots: `text-sm` written anywhere,
by anyone, in any pasted shadcn component, now *is* the Body step. There is
nothing to convert. Watch the `text-sm` (14) vs `text-small` (13) collision —
see the footgun note in OQ-5.

**No uppercase step exists.** That is the point. The old `.typo-label` was 11px
uppercase with wide letter-spacing; it has **18 uses** that all need rewriting as
`text-xs` in sentence case. Plus one loose `uppercase` class in
`components/ui/section.tsx`. **19 uppercase sites total.**

Also dead: the old `.typo-display` (48px), `.typo-h1` (36px), `.typo-h2` (24px),
`.typo-h3` (20px), `.typo-body` (16px), `.typo-body-sm` (14px), `.typo-caption`
(12px). Between them: 31 uses, 25 of which are in `app/playground/page.tsx`, a
scratch route.

**Fonts:**

| Token | Value | Status |
|---|---|---|
| `--font-sans` | `"Aeonik Pro", system-ui, -apple-system, sans-serif` | **KEPT** |
| `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | **CHANGED — fixes a live bug** |

The old `--font-mono` was `var(--font-geist-mono)`, and **`--font-geist-mono` is
never defined anywhere in the project**. So the three places using `font-mono`
today (the agent token counter, the timeline tooltip, the project-panel chip)
silently render in Aeonik, not a monospace font. v2 declares a real stack.

### 3.7 Motion — audited and cut

I checked every old motion token against actual usage.

| Old token | Value | Real uses | Verdict |
|---|---|---|---|
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | 2 (pill-button, icon-button) | **KEPT** |
| `--ease-snap` | `cubic-bezier(.25,.1,.25,1)` | 0 | **DEAD** |
| `--ease-out` | `cubic-bezier(0,0,.2,1)` | 3, all inside globals.css | **DEAD** — byte-identical to Tailwind's own `ease-out`. It was a no-op |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` | 1, inside globals.css | **DEAD** — same, a no-op |
| `--duration-fast` | 100ms | 0 | **DEAD** |
| `--duration-default` | 150ms | 4, all inside globals.css | **RENAMED** → `--duration-base`, 200ms |
| `--duration-medium` | 200ms | 0 | **DEAD** |
| `--duration-slow` | 300ms | 0 | **DEAD** |
| `--duration-entrance` | 400ms | 3, inside globals.css | **RENAMED** → `--duration-slow`, 400ms |
| `--stagger-delay` | 50ms | 6 | **KEPT** |
| `--dock-item-size`, `--dock-gap` | sizes | 0 | **DEAD** — the dock they sized no longer exists |

**The kept set is six tokens:**

| Token | Value | For |
|---|---|---|
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | Overshoot — press, pop |
| `--ease-glide` | `cubic-bezier(.16,1,.3,1)` | Strong deceleration — panels, reveals. **NEW** |
| `--duration-fast` | 150ms | Colour, opacity, hover |
| `--duration-base` | 200ms | Size, transform, panel state |
| `--duration-slow` | 400ms | Entrances, scroll reveals |
| `--stagger-delay` | 50ms | One unit of list-entrance offset |

`--ease-glide` is new but not invented: `cubic-bezier(0.16,1,0.3,1)` is already
used **6 times** in components as a hand-typed arbitrary value, and a near-twin
`cubic-bezier(0.25,1,0.5,1)` appears 4 more times. Making it a token collects 10
scattered copies into one name.

The durations line up exactly with Tailwind's numeric spellings
(`duration-150` / `duration-200` / `duration-400`), so both ways of writing it
agree. That matters because 30 places already use the numeric form.

**One technical footnote that cost me a bug:** Tailwind v4 has no duration
namespace, so `duration-fast` will never be a class — only `var(--duration-fast)`
works. The file is arranged so that variable is always available. The easings
*do* get classes (`ease-spring`, `ease-glide`).

### 3.8 Spacing — no tokens, a convention

Tailwind's default scale, unchanged. Nothing to declare. But the canonical list
should be written down and, ideally, linted:

| Tier | Allowed | Tailwind classes |
|---|---|---|
| Component | 4, 6, 8, 12, 16, 24, 32 px | `1`, `1.5`, `2`, `3`, `4`, `6`, `8` |
| Layout | 48, 64, 96 px | `12`, `16`, `24` |

**Banned** — these are the exact classes a linter should reject:

| Banned px | Tailwind step | Uses today |
|---|---|---|
| 2px | `0.5` | 5 |
| 10px | `2.5` | 8 |
| 14px | `3.5` | 2 |
| 20px | `5` | 14 |
| 28px | `7` | 2 |
| 128px | `32` | 1 |
| anything arbitrary | `p-[13px]`, `mb-[22px]`, … | 7 |
| | **total to fix** | **39** |

Rule, in one line: **reject any `p-`/`m-`/`gap-`/`space-` utility whose step is
not in {0, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24}, and reject all arbitrary square-
bracket spacing.** One documented exception exists and should stay:
`pb-[calc(8rem+env(safe-area-inset-bottom))]` for the iOS home indicator.

### 3.9 Icons — system facts, not CSS

Not tokens, but part of the contract:

| Rule | Value |
|---|---|
| Library | Lucide (`lucide-react`, already installed) |
| Stroke width | **1.5** everywhere |
| Sizes | **16px** and **20px** only |
| Brand marks | GitHub, X, LinkedIn use **filled** brand glyphs, not Lucide strokes |
| Colour | `muted-foreground` by default; `primary-foreground-muted` inside solid dark buttons |

---

## 4. The migration bill

What it costs to actually switch the site over. Counts are from a fresh grep of
the working tree, not the old audits.

### 4.1 Colour — the big one

| Work | Count | Files | Notes |
|---|---|---|---|
| Rename hand-rolled token classes (`bg-bg-elevated` → `bg-muted`, `text-text-primary` → `text-foreground`, …) | **222** | 21 | Mechanical, but 222 of them |
| Replace absolute colours (`text-white`, `bg-white/5`, `ring-black`, `bg-black/50`) | **65** | 14 | Needs judgement — some are correct on dark media overlays |
| Replace `text-[var(--color-…)]` arbitrary values | **50** | several | Old palette referenced by hand |
| Triage hex literals in TS/TSX/MDX | **50** | — | Many are legitimate *case-study* brand colours in `content/`. Only the ones matching the killed tokens need removing |
| Orange-dependent `accent-*` uses | ~12 | 6 | `text-accent`, `bg-accent-soft`, `ring-accent`, `border-accent` |
| | **≈ 337 edits** | | |

The old audit said "~65 raw colour usages". That undercounted by 5×: it missed
the 222 hand-rolled token classes, which are the real bulk of the work.

Worst files:

| File | Token-class uses |
|---|---|
| `components/agent/agent-surface.tsx` | 69 |
| `components/portfolio/mobile-project-detail.tsx` | 45 |
| `components/portfolio/project-panel.tsx` | 25 |
| `components/portfolio/mobile-home.tsx` | 15 |
| `components/portfolio/project-media.tsx` | 12 |
| `components/portfolio/identity.tsx` | 10 |
| `components/ui/pill-button.tsx` | 16 absolute colours |
| `components/ui/icon-button.tsx` | 15 absolute colours |

### 4.2 Everything else

| Work | Count | Notes |
|---|---|---|
| `shadow-card` → `shadow-raised` | **21** | Pure find-and-replace |
| Arbitrary `shadow-[0 …]` values | 5 | Map onto the four steps |
| `.typo-*` → the new steps | **31** | Same-size swaps: `h2`(24) → `text-2xl`, `body`(16) → `text-base`, `body-sm`(14) → `text-sm`, `caption`(12) → `text-xs`, `label`(11) → `text-xs`. 25 of them in `app/playground/page.tsx`. **Three have no equal — see the note below** |
| Uppercase labels → sentence case | **19** | 18 `typo-label` + 1 loose `uppercase`, all landing on `text-xs` |
| Arbitrary pixel font sizes (`text-[15px]`, `text-[11px]`, …) | **26** | Map onto the 7 steps. 15px is `text-subhead`, 13px is `text-small` |
| Banned spacing steps + arbitrary spacing | **39** | See 3.8 |
| Arbitrary `rounded-[…]` values | 15 | 22px, 7px, 28px, 18px, 14px, 13px, 12px, 10px, 4px, 2px |
| `rounded-full` audit against the controls rule | 27 | Review, not necessarily change |
| Arbitrary easings → `ease-glide` | 7 | 6× `cubic-bezier(0.16,1,0.3,1)`, 1× `(0.25,1,0.5,1)` |
| Dead token declarations to delete | **24** | Old audit said 13; see below |
| | **≈ 214 edits** | |

**Three old type steps have no equal in the new scale**, and I am flagging them
rather than picking for you. The scale stops at 24px:

| Old step | Size | Problem |
|---|---|---|
| `.typo-display` | 48px | Nothing that big exists. Either it becomes `text-2xl` (much smaller) or the scale needs a display step |
| `.typo-h1` | 36px | Same |
| `.typo-h3` | 20px | 20px is `text-xl`, which the system deliberately does **not** use |

All 31 `.typo-*` uses are in `app/playground/page.tsx` (25) and a handful of
other places, so this is not urgent — but it is a real gap in the scale, not an
oversight in the migration list.

**Grand total: ≈ 550 edits, of which ≈ 440 are non-optional.** (The 27
`rounded-full` sites and some of the 50 hex literals are review-only.)

### 4.3 Dead tokens — 24, not 13

The old audit found 13. A fresh read finds 24 declarations that are unused,
broken, or redundant:

| # | Token | Why dead |
|---|---|---|
| 1 | `--color-accent-hover` | Zero uses |
| 2 | `--color-brand-ledgy` | Zero uses |
| 3 | `--color-brand-beets` | Zero uses |
| 4 | `--shadow-glow-accent` | **Broken** — references undefined `--color-accent-glow` |
| 5 | `--shadow-glow-white` | Zero uses |
| 6 | `--shadow-glass` | Zero uses |
| 7 | `--ease-snap` | Zero uses |
| 8 | `--ease-out` | Redundant — identical to Tailwind's default |
| 9 | `--ease-in-out` | Redundant — identical to Tailwind's default |
| 10 | `--duration-fast` | Zero uses |
| 11 | `--duration-medium` | Zero uses |
| 12 | `--duration-slow` | Zero uses |
| 13 | `--dock-item-size` | Zero uses |
| 14 | `--dock-gap` | Zero uses |
| 15 | `--font-mono` → `--font-geist-mono` | **Broken** — target never defined |
| 16–24 | `--identity-panel-secondary`, `-muted`, `-placeholder`, `-control`, `-control-hover`, `-field`, `-field-hover`, `-field-border`, `-row-hover` | Zero uses, along with their nine matching CSS classes |

Only four of the twelve `.identity-panel-*` utility classes are actually used
(`-surface`, `-content`, plus `.identity-root` and `.identity-overlay`). v2 keeps
those four, rewritten against `popover` / `border` / `shadow-overlay`, and drops
the rest.

### 4.4 Suggested order of work

1. **Land the CSS file.** Site still works; corners get rounder, shadows get
   lighter, orange disappears. Nothing breaks — the old token *classes* stop
   resolving, so the affected elements fall back to inherited colour. Ugly but
   not broken.
2. **Colour rename sweep**, worst file first (`agent-surface.tsx`). Mechanical.
3. **`shadow-card` → `shadow-raised`.** 21 replacements, one command.
4. **Type sweep**: `.typo-*`, uppercase, arbitrary pixel sizes.
5. **Spacing and radius cleanup**, plus the `rounded-full` review.

The dark shadow set used to be a step 6 here. It is done and in the file.

Steps 1–3 get you ~80% of the visible change.

---

## 5. Where CSS and Figma cannot mirror each other

The contract matches the Figma `portfolio/*` collections one-to-one for colour,
radius, shadow, and type. Four places where they structurally cannot:

| Thing | Problem | How we handle it |
|---|---|---|
| **Spacing** | Deliberately has no tokens — it is Tailwind's default scale. Figma has no variable to point at | Lives as a written convention (3.8) and, ideally, a lint rule. Figma should use a documented auto-layout preset list, not variables |
| **Motion** | Figma has no home for easing curves or durations. `globals.css` is the **single source of truth** for motion, with no mirror | Accept it. Motion is reviewed in the browser, not in Figma |
| **Shadows + dark mode** | Figma effect styles cannot carry a light and a dark variant on one style | **Two separate Figma effect styles per step**, and both sets now exist: `Subtle`…`Modal` plus `Dark/Subtle`…`Dark/Modal`. CSS does it with one name that re-resolves in `.dark`; Figma needs the pair. Renaming or retuning a step means touching two Figma styles, not one |
| **The radius knob** | CSS derives all 8 steps from one `--radius` via `calc()`. Figma variables cannot do arithmetic on another variable | Figma stores the 8 computed values (9/12/15/21/27/33/39/9999). If the knob ever changes, someone must re-enter 8 numbers in Figma. **Write this down as a manual sync step** |

One more, worth knowing: because the file uses Tailwind's `@theme inline`, some
tokens exist only *inside* the utility classes and not as a live CSS variable at
runtime. Practical rule for whoever implements: **use the utility
(`bg-scrim`, `text-base`, `ease-spring`), not `var(--color-scrim)`.** The
motion durations are the exception and are deliberately declared so `var()`
always works.

---

## 6. Verification

Re-run after the five rulings landed.

| Check | Result |
|---|---|
| Braces / parentheses balanced | Pass (38/38, 224/224) |
| Compiles with Tailwind v4.3.3 — the version the repo pins | **Pass**, 0 errors |
| All 25 colour utilities generate | Pass |
| All 7 type steps generate with size + leading + weight + tracking | Pass |
| The 5 redefined Tailwind slots carry our values, not Tailwind's | Pass (`text-sm` = 14px/1.5/400) |
| `text-xl` still resolves as stock Tailwind (20px) | Pass |
| All 4 shadow steps + 7 Tailwind aliases generate | Pass |
| Dark elevation set generates, ring flips to white 18% | Pass (4 steps) |
| All 8 radius steps generate, derived from the one knob | Pass |
| `hover:` variants of the new hover roles generate | Pass |
| Dark-mode variant still swaps every role | Pass |
| Motion variables survive Tailwind's variable pruning | Pass |

Compiled in an isolated scratch directory. **No file inside the repository was
read-modified or written.**
