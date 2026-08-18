"use client"

import * as React from "react"

/* ============================================================================
   MOTION — the spring shelf.

   Ion overturned the "no animation library" line for MICRO-INTERACTIONS on
   2026-08-18, pointing at interior.dev's snap carousel: "the animation around
   how the text appears and the bar moves". The Motion library (`motion/react`)
   is now allowed for text swaps, meters, indicators and carousels ONLY. The
   landed vanilla systems — the ⌘K zero-jump morph, the landing document-scroll
   wheel, the CSS hover lanes — are verified and STAY VANILLA.

   THE CONSTANTS ARE NOT INVENTED. They are interior.dev's own families, read
   from the shadcn registry payload https://www.interior.dev/r/snap-carousel.json
   (kept as reference only — see the report; it never entered the build path):

     CELL      stiffness 520  damping 34  mass 0.45   its pill indicator
     CROSSFADE stiffness 260  damping 34  mass 0.8    its slide scale/opacity
     WALL      stiffness 700  damping 30  mass 0.5    its rubber-band wall

   HOW THEY MAP HERE. The carousel splits its motion in two: the READOUT (the
   pill that reports which slide you are on) snaps on CELL, while the CONTENT
   (the slide itself) settles on CROSSFADE. The mobile indicator has exactly the
   same two halves, so it takes the same split:

     READOUT   the 2px progress meter and the "n / 5" counter   -> CELL
     CONTENT   the project name + year label                    -> CROSSFADE

   WALL is unused for now: nothing in this system rubber-bands. It is recorded
   so the third family does not get re-derived from scratch later.
   ========================================================================== */

export const SPRING_CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const

export const SPRING_CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const

export const SPRING_WALL = {
  type: "spring",
  stiffness: 700,
  damping: 30,
  mass: 0.5,
} as const

/**
 * The button press/release spring. Ion approved putting the press on a real
 * spring on 2026-08-18, alongside the theme thumb and the copy→check swap.
 *
 * IT IS `SPRING_CELL`, NOT A NEW FAMILY, and the alias is the record of that
 * decision rather than a shortcut. A press is a READOUT: the button reports
 * "I got that" and settles. That is the same job the carousel's pill
 * indicator does, and CELL is interior.dev's own constant for it — so it is
 * reused rather than re-derived, and one fewer number in this file is one
 * fewer number to keep in step with the rest.
 *
 * The numbers also happen to be right for a control, which is worth writing
 * down because it is the thing that would have to change if the alias were
 * ever broken:
 *
 *   ω  = √(k/m)     = √(520 / 0.45)  = 34.0 rad/s   → settles in ~120ms
 *   c_crit = 2√(km) = 2√(520 × 0.45) = 30.6
 *   ζ  = c / c_crit = 34 / 30.6      = 1.11
 *
 * ζ just over 1 is critically damped and a shade past it: the fastest arrival
 * that never crosses its target. A button must not overshoot — growing past
 * its resting size on release reads as a wobble, not as a click — which is the
 * one place a press differs from the CSS `--motion-spring` bezier it replaces,
 * whose 1.56 control point overshoots by design.
 *
 * WHAT THE SPRING BUYS OVER THE BEZIER is the interruption. The CSS transition
 * restarts its curve when the target changes, so a release that lands while
 * the press is still travelling begins again from a standstill and stutters.
 * `createSpring` never resets velocity on `set`, so the button carries its
 * speed through the reversal — see the integrator's note below.
 */
export const SPRING_PRESS = SPRING_CELL

