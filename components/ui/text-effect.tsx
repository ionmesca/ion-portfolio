"use client"

import * as React from "react"

import {
  INTRO_DELAY,
  type IntroGroup,
  useIntroReveal,
} from "@/components/landing/intro-reveal"
import { cn } from "@/lib/utils"

/* ============================================================================
   TextEffect — text resolving out of blur, one unit at a time.

   Ion's reference is motion-primitives' `TextEffect` with the blur preset:
   every unit starts at `blur(10px)` with `brightness(0)` and no opacity, and
   resolves to clear over 400ms, each one ~10ms behind the last. This is that
   variant, rebuilt.

   WHY REBUILT AND NOT IMPORTED. `TextEffect` imports `motion/react`. CLAUDE.md
   ratifies Motion for micro-interactions, but only behind a proven split point
   — and the hero is on `/`, the route the whole portfolio is judged by, with
   no split point available to it. The measured cost of putting Motion on the
   desktop-critical path is +41.4KB gz against a ~3KB gz allowance; lib/motion.ts
   records the same measurement and the same escape hatch for the theme thumb.
   What the library would have bought here is a variant system and a stagger
   scheduler. What this needs is two keyframes and a delay ladder, and CSS has
   both. See the report for the before/after bytes.

   ENTRANCE, NEVER A LOOP. This is the hero group's arrival inside the landing
   choreography (components/landing/intro-reveal.tsx), which is why the base
   delay is a GROUP NAME and not a number of this component's own: the hero
   starts when the choreography says it starts, and moving the group moves the
   text with it.

   THE CLOCK.

     unit duration   400ms          motion-primitives' own figure
     unit step        10ms          `--text-effect-step`, likewise
     headline base    50ms          INTRO_DELAY.hero
     sub-line base    75ms          hero + `--stagger-group`, so the headline
                                    leads its own sub-line by half a beat

   The headline is 17 characters, so its last unit STARTS at 50 + 16×10 = 210ms.
   The sub-line is 16 words, so its last unit starts at 75 + 15×10 = 225ms —
   inside the 250ms at which the landing's own last group starts, which is what
   `--duration-slow` caps. The 400ms tail after that is the blur clearing, and
   the eye does not wait on it. Everything is settled by 625ms, comfortably
   inside the 700ms class-drop (rule 4, intro-reveal.tsx) that removes these
   animations wholesale once the show is over.

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

type Base = {
  /** The string to split. In `char` mode it is also the accessible name. */
  text: string
  as?: "h1" | "h2" | "p" | "span"
  /** Which group of the landing choreography this text arrives with. */
  group: IntroGroup
  /** ms on top of the group's delay. */
  offset?: number
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
  offset = 0,
  className,
  children,
}: CharProps | WordProps) {
  const intro = useIntroReveal()

  // SPACES ARE NOT UNITS. They are emitted as plain text nodes between the
  // spans, never inside them. Two reasons, and the second is the load-bearing
  // one: a space has no ink, so blurring it is work with nothing to show for
  // it; and a space left in normal flow means the line still breaks exactly
  // where the un-split text broke. The sub-line's wrap width is a measured
  // Figma number (255px, breaking after "heart," and after "and") — the
  // entrance is not allowed to move it.
  const parts = React.useMemo(
    () => (per === "word" ? text.split(/( )/) : [...text]),
    [text, per]
  )

  const hidden = per === "char"
  let index = 0

  /* THE SPLIT IS TORN DOWN WITH THE ANIMATION, not left behind.

     Splitting a string into spans breaks the text shaping run, and the browser
     then rasterises a handful of glyphs a subpixel differently — measured
     against the pre-split landing, 0.05% of the 1512x982 frame, max channel
     delta 62, all of it inside these two lines. Nothing about the layout moves:
     the wrap points, the line boxes and the colours are identical. But "at rest
     the page is exactly what it was" is a promise worth keeping exactly, and
     the split has no job once the show is over.

     So it goes when the classes go, on the same 700ms clock (rule 4,
     intro-reveal.tsx). What is left is the markup that was here before this
     component existed: one text node, no spans, and — the part that matters
     most — no `aria-label` and no `aria-hidden` subtree. The accessibility
     workaround only exists for as long as the thing it works around does.

     With JavaScript off, `play` never flips and the split simply stays. That is
     correct: the CSS entrance is still the only entrance, and it needs its
     units. */
  if (!intro.play) {
    return (
      <Tag className={className}>
        {text}
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={cn(className, intro.play && "text-effect")}
      style={
        intro.play
          ? ({
              "--intro-delay": `${INTRO_DELAY[group] + offset}ms`,
              "--text-effect-step": `${STEP}ms`,
            } as React.CSSProperties)
          : undefined
      }
      // char mode hides the split from assistive tech and restates the string.
      // word mode does not need to: the units read as the sentence they are.
      aria-label={hidden ? text : undefined}
    >
      {parts.map((part, i) =>
        part === " " ? (
          " "
        ) : (
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
          in `word` mode, where nothing is `aria-hidden`. */}
      {children !== undefined && (
        <span data-unit="" style={{ "--unit-index": index } as React.CSSProperties}>
          {children}
        </span>
      )}
    </Tag>
  )
}
