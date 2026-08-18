import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Kbd — an inline keycap.
 *
 * Geometry comes from the live Figma component 11:1595: fill `muted`, label
 * `kbd-foreground` at `text-xs` (12), 4px horizontal padding, `rounded-sm`
 * (the 9px token step).
 *
 * The 23px height and matching min-width are the one raw pair here: 23 is the
 * keycap's line-box in Figma — measured, not derived from any scale — and the
 * min-width keeps a single glyph like `⌘` square instead of pinched.
 */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        // Figma Kbd component height — keycap line-box, measured not derived.
        "inline-flex h-[23px] min-w-[23px] shrink-0 select-none items-center justify-center",
        "rounded-sm px-1",
        "bg-muted text-xs text-kbd-foreground",
        "font-sans align-middle",
        className
      )}
      {...props}
    />
  )
}

/**
 * KbdGroup — a multi-key shortcut.
 *
 * A shortcut is always a row of sibling keycaps, never one wide chip:
 * `⌘ ⇧ C` is three `Kbd`s, not a single "⌘⇧C". The 2px gap is a documented
 * exception to the spacing convention in token-contract.md 3.8 — the keycaps
 * have to read as one cluster.
 */
function KbdGroup({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