/**
 * The hover-preview card's entrance and exit spring.
 *
 * IT IS `SPRING_CROSSFADE`, NOT A NEW FAMILY, and — like `SPRING_PRESS` above
 * — the alias is the record of the decision rather than a shortcut.
 *
 * Ion ruled on 2026-08-18 that the preview family's INNER SURFACE moves onto
 * the spring shelf. The surface animates scale and opacity together (0.98 → 1
 * plus a 4px rise plus a fade). That is exactly the channel interior.dev puts
 * on CROSSFADE — "its slide scale/opacity", the CONTENT half of the carousel's
 * two-part split, as opposed to the READOUT half CELL drives. A preview card
 * is content: it is the thing being shown, not the control reporting a state.
 * So it takes the content family, unchanged.
 *
 *   ω      = √(k/m)     = √(260 / 0.8)  = 18.0 rad/s
 *   c_crit = 2√(km)     = 2√(260 × 0.8) = 28.8
 *   ζ      = c / c_crit = 34 / 28.8     = 1.18
 *
 * ζ above 1 is overdamped: the card never overshoots its resting size, which
 * matters because this surface carries readable text and a logo. A card that
 * grew past 100% and settled back would read as a wobble.
 *
 * WHAT THE SPRING BUYS OVER THE 200ms GLIDE IT REPLACES is the same thing it
 * bought the button press: the interruption. Crossing a row of social icons
 * fast — enter, leave, enter — used to restart the CSS curve from a standstill
 * on each reversal, so the card stuttered rather than turned around. The
 * integrator below never resets velocity on `set`, so the surface carries its
 * speed through every reversal.
 *
 * ONLY THE SURFACE. The container's anchor-to-anchor rect morph stays on
 * `lib/morph-preview.ts` / `lib/morph.ts` exactly as ratified — CLAUDE.md
 * keeps that system vanilla, and this ruling did not touch it.
 */
export const SPRING_POP = SPRING_CROSSFADE

/** The channel `.hover-pop-inner` reads. Same trick as `--swap-p` and the
 *  morph's `--morph-p`: one JS-owned 0→1 number, every visual lane derived
 *  from it in CSS, so the lanes cannot desynchronise from each other or from
 *  an interruption. See the `.hover-pop-inner` block in app/globals.css. */
export const POP_CHANNEL = "--pop-p"

/** The pressed scale. Matches `active:scale-[0.97]` in components/ui/button.tsx,
 *  which stays in the markup as the no-JS fallback and must not disagree with
 *  the spring about where "pressed" is. */
export const PRESS_SCALE = 0.97

/* ============================================================================
   THE DURATION LADDER, IN JAVASCRIPT.

   `app/globals.css` owns the ratified ladder as custom properties:

     --duration-fast   150ms   colour, opacity, hover feedback
     --duration-base   200ms   size, transform, panel state
     --duration-slow   400ms   entrances, scroll reveals

   THESE ARE THE SAME THREE RUNGS, SPELLED FOR JS, AND THEY EXIST BECAUSE A
   CUSTOM PROPERTY CANNOT BE READ SYNCHRONOUSLY. `getComputedStyle` is a layout
   read: calling it inside a rAF tick or a pointer handler — which is where
   every one of these numbers is needed — forces a style recalculation the
   frame did not budget for, and on a cold first open there may be no attached
   element to read it off at all. So the ladder is duplicated here rather than
   derived, and the duplication is deliberate.

   THE RULE FOR KEEPING THEM IN STEP: globals.css is the source of truth. These
   are its mirror, and the three numbers below are the ONLY place JS is allowed
   to spell them. A raw `400` in a component is what this shelf exists to stop.

   Values are in MILLISECONDS, because every consumer is a `setTimeout`, a
   `Morph.move()` or a rAF ramp. The one exception is `REDUCED_CROSSFADE`
   below, which is handed to `motion/react` and therefore has to be seconds —
   it divides, so there is still only one 150 on this shelf.
   ========================================================================== */

/** ms. `--duration-fast`. Colour, opacity, hover feedback. */
export const D_FAST = 150
/** ms. `--duration-base`. Size, transform, panel state. */
export const D_BASE = 200
/** ms. `--duration-slow`. Entrances, scroll reveals. */
export const D_SLOW = 400

/**
 * The reduced-motion transition. Section 8 of globals.css collapses every CSS
 * transition on the page to 0.01ms; JS-driven motion has to make the same
 * promise itself. The ratified carve-out for a state swap is a 150ms opacity
 * crossfade in place — `--duration-fast`, no travel, no blur, no spring.
 *
 * SECONDS, not ms: this object is handed straight to `motion/react`. It is the
 * one place the ladder is divided rather than read, so `D_FAST` stays the only
 * spelling of 150 on the shelf.
 */
