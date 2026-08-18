"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import {
  createSpring,
  PRESS_SCALE,
  prefersReducedMotion,
  SPRING_PRESS,
  type SpringDriver,
} from "@/lib/motion"

/* ============================================================================
   PressSpring — put a control's press and release on a real spring.

   Ion ruled on 2026-08-18 that the press should ride the same physics as the
   theme thumb and the copy→check swap. The button primitive presses with a CSS
   transition on `scale`, timed with `--motion-spring` — a bezier with "spring"
   in its name. A bezier cannot carry velocity, so a release that arrives while
   the press is still travelling restarts the curve from a standstill, and a
   fast click reads as a stutter rather than as a click. `createSpring`
   (lib/motion.ts) is the integrator that fixes it; this is the component that
   attaches it to a control.

   ── IT IS OPT-IN, AND THAT IS THE POINT ───────────────────────────────────

   Wrapping is a choice made at each call site, because attaching this costs a
   client component and most buttons on this site are rendered from Server
   Components. `components/landing/intro.tsx` renders "Book a call" as a bare
   `<a>` carrying `buttonVariants()` precisely so the intro can stay a Server
   Component — a Button with `asChild` attaches an onClick for its inert guard,
   and a function prop cannot cross the RSC boundary.

   So the fallback is not a fallback that was settled for; it is the design.
   `active:scale-[0.97]` stays on the primitive and keeps working:

     no JavaScript          the CSS press, exactly as before
     JavaScript, unwrapped  the CSS press, exactly as before
     JavaScript, wrapped    the spring, and the CSS lane switched off

   Nothing has to be removed from a call site to adopt this, and nothing breaks
   if it is never adopted.

   ── HOW IT ATTACHES ───────────────────────────────────────────────────────

   Through `Slot`, so it renders NO element of its own: it clones the single
   child element and merges a ref and the pointer handlers into it. That
   matters for a button, whose box is measured and whose `:hover` corridor is
   its own — an extra wrapper `<span>` around a control is an extra box that
   layout, hit-testing and every hover rule would have to agree about.

   The child is usually written in a Server Component. That is fine: what
   crosses the boundary is a React element — a description, not a rendered DOM
   node — and cloning a description on the client is ordinary work.

   THE CHILD MUST CARRY `btn-spring` (globals.css section 6). That class takes
   `scale` out of the primitive's `transition-property` list. Without it there
   are two clocks on one property: a 150ms bezier chasing a value the
   integrator is already rewriting every frame. `class` is the hook rather than
   an inline style because the primitive's own transition is an arbitrary-
   property utility, and tailwind-merge cannot dedupe against those — the
   explicit class is the only thing that reliably sorts last.

   ── WHAT COUNTS AS A PRESS ────────────────────────────────────────────────

   Pointer down presses; pointer up, cancel, and leaving the control release.
   `pointerleave` is in that list because a pointer that goes down on a button
   and travels off it will never deliver `pointerup` there, and a button left
   visually pressed forever is worse than a release that happens a little
   early.

   Keyboard presses too: Space and Enter activate a button, and a keyboard user
   should see the same feedback a mouse user does. `event.repeat` is ignored so
   a held key does not re-press on every autorepeat tick.

   SSR-safe: the spring is built in the callback ref, which runs in the commit
   before the browser paints, and `useSpringStyle` SNAPS its first value rather
   than animating to it — a control must not animate into existence on mount.
   Nothing here touches `window` during render.

   ── NO STATE, AND THAT IS A CORRECTNESS REQUIREMENT ───────────────────────

   The obvious shape for this is `useState(pressed)` fed into `useSpringStyle`.
   It is wrong here, and it fails in a way that is invisible on a slow click and
   destroys the one property the feature exists for.

   `Slot` attaches by CLONING its child and composing refs, and the composed ref
   it hands React is a fresh function on every render. React treats a new ref
   function as a new ref: it detaches the old one (calls it with `null`) and
   attaches the new one. So every re-render of this component tears the driver
   down and builds a new one — at velocity zero, from a snapped position. A
   press that re-renders therefore rebuilds the spring exactly when the release
   is meant to catch it mid-flight, which is precisely the interruption the
   spring was chosen for. Measured in the headless probe before the fix: the
   scale walked 1 → 0.983 and then stopped dead, because the release replaced
   the driver that was carrying it.

   So there is no state. The pointer handlers talk to the driver directly, the
   component renders once, the ref is attached once, and velocity survives every
   reversal. This is the same discipline the rest of this system already keeps —
   "the spring writes to `element.style` directly, so a 400-frame settle costs
   React nothing" (lib/motion.ts) — applied to the input side as well as the
   output side.

   Reduced motion: the media query is re-read on every press, not cached, so a
   setting changed while the page is open takes effect immediately; the driver
   snaps instead of springing. The scale itself stays — it is feedback, not
   decoration, and 3% is not travel.
   ========================================================================= */

export function PressSpring({ children }: { children: React.ReactElement }) {
  const driverRef = React.useRef<SpringDriver | null>(null)
  const elRef = React.useRef<HTMLElement | null>(null)

  const attach = React.useCallback((el: HTMLElement | null) => {
    if (el === elRef.current) return
    driverRef.current?.stop()
    driverRef.current = null
    elRef.current = el
    if (!el) return

    driverRef.current = createSpring(
      SPRING_PRESS,
      // `scale`, not `transform`: `active:scale-[0.97]` compiles to the
      // standalone `scale` property in Tailwind 4, and writing `transform`
      // here would leave that class free to win.
      (value) => {
        el.style.scale = String(value)
      },
      1,
      // 0.0005 of scale is under a tenth of a pixel on a 40px control, so the
      // spring stops when it has visually arrived rather than when the
      // integrator's default 0.002 says so.
      0.0005
    )
    // Snapped, never sprung: a control must not animate into existence. It
    // also writes the inline `scale` immediately, which is what makes the
    // primitive's `active:scale-[0.97]` inert from the first frame instead of
    // winning a frame on the first press.
    driverRef.current.snap(1)
  }, [])

  React.useEffect(() => () => driverRef.current?.stop(), [])

  const to = React.useCallback((value: number) => {
    const driver = driverRef.current
    if (!driver) return
    if (prefersReducedMotion()) driver.snap(value)
    else driver.set(value)
  }, [])

  const press = React.useCallback(() => to(PRESS_SCALE), [to])
  const release = React.useCallback(() => to(1), [to])

  return (
    <Slot.Root
      ref={attach}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.repeat) return
        if (event.key === " " || event.key === "Enter") press()
      }}
      onKeyUp={(event: React.KeyboardEvent) => {
        if (event.key === " " || event.key === "Enter") release()
      }}
      onBlur={release}
    >
      {children}
    </Slot.Root>
  )
}
