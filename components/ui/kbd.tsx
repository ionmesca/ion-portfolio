import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Kbd — an inline keycap.
 *
 * Geometry comes from the live Figma component 11:1595: fill `muted`, label
 * `kbd-foreground` at the `text-small` step (13), 4px horizontal padding,
 * `rounded-sm` (the 9px token step).
 *
 * The 23px height and matching min-width are the one raw pair here: 23 is the
 * keycap's line-box in Figma — measured, not derived from any scale — and the
 * min-width keeps a single glyph like `⌘` square instead of pinched.
 *
 * `label` names a symbol keycap for screen readers: `<Kbd label="Command">⌘</Kbd>`
 * announces "Command" instead of the glyph, which most screen readers either
 * skip or read as "place of interest sign". Give every symbol cap a label;
 * letter caps like `K` need none.
 *
 * No `select-none`: a shortcut is text a reader may legitimately want to copy.
 */
function Kbd({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"kbd"> & { label?: string }) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        // Figma Kbd component height — keycap line-box, measured not derived.
        "inline-flex h-[23px] min-w-[23px] shrink-0 items-center justify-center",
        "rounded-sm px-1",
        // 13px = the `text-small` step, measured off Figma 11:1595. Written as
        // an explicit length rather than the bare `text-small` class because
        // tailwind-merge reads `text-small` as a COLOUR utility (it cannot know
        // `small` is a size), so in cn() it would strip `text-kbd-foreground`
        // and the keycap label would fall back to the inherited colour.
        "bg-muted text-[length:var(--text-small)] text-kbd-foreground",
        "font-sans align-middle",
        className
      )}
      {...props}
    >
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </kbd>
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