export const REDUCED_CROSSFADE = { duration: D_FAST / 1000, ease: "linear" } as const

/** Travel for a label swap, in px. See mobile-indicator.tsx for why it is 6. */
export const SWAP_TRAVEL = 6

/** The garnish blur, matching `--blur-garnish`. */
export const SWAP_BLUR = 2

/**
 * ms. When an entrance's animation classes are dropped.
 *
 * THE CLASS-DROP RULE (rule 4, components/landing/intro-reveal.tsx). An
 * entrance holds a `backwards` fill so late groups stay hidden through their
 * delay, and a filling animation keeps its element a stacking context for as
 * long as it is applied — a stacked project row paints over the open ⌘K panel,
 * a stacked reading column paints over the collections' hover previews. So the
 * classes come off once the show is over. The final frame is the settled page,
 * so the drop is invisible.
 *
 * The number is the ceiling plus slack: every entrance on this site ends at
 * `--duration-slow` (400ms), and 300ms of slack covers a busy main thread.
 * Written as that sum rather than as `700`, so the sentence above and the
 * expression below cannot drift apart.
 *
 * IT LIVES HERE, not next to either choreography, for a reason that is about
 * BYTES and not about tidiness. `app/template.tsx` is the one client component
 * that every route now loads, and it needs this constant. Importing it from
 * intro-reveal.tsx pulled that module's `cn` — clsx plus tailwind-merge, 8.6KB
 * gz — onto routes that had no client JavaScript at all (`/dev`, the 404).
 * Measured, not assumed. A shared constant belongs in the leaf both sides can
 * reach, and the motion shelf is that leaf.
 */
export const ENTRANCE_TEARDOWN = D_SLOW + 300

/* ============================================================================
   THE SAME SPRINGS, WITHOUT THE LIBRARY.

   Ion ruled on 2026-08-18 that the theme-segment thumb and the copy→check icon
   swap must land on real springs — the thumb was tweening translateX on a
   glide and creeping, and a fast double-copy stuttered because a CSS
   transition restarts rather than carries.

   WHY NOT `motion/react` HERE. CLAUDE.md's bundle rule is LazyMotion + `m.` +
   a proven split point. The mobile indicator has that split point: it is
   `next/dynamic`'d behind a mobile gate, so its Motion chunk never touches the
   desktop route. These two do not. The thumb lives in `theme-segment.tsx`,
   which the ⌘K palette imports statically, and the palette is on `/` — the
   route the whole portfolio is judged by. Measured on this build (see the
   report): pulling `m` + `LazyMotion` into `/`'s first load cost more than the
   ~3KB gz the ruling allows, so the escape hatch was taken.

   WHAT IS SHARED AND WHAT IS NOT. The CONSTANTS above are still the single
   source of truth — `createSpring` reads `stiffness`, `damping` and `mass` off
   the very same `SPRING_CELL` object `motion/react` would have been handed.
   Only the integrator is ours. If the split point ever arrives, swap the
   driver and the feel does not move.

   THE INTEGRATOR. Semi-implicit (symplectic) Euler on a FIXED sub-step:

     a = (−k·(x − target) − c·v) / m      v += a·h      x += v·h

   Fixed sub-steps and not the frame's own dt, because at stiffness 520 a
   dropped frame is a divergent step: `h` must stay well under 1/ω = 29ms and a
   120Hz display, a 60Hz display and a tab that just came back must all produce
   the same curve. `MAX_FRAME` throws away anything longer than four frames
   rather than integrating a two-second gap.

   VELOCITY IS NEVER RESET on `set()`. That is the entire point: light → dark →
   light in 80ms carries the thumb's speed through the reversal instead of
   restarting from standstill, which is what a CSS transition cannot do.
   ========================================================================== */

export type SpringConstants = {
  stiffness: number
  damping: number
  mass: number
}

/** Integration sub-step, seconds. 240Hz — comfortably stable at k = 700. */
const SPRING_STEP = 1 / 240
/** Longest frame we will integrate. Beyond this the tab was not on screen. */
const SPRING_MAX_FRAME = 0.064

