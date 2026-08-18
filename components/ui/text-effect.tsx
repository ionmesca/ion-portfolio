"use client"

import * as React from "react"

import {
  INTRO_DELAY,
  type IntroGroup,
} from "@/components/landing/intro-reveal"
import { D_SLOW } from "@/lib/motion"
import { cn } from "@/lib/utils"

/* ============================================================================
   TextEffect — text resolving out of blur, one unit at a time.

   Ion's reference is motion-primitives' `TextEffect` with the blur preset:
   every unit starts at `blur(10px)` with no opacity and resolves to clear over
   400ms, each one ~10ms behind the last. This is that variant, rebuilt.

   WHY REBUILT AND NOT IMPORTED. `TextEffect` imports `motion/react`. CLAUDE.md
   ratifies Motion for micro-interactions, but only behind a proven split point
   — and the hero is on `/`, the route the whole portfolio is judged by, with no
   split point available to it. lib/motion.ts already records +41.4KB gz for the
   theme thumb; rather than quote it, the counterfactual was BUILT: this file
   rewritten with `motion/react` and `motion.span` per unit, then reverted.

     /  first-load JS, gz     223.13  before this wave
                              224.37  this file, in CSS          +1.24
                              270.97  this file, on motion/react +47.84

   Against a ~3KB gz allowance, the library is roughly fifteen times the budget
   for this one effect. What it would have bought is a variant system and a
   stagger scheduler; what this needs is two keyframes and a delay ladder, and
   CSS has both.

   ENTRANCE, NEVER A LOOP. This is the hero group's arrival inside the landing
   choreography (components/landing/intro-reveal.tsx), which is why the base
   delay is a GROUP NAME and not a number of this component's own: the hero
   starts when the choreography says it starts, and moving the group moves the
   text with it.

   ── ROUND 3 (Ion, 2026-08-18): NO COLOUR CHANGE, AND THE LINES STACK ──────

   TWO RULINGS, both about the same complaint — the hero did not read as one
   thing arriving.

   1. THE COLOUR NEVER MOVES. The preset's `from` carried `brightness(0)` on
      top of the blur, so every unit started BLACK and lifted to its real
      colour. Ion sees that lift, worst on the muted sub-line. The brightness
      channel is gone from the keyframe entirely (globals.css section 6): blur
      and opacity only, and a unit's colour at every instant is the colour it
      rests at.

   2. THE TWO LINES ARE SEQUENTIAL, NOT SIMULTANEOUS. The sub-line used to
      start `--stagger-group` (25ms) after the headline, which on a 10ms step
      means it was four characters behind — two sweeps running at once, read as
      one noisy sweep. Now the sub-line's stagger begins one step after the
      headline's LAST unit begins, so the eye follows a single sweep that runs
      to the end of the first line and then starts the second.

      `after` is the prop that says so, and it takes the PRECEDING TEXT rather
      than a number of milliseconds. A hardcoded 210 would be right only for
      the string "Software Designer"; hand it the string and the hand-off
      survives a copy edit. It is measured with the same `units()` the render
      uses, so the two can never disagree about how long the first line is.

      STAGGER TO STAGGER, not resolve to resolve. "The sub-line starts as the
      headline finishes" means the headline has finished HANDING OUT its
      delays, not that its last character has finished resolving 400ms later —
      waiting for that would push the hero past a second and read as a stall.
      The two lines still overlap while they RESOLVE, and that is the point:
      one continuous sweep, with a 400ms tail behind it.

   THE CLOCK.

     unit duration   400ms          motion-primitives' own figure
     unit step        10ms          `--text-effect-step`, likewise
     headline base    50ms          INTRO_DELAY.hero
     sub-line base   210ms          hero + 16 headline units x 10ms

   ── THE TEARDOWN IS THIS COMPONENT'S OWN, AND THAT IS THE POINT ───────────

   The split is torn down when the show is over (see below), and it used to ride
   `useIntroReveal().play` — the 700ms clock that drops the GROUP choreography's
   classes. That clock is `--duration-slow` plus slack, because every group
   entrance on this site ends at 400ms.

   The stacked hero does not. Its last unit starts at 330ms and resolves at
   730ms, past the group clock — and a teardown that lands mid-blur would cut
   the last words of the sub-line from half-resolved to settled in one frame,
   which is exactly the pop rule 4 exists to prevent.

   The wrong fix is to raise the shared constant: `app/template.tsx` tears the
   generic page entrance down on it too, and a filling animation keeps its
   element a stacking context — holding every route's entrance classes 400ms
   longer widens the window in which a project row can paint over the open ⌘K
   panel, which is a bug this repo has already fixed once (commit 6ad3106).

   So this component times its OWN end, from its own arithmetic: last unit start
   + the unit's 400ms + the same 300ms of slack the group clock allows. The
   group choreography's length and the hero sweep's length are two different
   facts and they now live in two different places.

   ── ACCESSIBILITY: WHY THERE ARE TWO SPLIT MODES ──────────────────────────

   `per="char"` puts every character in its own span. A screen reader handed
   that markup can read "S, o, f, t, w, a, r, e" instead of "Software", so the
   spans are `aria-hidden` and the container carries the whole string as its
   accessible name. That is airtight — as long as nothing inside the text needs
   to be reachable.

   The positioning line ends in a real link (the Ledgy mention). An
   `aria-hidden` subtree is not reachable by any assistive technology, and a
   link no one can reach is a bug that no amount of nice motion pays for. So
   `per="word"` exists: word units keep their spaces, a screen reader reads the
   sentence normally, no `aria-hidden` and no `aria-label` are used at all, and
   the link rides along as `children` — one un-split element after the words,
   fully interactive and fully announced.

   The rule this encodes: SPLIT AS COARSELY AS THE CONTENT ALLOWS. Characters
   where the text is inert, words where it is not.

   Reduced motion: the keyframes are only emitted inside
   `prefers-reduced-motion: no-preference` (globals.css section 6), so there is
   no animation to cancel and the text renders settled at first paint. The
   resting style of every unit is the settled style; the animation only holds a
   `backwards` fill in front of it, which means the text is also correct with
   no JavaScript at all.
   ========================================================================= */

