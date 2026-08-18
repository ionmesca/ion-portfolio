import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Kbd — an inline keycap.
 *
 * Metrics measured off the Figma palette export
 * (`docs/design/reference/palette-light-p9.png`, the `esc` chip):
 * fill `muted`, label `kbd-foreground` at `text-xs` (12), 20px tall,
 * 20px minimum width, 6px horizontal padding.
 *
 * The 6px radius is RAW on purpose: the radius scale is derived from one
 * `--radius` knob and its smallest step is `rounded-sm` (9px), which is too
 * round for a 20px chip. 6px matches the Figma component. Documented here so
 * it does not read as an escape from the token system.
 */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 select-none items-center justify-center",
        "rounded-[6px] px-1.5", // 6px radius — documented raw, see above.
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