export type SpringDriver = {
  /** Aim at `next`. Keeps the current position AND velocity. */
  set: (next: number) => void
  /** Jump to `next` and stop. Reduced motion, first paint, unmount-safe. */
  snap: (next: number) => void
  stop: () => void
  value: () => number
  velocity: () => number
}

export function createSpring(
  { stiffness, damping, mass }: SpringConstants,
  paint: (value: number) => void,
  initial = 0,
  /** How close counts as arrived, in the channel's own units. */
  epsilon = 0.002
): SpringDriver {
  let x = initial
  let v = 0
  let target = initial
  let raf = 0
  let last = 0

  const frame = (now: number) => {
    raf = 0
    let dt = (now - last) / 1000
    last = now
    if (!(dt > 0)) dt = SPRING_STEP
    if (dt > SPRING_MAX_FRAME) dt = SPRING_MAX_FRAME

    for (let t = dt; t > 0; ) {
      const h = t > SPRING_STEP ? SPRING_STEP : t
      t -= h
      const a = (-stiffness * (x - target) - damping * v) / mass
      v += a * h
      x += v * h
    }

    if (Math.abs(x - target) < epsilon && Math.abs(v) < epsilon) {
      x = target
      v = 0
      paint(x)
      return
    }
    paint(x)
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (raf) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  return {
    set(next) {
      if (next === target && !raf) return
      target = next
      start()
    },
    snap(next) {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      target = next
      x = next
      v = 0
      paint(x)
    },
    stop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
    value: () => x,
    velocity: () => v,
  }
}

/** Section 8 of globals.css collapses every CSS transition to 0.01ms under
 *  reduced motion; a JS-driven spring has to make the same promise itself, and
 *  it makes it by snapping. Read per `set`, not cached — the OS setting can
 *  change while the page is open. */
export function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return false
  }
}

/**
 * Drive one element's style off a spring.
 *
 * Returns a CALLBACK REF — `ref={attach}` — for the same reason
 * `useMorphPreview` does: reading a ref object through a property during
 * render is what `react-hooks/refs` forbids, and the driver has to be built
 * against the node the moment it arrives so the resting style is painted in
 * the commit, before the browser's first paint. Nothing here re-renders: the
 * spring writes to `element.style` directly, so a 400-frame settle costs React
 * nothing.
 *
 * The FIRST target is snapped, never sprung — a control must not animate into
 * existence on mount.
 */
export function useSpringStyle<E extends HTMLElement>(
  constants: SpringConstants,
  target: number,
  paint: (el: E, value: number) => void,
  epsilon?: number
): (el: E | null) => void {
  const paintRef = React.useRef(paint)
  React.useEffect(() => {
    paintRef.current = paint
  })

  const driverRef = React.useRef<SpringDriver | null>(null)
  const targetRef = React.useRef(target)
  const mountedRef = React.useRef(false)

  const attach = React.useCallback(
    (el: E | null) => {
      driverRef.current?.stop()
      driverRef.current = null
      if (!el) return
      const driver = createSpring(
        constants,
        (value) => paintRef.current(el, value),
        targetRef.current,
        epsilon
      )
      driverRef.current = driver
      driver.snap(targetRef.current)
    },
    [constants, epsilon]
  )

  React.useEffect(() => {
    targetRef.current = target
    const driver = driverRef.current
    if (!driver) return
    if (!mountedRef.current) {
      mountedRef.current = true
      driver.snap(target)
      return
    }
    if (prefersReducedMotion()) driver.snap(target)
    else driver.set(target)
  }, [target])

  React.useEffect(() => () => driverRef.current?.stop(), [])

  return attach
}

/** The channel name the copy→check recipe reads. See `.icon-swap` in
 *  app/globals.css section 6 — the same trick as the morph's `--morph-p`:
 *  one JS-owned 0→1 number, every visual lane derived from it in CSS, so the
 *  lanes cannot desynchronise from each other or from an interruption. */
export const SWAP_CHANNEL = "--swap-p"