/** ms between units. motion-primitives' figure; kept as one number for both
 *  split modes so the sweep reads at the same speed whatever it is cutting. */
const STEP = 10

/**
 * ms. One unit's own resolve, and the number the `.text-effect > [data-unit]`
 * rule in globals.css animates for.
 *
 * `D_SLOW` and not a literal `400`: "a raw 400 in a component is what this
 * shelf exists to stop" (lib/motion.ts). It is the same coincidence
 * `OPEN_MS`/`CLOSE_MS` record — motion-primitives' unit duration and the
 * ratified `--duration-slow` rung are separate decisions that happen to agree
 * on 400, and the alias is where that is written down rather than a claim that
 * they are the same rule.
 */
const UNIT_MS = D_SLOW

/** ms of slack on the teardown, matching `ENTRANCE_TEARDOWN`'s own allowance
 *  for a busy main thread. Spelled here because this component's end is its
 *  own arithmetic, not the group choreography's — see the header. */
const TEARDOWN_SLACK = 300

type Per = "char" | "word"

/** Every piece the render walks, spaces included. */
function split(text: string, per: Per): string[] {
  return per === "word" ? text.split(/( )/) : [...text]
}

/** True for a piece that gets its own span and its own step on the ladder. */
function isUnit(part: string): boolean {
  return part !== " " && part !== ""
}

/**
 * How many units one string contributes.
 *
 * SPACES ARE NOT UNITS. They are emitted as plain text nodes between the
 * spans, never inside them. Two reasons, and the second is the load-bearing
 * one: a space has no ink, so blurring it is work with nothing to show for it;
 * and a space left in normal flow means the line still breaks exactly where the
 * un-split text broke. The sub-line's wrap width is a measured Figma number
 * (255px, breaking after "heart," and after "and") — the entrance is not
 * allowed to move it.
 *
 * EMPTY PARTS ARE NOT UNITS EITHER. `"… at ".split(/( )/)` ends in an empty
 * string, and the old render emitted a span for it — a whole step spent on a
 * unit with no ink, which on the sub-line pushed the Ledgy link 10ms late for
 * nothing.
 *
 * Used by the render AND by the `after` hand-off, so a line's length can never
 * be measured two different ways.
 */
function unitCount(text: string, per: Per): number {
  return split(text, per).filter(isUnit).length
}

type Base = {
  /** The string to split. In `char` mode it is also the accessible name. */
  text: string
  as?: "h1" | "h2" | "p" | "span"
  /** Which group of the landing choreography this text arrives with. */
  group: IntroGroup
  /**
   * The line this one queues behind, if any.
   *
   * Its units are counted and this line's stagger starts one step after the
   * last of them, so the two sweeps run end to end instead of together. Give it
   * the preceding TEXT, not a delay: see the header for why.
   */
  after?: { text: string; per?: Per }
  className?: string
}

