"use client"

import * as React from "react"

import { ICON_STROKE } from "@/lib/icons"
import { SPRING_CELL, SWAP_CHANNEL, useSpringStyle } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * IconSwap — the catalog's icon-swap recipe, as one element.
 *
 * Two glyphs stacked in one box: the resting one scales down to .6 and blurs
 * out, the arriving one scales up from .6 and sharpens. Ratified in
 * `docs/design/motion-lab.html`; the ⌘K palette's "Copy email" row was the
 * first consumer, the collection pages' install chip the second, the mobile
 * menu the third.
 *
 * WHY IT IS A COMPONENT NOW. It used to be six lines of JSX copied into three
 * files, which was survivable while the recipe was a pure CSS transition.
 * On 2026-08-18 Ion ruled it onto a real spring, and a spring needs a DRIVER
 * attached to a real node — three hand-wired drivers is three chances to leave
 * one out and ship a check that never fades in.
 *
 * HOW IT RUNS. `SPRING_CELL` (lib/motion.ts, interior.dev's own pill-indicator
 * family) integrates one 0→1 number and writes it to `--swap-p` on this cell.
 * Every visual lane — opacity, scale, blur, both directions — is derived from
 * that one number in CSS (`.icon-swap`, globals.css section 6). Two
 * consequences, and they are the reason for the whole design:
 *
 *   · the lanes cannot desynchronise, because there is only one clock;
 *   · an interruption CARRIES. A second copy 80ms into the first does not
 *     restart the swap from wherever CSS had got to — the spring keeps its
 *     velocity through the reversal, which is exactly the stutter Ion called
 *     out on a fast double-copy.
 *
 * Under reduced motion the spring snaps and the stylesheet's carve-out turns
 * the swap back into the ratified 150ms opacity crossfade in place.
 *
 * SIZE lives on `className` (`size-4` in the palette, `size-3.5` in the install
 * chip); the glyphs fill the cell.
 */
export function IconSwap({
  on,
  from: From,
  to: To,
  className,
  iconClassName = "text-muted-foreground",
}: {
  /** False shows `from`, true shows `to`. */
  on: boolean
  /** `React.ElementType`, not a narrow `ComponentType`: the two glyphs are
   *  handed `data-on` and `data-dir`, and React's own prop types only allow
   *  `data-*` through on host elements, never through a component type. */
  from: React.ElementType
  to: React.ElementType
  className?: string
  iconClassName?: string
}) {
  const attach = useSpringStyle<HTMLSpanElement>(
    SPRING_CELL,
    on ? 1 : 0,
    (el, p) => el.style.setProperty(SWAP_CHANNEL, String(p))
  )

  return (
    <span
      ref={attach}
      data-slot="icon-swap-cell"
      className={cn("relative block shrink-0", className)}
    >
      <From
        data-on={!on}
        data-dir="out"
        className={cn("icon-swap absolute inset-0 size-full", iconClassName)}
        strokeWidth={ICON_STROKE}
      />
      <To
        data-on={on}
        data-dir="in"
        className={cn("icon-swap absolute inset-0 size-full", iconClassName)}
        strokeWidth={ICON_STROKE}
      />
    </span>
  )
}
