"use client"

import * as React from "react"
import { LazyMotion } from "motion/react"

/* ============================================================================
   MotionProvider — the one place the Motion runtime is switched on.

   KEEPING THE BUNDLE HONEST is a condition of the adoption (Ion, 2026-08-18).
   Two rules do it, and both are enforced here:

     1. `features` is a FUNCTION, not the `domAnimation` object. Motion only
        fetches the animation engine after hydration, in its own chunk, so the
        landing route's first-load JS does not carry it.
     2. `strict` makes the bare `motion.*` components throw. Everything under
        this provider must use `m.*`, which is the shell that stays small.

   Until the chunk lands, `m` elements render their resting styles with no
   animation — correct, just not yet animated. The one thing under this provider
   is the mobile indicator, which is `opacity: 0` at rest anyway, so there is
   nothing to catch mid-flight.
   ========================================================================== */

const loadFeatures = () =>
  import("./motion-features").then((mod) => mod.default)

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
