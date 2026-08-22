# Equity timeline card (Equity Dashboard), build spec

Ion's ruling 2026-08-22, after the brainstorm on the design canvas
(https://claude.ai/code/artifact/e22203c4-bf6a-4a9e-9dc9-6579f34ed1a1, row
"Merged card"): the holdings card and the vesting chart become ONE card. Rows
are instruments, each row is a strip on one shared time axis, Today cuts
through every strip. Value lives in the number on the right, time lives in
the strip. The Chart.js line panel is retired by this card.

Boards to match: `docs/design/preview-MergedClean.html` (default),
`preview-MergedScrub.html` (hover, past date), `preview-MergedScrubFuture.html`
(hover, future date). Static HTML, Aeonik, portfolio tokens. Open them from
the dev server or a static server at the repo root.

Ledgy sources, read for copy and anatomy, never import:
`~/ledgy-app/packages/web/components/dashboard-v2-prototype/{HeroCard,InstrumentRow,MeterBar,LensTabs,lenses,types}.tsx|ts`.

## Scope of this build (phase 1)

The card, the lens tabs, the strips, the scrub hover, the lens switch by
click, first-reveal motion, desktop 16:10 and mobile 4:5. Rows are clickable
but the drawer (per-grant lanes) is phase 2 and is NOT built now: the row
name is a button with a chevron, press feedback, and `aria-disabled` copy
"Grant breakdown coming next". The lifecycle playback is phase 3.

## Card anatomy

Card `bg-card rounded-md shadow-subtle`, width 640px max, centred on the
`bg-muted` stage (`@container absolute inset-0 grid place-items-center p-4`,
same wrapper as `vesting-chart-stage.tsx`). Mobile: card fills width minus
16px inset, same text sizes, label column 120px.

1. Header, padding 16px, column gap 10px.
   - Lens tabs only (no "See full schedule"). Ledgy pill tabs: h-7, px-2,
     12px/500, rounded-[8px], active `bg-card shadow-subtle`, inactive
     transparent, hover `bg-muted`, 150ms ease-glide on background and
     shadow. Each tab carries an 8px 2px-radius swatch: All equity = conic
     emerald 70% / slate 30%, Vested = `#10b981`, On hold = the hatch,
     Unvested = `#cbd5e1`. Tablist semantics, roving tab index.
   - Lenses: `all | vested | onhold | unvested`. A lens with zero value is
     HIDDEN, never disabled (On hold disappears when nothing is locked).
   - Headline: total value 24px/32 500 foreground, decimals muted
     (`€5,085,274.` + `25` in muted-foreground), tabular nums.
   - Subline 12px muted-foreground: default `70% vested`. Rewrites on hover
     and on lens (below). Only ONE subline, never a sentence list.
2. Divider 1px `border`.
3. Body, padding 10px 16px 12px. Grid `176px 1fr 128px`, gap 16px
   (mobile `120px 1fr 104px`, gap 12px).
   - Axis header row, 20px: "Today" 12px muted centred on the Today x.
   - One row per instrument, 56px tall: name 14px/20 500 + chevron-right
     (Font Awesome regular path from `vesting-chart.tsx`), subline 12px
     muted (`4 grants`, `3 share classes`); strip in the middle column;
     value 16px/24 500 with muted decimals + units 12px muted, right
     aligned.
   - Axis footer: `Feb 2020` left, `Sept 2029` right, 12px muted, in the
     strip column only.
   - Today line: 1px dashed `#a6a09b`, from the axis header down through
     the last strip. Drawn once, absolutely positioned in the strip column.

## Strips (the chart)

Plain DOM, no canvas, no Chart.js. Each strip is an 8px tall relative box;
segments are absolutely positioned spans with `border-radius: 2px`, positions
in percent of the domain (Feb 2020 = 0, Sept 2029 = 100, Today = 68.1%).

Merge rules at instrument level (per `vesting-data.ts` grants):

- Vested segment: emerald `#10b981`, from the earliest grant start of that
  instrument to Today, only if anything has vested.
- Unvested segment: slate `#cbd5e1`, from Today to the latest scheduled end.
- On hold segment (shares only): the hatch
  `repeating-linear-gradient(45deg, #10b981 0 2px, rgba(16,185,129,0.28) 2px 5px)`
  from the lock start to the lock end, square left corner where it abuts
  the vested segment. It REPLACES the vested segment over that span.
- Conditions (any grant with performance or liquidity conditions): the last
  14% of the unvested segment fades to transparent
  (`linear-gradient(90deg, #cbd5e1 0 40%, transparent)`), no end cap. Not
  present in phase 1 data; implement the branch, leave it unexercised.
- Leaver and pre-cliff states are out of phase 1 data.
- Event dot: ONE per row, the nearest upcoming dated event, drawn ON the bar
  inside the unvested/hatch segment: 4px circle `foreground` at 80%, its
  date 11px muted centred under the bar (`1 Sept 2026` on Options for the
  next vesting event, `12 Mar 2027` on Shares for the lock end). Dots and
  dates fade out (150ms) while the strip column is hovered and return on
  leave.