/**
 * `char` hides its own subtree from assistive technology, so it cannot hold
 * anything that has to be reachable — `children: never` is that rule stated
 * where the compiler can enforce it, rather than in a comment someone reads
 * after shipping an unreachable link. It also needs an element whose role
 * accepts a name (a heading, not a paragraph), because `aria-label` is what
 * restates the string.
 */
type CharProps = Base & { per?: "char"; children?: never }

/** `word` keeps the text announceable as written, so it may carry children —
 *  one un-split, untouched node after the words. */
type WordProps = Base & { per: "word"; children?: React.ReactNode }

export function TextEffect({
  text,
  as: Tag = "span",
  per = "char",
  group,
  after,
  className,
  children,
}: CharProps | WordProps) {
  const parts = React.useMemo(() => split(text, per), [text, per])

  /** ms from first paint to this line's FIRST unit. */
  const base =
    INTRO_DELAY[group] +
    (after ? unitCount(after.text, after.per ?? "char") * STEP : 0)

  /** How many units this line hands out a delay to — the words, plus the
   *  children node if there is one (it is the last unit, not a passenger). */
  const count =
    parts.filter(isUnit).length + (children !== undefined ? 1 : 0)

  /** ms from first paint to the last pixel of this line settling, plus slack. */
  const endsAt = base + Math.max(0, count - 1) * STEP + UNIT_MS + TEARDOWN_SLACK

  /* THE SPLIT IS TORN DOWN WITH THE ANIMATION, not left behind.

     Splitting a string into spans breaks the text shaping run, and the browser
     then rasterises a handful of glyphs a subpixel differently — measured
     against the pre-split landing, 0.05% of the 1512x982 frame, max channel
     delta 62, all of it inside these two lines. Nothing about the layout moves:
     the wrap points, the line boxes and the colours are identical. But "at rest
     the page is exactly what it was" is a promise worth keeping exactly, and
     the split has no job once the show is over.

     What is left is the markup that was here before this component existed: one
     text node, no spans, and — the part that matters most — no `aria-label` and
     no `aria-hidden` subtree. The accessibility workaround only exists for as
     long as the thing it works around does.

     `false` on the server and on the first client render, so the first paint IS
     the choreography and hydration matches. A fresh mount is a fresh clock,
     which is what makes rule 3 (every arrival replays) true here too —
     `app/template.tsx` re-creates this subtree on every navigation.

     With JavaScript off the timer never fires and the split simply stays. That
     is correct: the CSS entrance is still the only entrance, and it needs its
     units. */
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    const t = window.setTimeout(() => setDone(true), endsAt)
    return () => window.clearTimeout(t)
  }, [endsAt])

  if (done) {
    return (
      <Tag className={className}>
        {text}
        {children}
      </Tag>
    )
  }

  const hidden = per === "char"
  /* The ladder position, advanced only by pieces that get a span. Mutated
     during the map for the same reason it always was: the index a unit gets is
     its position among UNITS, and `parts` also holds the spaces between them. */
  let index = 0

  return (
    <Tag
      className={cn(className, "text-effect")}
      style={
        {
          "--intro-delay": `${base}ms`,
          "--text-effect-step": `${STEP}ms`,
        } as React.CSSProperties
      }
      // char mode hides the split from assistive tech and restates the string.
      // word mode does not need to: the units read as the sentence they are.
      aria-label={hidden ? text : undefined}
    >
      {parts.map((part, i) =>
        part === " " ? (
          " "
        ) : !isUnit(part) ? null : (
          <span
            key={i}
            data-unit=""
            aria-hidden={hidden || undefined}
            style={{ "--unit-index": index++ } as React.CSSProperties}
          >
            {part}
          </span>
        )
      )}
      {/* CHILDREN ARE THE LAST UNIT, not a passenger. Left outside the ladder
          the Ledgy link was the one sharp, fully-opaque thing on the rail while
          the sentence around it was still resolving — it read as a mistake, and
          the probe strip shows exactly that. Wrapping it as a unit joins it to
          the sweep it belongs to. It stays a real link: this branch only runs
          in `word` mode, where nothing is `aria-hidden`.

          The trailing space of POSITIONING is emitted by the map above, in its
          own place in the flow, so "at" cannot run into "Ledgy". */}
      {children !== undefined && (
        <span
          data-unit=""
          style={{ "--unit-index": index } as React.CSSProperties}
        >
          {children}
        </span>
      )}
    </Tag>
  )
}
