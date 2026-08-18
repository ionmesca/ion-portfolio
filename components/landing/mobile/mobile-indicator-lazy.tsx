"use client"

import dynamic from "next/dynamic"

/* ============================================================================
   The indicator's code split.

   KEEPING THE BUNDLE HONEST was the condition on adopting Motion (Ion,
   2026-08-18). Measured on this branch, the Motion runtime is ~43KB gzipped —
   too much to put in the landing route's first-load JS for one bar, especially
   since desktop renders the mobile tree only to hide it at `lg`.

   The split is free here because of what the indicator IS: absent at rest, by
   design (POR-22). It cannot be seen until the first card slides under the top
   bar, which is several hundred pixels of scrolling after paint. Arriving one
   network round-trip late costs nothing a person can perceive.

   `ssr: false` because there is nothing to server-render: the bar is
   `opacity: 0` until the controller reveals it, and its one accessibility
   surface — the "n / 5" live region — has nothing to announce before a scroll
   has happened.

   LazyMotion inside the chunk (components/ui/motion-provider.tsx) is the second
   half of the same promise: `m.` components, features fetched on demand.
   ========================================================================== */

export const MobileIndicator = dynamic(
  () => import("./mobile-indicator").then((mod) => mod.MobileIndicator),
  { ssr: false }
)