Lens state: segments outside the lens drop to 20% opacity (150ms
ease-glide); the lens's segments stay full. Values and units in the right
column rewrite to the lens value (Vested lens: Options shows vested value
and vested units). Subline rewrites to `Vested · €3,706,000 · 73%` (value
and share of total), All equity returns to `70% vested`.

## Hover (the tooltip is the card)

No floating tooltip. Pointer over the strip column:

- A solid 1px guide line (`foreground` at 35%) follows the cursor, snapped
  to the month, full height of the strip column. Today stays dashed.
- Subline rewrites: past or present `As of Jun 2024 · 49% vested` (percent
  in `#047857`), future `By Jun 2028 · 89% vested` (percent muted).
- Each row's value and units cross-fade (opacity to 0.18 over 150ms, swap,
  back, Ledgy's `useLensSwap`) to the as-of figure: Options
  `€2,614,400` / `745 options vested`; future dates muted value and
  `vested by then`; Shares inside the lock span `€403,409` / `on hold until
  12 Mar 2027`, after it `available`.
- Event dots hide. Leave: guide fades 150ms, numbers return to Today.
- Touch: tap and drag scrubs; release returns to Today after 400ms.
- Keyboard: the strip column is focusable; left/right move the guide a
  month, Home/End to the ends, Escape returns to Today. `aria-live=polite`
  on the subline.

## Click

- Click a segment: switches to that lens (vested segment -> Vested). Click
  the segment of the active lens: back to All equity. Same as Ledgy's
  MeterBar.
- Click the row name: phase 2 drawer. Phase 1: press feedback only.
- Click a tab: lens. Click the active tab: stays.

## Motion (portfolio ladder, no library)

- First reveal (panel enters the viewport, once): strips scale-x from 0 at
  the left over 400ms ease-glide, Shares 100ms after Options; Today line
  and event dots fade in over 200ms after the strips land. Reduced motion:
  everything appears at once.
- Lens and hover swaps: 150ms opacity. Segment opacity 150ms. Guide
  position: no transition (follows pointer), opacity 150ms.
- Press on tab, row name, segment: `scale(0.96)`, 150ms.
- Every animated change leaves a static cue: active tab background, the
  subline text, the row values.

## Data (`components/ledgy/equity-timeline-data.ts`)

Derive from `components/ledgy/vesting-data.ts` (same grants, same month
indices, same `monthIndex`, `formatMonthLabel`, money formatters). Add:

- Instrument rows: Options (Grant 83, 59, 131, 133), Shares (Common, Common
  Incentive, Preferred E). Totals must land on Options `€4,681,864.51` /
  `1,335 options` and Shares `€403,409.74` / `2,115 shares`, total
  `€5,085,274.25`, 70% vested by value. If the existing grant values do not
  sum to these, adjust `netValue` per grant, never the unit counts, and say
  so in the handoff.
- Lock: Preferred E, 100 shares, locked until 12 Mar 2027 (lock start =
  its last vest, Oct 2023). This makes the On hold lens appear with
  `€350,791`.
- Next events: Options 1 Sept 2026 (next vest), Shares 12 Mar 2027 (lock
  end).
- `valueAt(instrument, month)` returning vested value, vested units, on-hold
  value, for the scrub. Month granularity.

## Wiring

- `lib/projects.ts`: replace the `vesting-chart` media entry of
  `equity-dashboard` with `{ type: "equity-timeline", alt: "Equity card with
  Options and Shares as strips on one time axis, 70% vested" }`. Remove the
  `vesting-chart` member from `ProjectMedia`.
- `components/landing/project-art.tsx`: dispatch `equity-timeline` to
  `components/ledgy/equity-timeline-stage.tsx`; remove the vesting chart
  import.
- Delete `components/ledgy/vesting-chart.tsx`,
  `vesting-chart-stage.tsx`. Keep `vesting-data.ts` (the new data imports
  it). Remove `chart.js` from `package.json` (`bun remove chart.js`). The
  Chart.js ruling in CLAUDE.md / DESIGN.md stays; add one line to DESIGN.md
  saying the ruling currently has no consumer.
- Component files: `components/ledgy/equity-timeline.tsx` (card),
  `equity-timeline-strip.tsx` (one row's strip), `equity-timeline-data.ts`.
  "use client" on the card only.

## Verify

`bunx tsc --noEmit`, `bunx eslint` on touched files, `bun run build` with
first-load JS for `/` before and after (expect a drop, Chart.js chunk gone).
Screenshots from http://localhost:3000 at desktop 16:10 and mobile 4:5 to
`docs/design/reference/equity-timeline-desktop.png` and
`equity-timeline-mobile.png`, plus one hover state
`equity-timeline-scrub.png`. Check: hover rewrites the subline and row
values, dots hide on hover, clicking the emerald segment switches to Vested
and back, On hold tab present, reduced motion skips the reveal.
