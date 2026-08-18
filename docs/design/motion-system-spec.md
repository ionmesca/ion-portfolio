# Motion system demo — spec (POR-32)

Build ONE standalone HTML file, `motion-lab.html`, in this scratchpad
directory: a living document of the portfolio's motion system with every
pattern running live. It will be rendered in a SANDBOXED side-panel iframe —
same constraints as the earlier wheel prototype:

- try/catch around ANY history/URL API; no localStorage/sessionStorage;
  no external requests; everything inlined; must boot even if AudioContext
  is unavailable (feature-detect, degrade to silent).
- Vanilla JS + CSS only. NO animation library — the system is deliberately
  dependency-free (this is a documented decision: transform/opacity CSS +
  ~50 lines of physics beats 40kb of framer-motion for a portfolio that
  must feel instant).
- Do not touch the ion-portfolio repo.

## Source recipes — install the transitions.dev skill first

Create a scratch dir `motion-lab/` inside the scratchpad, run
`npx skills add Jakubantalik/transitions.dev` in it (accept defaults;
non-interactive flags if prompted). Then READ the installed skill files
(likely under `.claude/skills/` or similar in that dir) and lift the actual
CSS recipes for at least: **icon swap** (scale+blur — Ion's chosen
reference), **success check**, **modal open/close**, **skeleton/loader**,
**text states swap**, **number pop-in**. Adapt values to OUR tokens below —
the recipes are references, our tokens win on any conflict. If the install
fails, recreate the patterns from their visual descriptions and note it.

## The system (authoritative — encode verbatim in the demo's copy)

Tokens (already in globals.v2.css — inline them in the demo):

- `--motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoot; for
  things the user TOUCHES: press, pop, toggle.
- `--motion-glide: cubic-bezier(0.16, 1, 0.3, 1)` — strong decel; for
  things that MOVE THEMSELVES: panels, reveals, entrances.
- `--duration-fast: 150ms` — hover feedback, colour, opacity.
- `--duration-base: 200ms` — transforms, state changes, panels.
- `--duration-slow: 400ms` — entrances only. NOTHING exceeds 400ms except
  continuous physics (the wheel's lerp).
- `--stagger-delay: 50ms` — list entrances, capped at 5 items then grouped.

Principles (the demo's intro section, keep the copy tight):

1. **Motion is feedback, not decoration.** Every animation answers "what
   just happened". Nothing moves on a timer; nothing loops.
2. **Fast is the feature.** 150/200/400. When unsure, use the shorter one.
3. **Transform, opacity, blur — nothing else.** Never animate layout.
   The two sanctioned morphs (identity panel, social popover) fake it with
   measured transforms.
4. **Blur is a transition garnish, never a resting style.**
5. **Hover doesn't animate in.** Row/link hover states SNAP (0ms in,
   150ms out) — the cmdk/Linear convention; animated hover-in reads laggy.
6. **Reduced motion is a first-class mode**: everything collapses to
   opacity 150ms or instant. Global toggle in the demo header.
7. **Sound is optional garnish on COMMIT actions only** (Book a call,
   Copy email success): one very quiet tick family, WebAudio-synthesised
   (no assets), desktop only, and the demo ships it OFF by default with a
   toggle. Two candidate ticks (soft wood ~2kHz 30ms vs softer click) —
   A/B buttons, Ion picks or kills.

## Demo sections (each = card: live stage + name + "where it applies" +
recipe caption like `glide · 200ms · scale .98→1 + fade`)

1. **Icon swap** — sun→moon→monitor cycle on a segment control mock
   (scale .6↔1 + blur 4px↔0 crossfade, spring, 200ms). Where: theme
   toggle, any icon state change.
2. **Button press** — a Primary and a Secondary button (our exact look:
   stone-900 fill / white+ring, h32, radius 12, Subtle shadow): press
   scale .97 spring 150ms; RELEASE returns with spring overshoot. Include
   the loading state: colour stays, label crossfades to a spinner whose
   arc length varies per cycle (Devouring Details behaviour), button
   functionally disabled only. Sound hook lives here + on copy-success.
3. **Copy → check** — icon swap copy→check + label "Copy email"→"Copied"
   (text states swap), auto-revert after 1.5s. Where: ⌘K Copy email row,
   any copy affordance.
4. **Palette open/close** — a mini ⌘K panel (our Modal shadow, radius 21,
   scrim): open = scale .98→1 + fade + translateY(-4→0), glide 200ms,
   scrim fade 150ms; close = 150ms reverse. Trigger button + Esc.
5. **Entrance stagger** — replay button: identity chip → title → intro →
   actions rise 8px + fade, glide 400ms, 50ms stagger. Where: landing
   first paint ONLY, once per visit, never on route-back.
6. **Hover snap A/B** — two identical row lists (our project-row look),
   left: snap-in/150ms-out (the system), right: 150ms both ways (the
   common mistake). Caption says which is ours and why.
7. **Year reveal** — a wheel-row mock where activating the row fades/
   slides the year in at 150ms fast-out. Where: project wheel active row.
8. **Link underline** — muted-foreground → foreground + underline, 150ms.

Global header: title "Motion", one-line thesis ("quiet, fast, physical"),
reduced-motion toggle, sound toggle (default off). Footer: the opportunity
map — a plain list of every site moment and its assigned pattern (sections
1–8 cross-referenced + wheel physics, identity-panel morph, social popover
morph, cover flow as "separate tickets, same tokens").

## Visual language of the demo page itself

Stone palette light theme, our radii (12/15/21), Raised cards with the
1px ring + smooth shadow, sentence case, system font stack (note in the
footer: type is a stand-in for Aeonik Pro). It should look like OUR site,
not like a codepen. Page background stone-100, cards white.

## Verify

`node --check` equivalent for inline JS is not available — instead open the
file in headless Chrome (`--dump-dom` probe like the wheel round) and assert
no console errors and that all 8 stages mounted. Report: what the skill
install yielded, recipes lifted vs recreated, any deviation, and the checks.
