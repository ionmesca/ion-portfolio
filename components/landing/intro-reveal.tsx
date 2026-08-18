"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/* ============================================================================
   Intro reveal — the landing's one entrance choreography.

   Ion: "first load has no subtle animation". This is that animation, and it is
   deliberately the smallest thing that reads as an arrival: a fade and a 4px
   rise, group by group down the rail, finished inside 400ms.

     group          delay   what
     chip             0ms   the identity chip / ⌘K slot — FADE ONLY
     hero            50ms   headline + subline
     actions        100ms   Book a call + socials
     rows           150ms   the five project rows, +25ms each (150 → 250)
     media          250ms   the panel stack, arriving with the last row

   Last item starts at 250 and runs for 150 → 400ms end to end, which is
   `--duration-slow`, the motion system's hard ceiling for an entrance.
   50ms between groups is `--stagger-delay`; 25ms inside the row group is
   `--stagger-group` (globals.css section 2). Feel reference: Colin Lienard's
   menu, whose page-load choreography staggers with `backwards` fill at
   0.2s / 0.6s — same idea, our clock.

   THE CHIP ONLY FADES. Its box is owned by the ⌘K morph, which measures the
   chip's atoms and freezes them; a transform on the chip's own wrapper is a
   transform the morph would have to reason about. Opacity is inert to it.

   THREE RULES THIS FILE EXISTS TO KEEP:

   1. NO LAYOUT SHIFT. Opacity and transform only, on wrappers that already
      exist in the flow (or, for the chip, a bare block wrapper that inherits
      its child's size).

   2. WORKS WITHOUT JS. The whole choreography is a CSS animation carried by
      class names, so it plays whether or not React hydrates, and its resting
      state is the settled page. There is no "hidden until JS says so" state
      to get stuck in.

   3. RUNS ONCE. `played` is a module-level flag on the CLIENT bundle only.
      The server always renders the playing markup (so the first paint is the
      choreography and hydration matches), and the flag flips after the first
      mount — so a client-side navigation back to the landing re-renders these
      components with no animation classes at all. It is deliberately NOT
      per-session storage: a real reload is a real arrival.

   4. THE CLASSES LEAVE WHEN THE SHOW ENDS. `fill-mode-both` must stay for the
      pre-delay hold (backwards fill keeps late groups hidden), but a filling
      animation keeps the wrapper a stacking context forever — and a stacked
      wrapper on a project row paints OVER the open ⌘K panel, whose z-40 the
      chip's slot depends on. So after the choreography's 400ms (plus slack)
      the classes are dropped wholesale. The final frame is the settled page,
      so the drop is invisible; it is the same class-drop rule the number
      pop-in ruling established (POR-17: fill-mode traps).

   Reduced motion: every class is `motion-safe:`-gated, so under
   `prefers-reduced-motion` there is no animation-name and the inline delay is
   inert. The page renders settled, instantly — not "settled after 400ms of
   nothing".
   ========================================================================= */

/** ms. Group offsets; see the table above. */
export const INTRO_DELAY = {
  chip: 0,
  hero: 50,
  actions: 100,
  rows: 150,
  media: 250,
} as const

export type IntroGroup = keyof typeof INTRO_DELAY

/** ms. Offset between rows inside the row group (`--stagger-group`). */
export const INTRO_ROW_STEP = 25

/* Static strings — Tailwind reads class names out of the source text, so
   these can never be assembled from parts. The delay is the one per-element
   value, and it rides an inline style for the same reason. */
const RISE =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:fill-mode-both motion-safe:duration-150 motion-safe:ease-glide"

const FADE =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:duration-150 motion-safe:ease-glide"

let played = false

/** ms. When the animation classes are dropped (rule 4): last start (250) +
    duration (150) + generous slack for a busy main thread. */
const INTRO_TEARDOWN = 700

/** True on the server, and on the client from first paint until teardown. */
function usePlayOnce() {
  const [play, setPlay] = React.useState(() =>
    typeof window === "undefined" ? true : !played
  )
  React.useEffect(() => {
    played = true
    if (!play) return
    const t = window.setTimeout(() => setPlay(false), INTRO_TEARDOWN)
    return () => window.clearTimeout(t)
  }, [play])
  return play
}

export type IntroReveal = {
  /** false once the choreography has already run this session. */
  play: boolean
  /** Merge the entrance classes into an element's own. */
  className: (own?: string, mode?: "rise" | "fade") => string | undefined
  /** The element's place in the choreography, in ms from first paint. */
  style: (delay: number) => React.CSSProperties | undefined
}

/**
 * The choreography, for components that already own their elements
 * (the project rows, the media column). Wrappers use `<Reveal>` below.
 */
export function useIntroReveal(): IntroReveal {
  const play = usePlayOnce()

  return React.useMemo(
    () => ({
      play,
      className: (own, mode = "rise") =>
        play ? cn(own, mode === "fade" ? FADE : RISE) : own,
      style: (delay) => (play ? { animationDelay: `${delay}ms` } : undefined),
    }),
    [play]
  )
}

/**
 * A wrapper that joins the choreography — for a Server Component's markup, or
 * for a child whose own box must not be touched (the chip).
 *
 * It takes the GROUP NAME, never a number, and that is not sugar: this module
 * is `"use client"`, so a Server Component importing `INTRO_DELAY` from it
 * gets a client-reference proxy, and `INTRO_DELAY.hero` reads back
 * `undefined`. Naming the group keeps the lookup on the client side of the
 * boundary, where the value actually exists.
 */
export function Reveal({
  group,
  mode = "rise",
  className,
  children,
}: {
  group: IntroGroup
  mode?: "rise" | "fade"
  className?: string
  children: React.ReactNode
}) {
  const intro = useIntroReveal()

  return (
    <div
      className={intro.className(className, mode)}
      style={intro.style(INTRO_DELAY[group])}
    >
      {children}
    </div>
  )
}
