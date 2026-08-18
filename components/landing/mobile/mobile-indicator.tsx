"use client"

import * as React from "react"
import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { MotionProvider } from "@/components/ui/motion-provider"
import {
  REDUCED_CROSSFADE,
  SPRING_CELL,
  SPRING_CROSSFADE,
  SWAP_BLUR,
  SWAP_TRAVEL,
} from "@/lib/motion"
import type { Project } from "@/lib/projects"

import { ProjectIcon } from "../project-icon"
import type { SubscribeToProgress } from "./progress-channel"
import { INDICATOR_H, TOPBAR_H } from "./use-mobile-scroll"

/* ============================================================================
   THE STICKY INDICATOR (Figma 20:605) — now on Motion springs.

   40 tall, 16 gutters, `background`: thumbnail 20 + name Subhead + year Caption
   muted on the left, "n / 5" Caption muted on the right, both counters in
   TABULAR numerals so the digits do not dance as they change. The bar's bottom
   2px is the meter: `border` track, `foreground` fill.

   It is FIXED, not sticky, and it is not in the flow: showing and hiding it
   must never move the cards it is describing. At rest it is ABSENT — that is
   the design, not a missing state. The bar's own arrive/leave (fade + 6px drop)
   stays in CSS, `.mobile-indicator` in globals.css: it is a two-property state
   change on a container and a spring buys it nothing.

   WHAT CHANGED ON 2026-08-18. Ion pointed at interior.dev's snap carousel —
   "the animation around how the text appears and the bar moves" — and lifted
   the no-animation-library rule for micro-interactions. The three moving parts
   inside the bar now run on that carousel's own springs (lib/motion.ts):

     label   name + year, CROSSFADE (260/34/0.8) — the carousel's CONTENT spring
     meter   scaleX fill, CELL (520/34/0.45)     — the carousel's READOUT spring
     counter "n / 5" digit, CELL                 — a readout too, so it snaps
                                                   with the meter, not with the
                                                   name

   THE SPLIT IS THE POINT. In the carousel the pill snaps ahead while the slide
   settles behind it, and that lead is what makes the thing feel answered rather
   than dragged. Here the meter and the digit are the same instrument — they
   report position — so they take the fast spring; the name is content and takes
   the slow one, arriving a beat later.

   TRAVEL IS 6px, NOT 4. The old CSS recipe (`.label-swap`, catalog ruling #4)
   travelled 4px because a 150ms ease has to keep its distance short to stay
   crisp. A spring does not: it decelerates into its rest, so 4px reads as no
   movement at all. 6px is docs/design/mobile-lab.html's own number, which the
   CSS port had deviated from — the spring hands it back. The 2px garnish blur
   survives unchanged.
   ========================================================================== */

/** The digit is one character wide and moves less than the name line does. */
const COUNT_TRAVEL = 4

