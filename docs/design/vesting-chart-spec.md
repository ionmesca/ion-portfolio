# Vesting chart panel (Equity Dashboard), build spec

Ion's ruling 2026-08-22: build the vesting breakdown as a Chart.js chart,
Fey-style, on the portfolio motion system. Reference mock:
`docs/design/preview-VestingChart.html` (static HTML, the agreed look).
Reference for Ledgy's own chart: `~/ledgy-app/packages/web/components/dashboard-v2-prototype/VestingChart.tsx`
and `VestingCard.tsx` (read them for the card anatomy and copy; do not import).

## Card anatomy (copied by hand from Ledgy, re-themed to portfolio tokens)

Card `bg-card rounded-md shadow-subtle` (12px radius, concentric inside the
21px `rounded-xl` panel), padding 16px, column gap 12px, width 560px max,
centred in the panel on `bg-muted`. Mobile 4:5: card fills width minus 16px
inset, same text sizes (the `@md:` container breakpoint is the desktop one).

1. Header row: scope tabs on the left, "See full schedule ›" on the right.
   - Tabs: Ledgy pill style: h-7, px-2, 12px/500, rounded-[8px]; active =
     `bg-card shadow-subtle`, inactive transparent, hover `bg-muted`.
     Transition colour/shadow 150ms ease-glide. Tablist semantics.
   - "See full schedule": 12px/500 text + Font Awesome regular chevron-right
     (path in `preview-VestingChart.html`), hover darkens text only. No drawer.
2. Stats row: left "70% vested" 24px/32 500 in `#047857` (emerald-700, Ledgy
   delta-pos) + subline "Next vesting event 1 Sept 2026" 12px muted-foreground;
   right "30% unvested" 24px/32 500 muted-foreground + "Fully vested 1 Sept
   2029". Numbers cross-fade on scope change (opacity to 0.18 over 150ms,
   swap, back), same as Ledgy's `useLensSwap`.
3. Chart (below). Height 180px desktop, 200px mobile.
4. Axis row: "Feb 2020" left, "Sept 2029" right, 12px muted-foreground.
   No legend.

## Chart drawing (Chart.js 4, tree-shaken registration, lazy-imported)

- `import('chart.js')` inside an effect so it stays out of first-load JS;
  register only LineController, LineElement, PointElement, LinearScale,
  Filler, Tooltip (if used). Report the first-load JS delta in the PR body.
- Two datasets on a LinearScale x (months since Feb 2020, 0..115) and a
  hidden LinearScale y (0..yMax, yMax fixed per domain so switching scope
  never rescales). Both axes `display: false`, no grid, no ticks, no legend.
- Dataset "vested": step line (`stepped: 'before'`), colour `#10b981`
  (Ledgy status-vested), width 1.5, from Feb 2020 to Today, plus a faint
  vertical gradient fill (emerald 0.16 to 0) under the past only.
- Dataset "scheduled": step line from Today to Sept 2029, colour
  `var(--muted-foreground)` at 60%, width 1.25, no fill. Dashed `[3, 4]`.
  Colour decision (Ion deferred to me): green = what the user owns, so the
  past is emerald and the future is quiet; this matches the meters and the
  "70% vested" headline.
- No cliff jumps: events every month, steady steps. No gridline, no bars.
- Plugins (custom, in the component file):
  - `dotGrid`: before datasets, draw 1px dots on a 10px pitch in
    `muted-foreground` at 0.32, masked through a vertical gradient alpha
    (0 at bottom, 1 from 35% to 75%, 0.15 at top) like Fey.
  - `todayMarker`: dashed vertical line at Today, `muted-foreground` 0.9,
    dash [3, 4]; the "Today" label and the "€3.7M" value are HTML overlays
    positioned from `scales.x.getPixelForValue(today)` so they use the page
    font and tabular-nums. Live dot at (Today, vestedValue): 10px emerald
    with 3px `bg-card` ring and 7px emerald 16% halo, HTML overlay too.
- Hover: Chart.js `interaction: { mode: 'index', intersect: false }` with an
  external HTML tooltip: white card `bg-card shadow-overlay rounded-sm p-2.5`,
  title "Vested by Jun 2023" (12px muted), one row per grant (label muted,
  value 500 tabular), "Total" row with emerald dot. Plus a 1px vertical
  guide at the hovered x (`foreground` at 25%). Tooltip fades 150ms.
  Copy the row format from Ledgy: "€291.1k · 83 options".
- Motion: data transitions between scopes animate 400ms with
  `easeOutQuart` (closest Chart.js named curve to `--motion-glide`). Hover
  elements 150ms. `animation` on first render: draw from the baseline over
  400ms (Chart.js default `y` from-bottom is fine). Respect
  `prefers-reduced-motion`: set `animation: false`.
- Resize: `responsive: true`, `maintainAspectRatio: false`, wrap in a sized
  div. Use `devicePixelRatio` default.

## Data (`components/ledgy/vesting-data.ts`, mock, internally consistent)

Domain Feb 2020 to Sept 2029, today 22 Aug 2026, yMax = €5.6M. EUR.
Grants (match the tooltip in Ion's reference: Grant 83, Grant 59, Common
Incentive, Common, Preferred E):

- Grant 83: 100 options, €3,507.91 value each less €1.17 strike, vesting
  monthly Jan 2020 to Jan 2024 after a 6-month cliff folded into steady
  monthly steps (no visible cliff).
- Grant 59: 193 options, Mar 2021 to Mar 2025.
- Grant 131: 100 options, Sept 2025 to Sept 2029 (the scheduled tail).
- Grant 133: 1,000 options, Sept 2025 to Sept 2029, €1.00 strike.
- Common Incentive: 2,000 shares, fully vested Oct 2023, value 0 (no price).
- Common: 15 shares, vested Jun 2021, €3,507.91.
- Preferred E: 100 shares, vested Oct 2023, €3,507.91.

Scopes: All instruments (70% vested, next 1 Sept 2026, fully vested 1 Sept
2029, committed €5.3M), Options (24% / 76%), Shares (100%, "Vesting
completed on 10 Oct 2023", right stat hidden, link reads "See history").
Adjust unit counts only if needed to land those percentages; keep the
grant names.

## Wiring

- `lib/projects.ts`: add `{ type: "vesting-chart"; alt: string }` to
  `ProjectMedia`; give `equity-dashboard` a `media` array with that one
  entry (the holdings card comes later as a second entry).
- `components/landing/project-art.tsx`: dispatch `vesting-chart` to
  `components/ledgy/vesting-chart-stage.tsx` (the `@container absolute
  inset-0 bg-muted` stage, like `thinking-stage.tsx`).
- Panel counting stays on `projectPanelIndices`.

## Verify

`bunx tsc --noEmit`, `bunx eslint` on touched files, `bun run build`
(report first-load JS for `/` before and after). Screenshots desktop 16:10
and mobile 4:5 from the dev server at http://localhost:3000.
