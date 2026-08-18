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
 * The reduced-motion transition. Section 8 of globals.css collapses every CSS
 * transition on the page to 0.01ms; JS-driven motion has to make the same
 * promise itself. The ratified carve-out for a state swap is a 150ms opacity
 * crossfade in place — `--duration-fast`, no travel, no blur, no spring.
 */
export const REDUCED_CROSSFADE = { duration: 0.15, ease: "linear" } as const

/** Travel for a label swap, in px. See mobile-indicator.tsx for why it is 6. */
export const SWAP_TRAVEL = 6

/** The garnish blur, matching `--blur-garnish`. */
export const SWAP_BLUR = 2

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
function prefersReduced() {
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
    if (prefersReduced()) driver.snap(target)
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