export function MobileIndicator({
  projects,
  index,
  revealed,
  subscribe,
  meterRef,
}: {
  projects: Project[]
  index: number
  revealed: boolean
  /** Raw scroll progress through the active project, 0..1, per frame. */
  subscribe: SubscribeToProgress
  meterRef: React.RefObject<HTMLSpanElement | null>
}) {
  const reduced = useReducedMotion()
  const count = projects.length

  /* THE METER. `progress` is honest to the scroll position — the controller
     writes it every frame and puts the same number on `data-progress`, which is
     what the POR-22 probes read. The spring is what the EYE gets: it eats the
     per-frame jitter of a finger on a phone without lying about where you are.

     The reset is NOT sprung. A project boundary is a discontinuity in the data,
     not a movement: progress falls 1 -> 0 (or climbs 0 -> 1 scrolling back)
     because a new project started. Left to the spring that reads as a rewind
     animation, so `jump` cuts it and the spring picks up from the new value. */
  const progress = useMotionValue(0)
  const sprung = useSpring(progress, SPRING_CELL)

  // This component is code-split, so it mounts a beat after the controller
  // starts publishing. The channel's FIRST delivery is the value it had been
  // holding — jump to it, so a reader that arrives on an already scrolled page
  // starts at the right fill instead of springing up from zero.
  React.useEffect(() => {
    let seeded = false
    return subscribe((value) => {
      if (seeded) {
        progress.set(value)
        return
      }
      seeded = true
      progress.jump(value)
      sprung.jump(value)
    })
  }, [subscribe, progress, sprung])

  React.useEffect(() => {
    sprung.jump(progress.get())
  }, [index, progress, sprung])

  // Under reduced motion the meter tracks scroll exactly — no spring at all.
  const scaleX = reduced ? progress : sprung

  const swap = reduced ? REDUCED_CROSSFADE : SPRING_CROSSFADE
  const snap = reduced ? REDUCED_CROSSFADE : SPRING_CELL

  return (
    <MotionProvider>
      <div
        data-slot="mobile-indicator"
        data-on={revealed}
        className="mobile-indicator fixed inset-x-0 z-20 flex items-center gap-2 bg-background px-4"
        style={{ top: TOPBAR_H, height: INDICATOR_H }}
      >
        {/* -- the name line ------------------------------------------------
            Every project's line is mounted and which one is `on` is what
            changes, so the swap needs no mount/unmount bookkeeping and no
            AnimatePresence. Direction falls out of POSITION: lines above the
            active one leave upward, lines below arrive from below — which is
            direction-aware in both scroll directions without reading the scroll
            direction, because scrolling back makes the outgoing line the one
            BELOW the active index and it leaves downward on its own. */}
        <div className="relative h-[21px] min-w-0 flex-1">
          {projects.map((project, i) => (
            <m.span
              key={project.id}
              data-slot="mobile-label"
              data-on={i === index}
              aria-hidden={i !== index}
              initial={false}
              animate={labelState(i === index, i < index, reduced)}
              transition={swap}
              className="absolute inset-0 flex items-center gap-2 whitespace-nowrap"
            >
              <ProjectIcon mark={project.mark} size={20} />
              <span className="text-subhead text-foreground">
                {project.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {project.year}
              </span>
            </m.span>
          ))}
        </div>

        {/* -- the counter --------------------------------------------------
            Same stacked trick as the name line, one character wide. The
            invisible digit under the stack is what reserves the box, so the
            "/ 5" never shifts when the numeral changes. */}
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center text-xs text-muted-foreground tabular-nums"
        >
          <span className="relative block w-[1ch] text-right">
            <span className="invisible">{count}</span>
            {projects.map((project, i) => (
              <m.span
                key={project.id}
                data-slot="mobile-count"
                data-on={i === index}
                initial={false}
                animate={countState(i === index, i < index, reduced)}
                transition={snap}
                className="absolute inset-0 block"
              >
                {i + 1}
              </m.span>
            ))}
          </span>
          <span>&nbsp;/&nbsp;{count}</span>
        </span>

        {/* The live region is the COUNTER alone, and now it is its own
            invisible node. Every project's name line is mounted at once (that
            is what makes the swap cheap), so putting `aria-live` on the bar
            would read the whole stack out on every change; "3 / 5" is the one
            honest announcement. */}
        <span aria-live="polite" className="sr-only">
          {index + 1} / {count}
        </span>

        {/* the meter — the bar's bottom edge, not a border under it */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 block h-0.5 bg-border"
        >
          <m.span
            ref={meterRef}
            data-slot="mobile-meter"
            data-progress="0"
            className="block h-full w-full origin-left bg-foreground"
            style={{ scaleX }}
          />
        </span>
      </div>
    </MotionProvider>
  )
}

/** Resting / departed state for one line of the name stack. */
function labelState(on: boolean, above: boolean, reduced: boolean | null) {
  if (on) return { opacity: 1, y: 0, filter: "blur(0px)" }
  // Reduced motion: a crossfade in place. No travel, no blur — the same
  // carve-out globals.css section 8 makes for every CSS swap on the page.
  if (reduced) return { opacity: 0, y: 0, filter: "blur(0px)" }
  return {
    opacity: 0,
    y: above ? -SWAP_TRAVEL : SWAP_TRAVEL,
    filter: `blur(${SWAP_BLUR}px)`,
  }
}

/** Same, for the "n" of "n / 5". No blur: 2px on one glyph is mush. */
function countState(on: boolean, above: boolean, reduced: boolean | null) {
  if (on) return { opacity: 1, y: 0 }
  if (reduced) return { opacity: 0, y: 0 }
  return { opacity: 0, y: above ? -COUNT_TRAVEL : COUNT_TRAVEL }
}
