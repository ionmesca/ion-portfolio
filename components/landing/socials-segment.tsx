"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { SOCIALS } from "./socials"

/**
 * SocialsSegment — the three profiles, as a Preferences-style row.
 *
 * Ion's ruling, 2026-08-19: "I want the socials to be also its own section,
 * the same way as we have theme and sound… occupying less space." So the
 * palette's standalone row of three 32px icon buttons is gone, and the three
 * destinations now sit on ONE line that reads exactly like Theme and Sound —
 * a lucide glyph and a word on the left, a muted track of cells on the right.
 *
 * ── IT IS THE SEGMENTS' GEOMETRY, NOT A NEW ONE ───────────────────────────
 * 4px padding, 24-tall by 32-wide cells, a 2px gap, radius `md` outside and a
 * raw 8px inside (concentric: 12 outer − 4 pad). Three cells therefore make a
 * 108 x 32 track — the same box as the theme segment, to the pixel, because it
 * is the same control shape holding the same number of cells. Nothing here is
 * measured; every number is read off `theme-segment.tsx`.
 *
 * ── AND IT IS NOT A SEGMENTED CONTROL ─────────────────────────────────────
 * THERE IS NO THUMB. A thumb states a selection, and there is nothing selected
 * here: these are three links, and all three are equally true. Borrowing the
 * thumb would have made the row claim you had picked GitHub.
 *
 * What replaces it is the same picture, one cell at a time: HOVER lifts a cell
 * to `card` on the `muted` track, which is precisely what being the thumb
 * looks like. In dark the two fills invert — a `card` cell on a `muted` track
 * is DARKER than the track — so the hover state takes the same `Subtle` ring
 * POR-34 restored to the thumb, for the same reason: without it the lit cell
 * reads as a hole punched in the control rather than the one raised cell.
 * Snap in, ease out over `--duration-fast`; the token ladder's hover rule, and
 * the one the rail's own social icons already follow.
 *
 * ── KEYBOARD ──────────────────────────────────────────────────────────────
 * A toolbar, and it says so. `role="toolbar"` is what tells assistive tech
 * that ←/→ move inside this line, which is the whole reason the row can hold
 * three destinations and still cost the Tab ring exactly one stop. The roving
 * tabindex is that stop, and it remembers where it was parked.
 *
 * IT DOES NOT WRAP, keeping round 3's ruling for these same three links: three
 * marks are short enough to see in full, so wrapping could only ever surprise
 * someone who pressed → once too often. Stopping at the end is how a toolbar
 * behaves. (The theme segment wraps because a radio ring conventionally does;
 * this is not a radio ring.)
 *
 * `stopPropagation` on ←/→ is load-bearing, exactly as it is in the sound
 * segment: the palette surface swallows those keys for everything outside its
 * own ring, and without this the surface would eat the toolbar's arrows.
 *
 * Enter is the browser's. These are real anchors, so a focused cell opens on
 * Enter with no handler of ours in the way.
 */

/**
 * The glyph size inside a 24px cell.
 *
 * `brand-glyphs.tsx` records why the three marks are not set at one size: at
 * the rail's 20px slot GitHub and LinkedIn fill the box and X sits one step
 * down at 16, because a solid diagonal cross reads heavier than a circle or a
 * plate. That ratio is 0.8, and this row is a 16px slot, so X's share of it is
 * 12.8. 14 is taken rather than 12: at this scale a step the whole way down
 * stops reading as a mark and starts reading as a smudge, and the pairing only
 * ever had to make the three look equal, not measure equal.
 */
const GLYPH: Record<string, string> = {
  GitHub: "size-4",
  X: "size-3.5",
  LinkedIn: "size-4",
}

export function SocialsSegment() {
  /**
   * WHICH CELL THE ROW IS PARKED ON — the roving tabindex's "one".
   *
   * State and not a ref, because the render reads it: exactly one cell carries
   * `tabIndex={0}` and that has to be true in the markup, not applied after.
   */
  const [parked, setParked] = React.useState(0)
  const cells = React.useRef<(HTMLAnchorElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    e.stopPropagation()
    const next = Math.min(
      Math.max(parked + (e.key === "ArrowRight" ? 1 : -1), 0),
      SOCIALS.length - 1
    )
    setParked(next)
    cells.current[next]?.focus()
  }

  return (
    <div
      role="toolbar"
      aria-label="Socials"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className="flex h-8 shrink-0 items-center gap-0.5 rounded-md bg-muted p-1"
    >
      {SOCIALS.map(({ label, href, Glyph }, i) => (
        <a
          key={label}
          ref={(el) => {
            cells.current[i] = el
          }}
          href={href}
          // Every destination here leaves the site, so every one of them opens
          // a tab. That was the open question round 3 left flagged for the
          // palette's outbound rows; it is answered for these three, which are
          // now a toolbar of profiles rather than three commands in a list.
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          tabIndex={i === parked ? 0 : -1}
          onFocus={() => setParked(i)}
          className={cn(
            "grid h-6 w-8 place-items-center rounded-[8px] text-muted-foreground",
            "[transition:background-color_var(--duration-fast)_var(--motion-glide),color_var(--duration-fast)_var(--motion-glide)]",
            "hover:bg-card hover:text-foreground hover:[transition-duration:0ms]",
            "dark:hover:[box-shadow:var(--elevation-subtle)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          )}
        >
          <Glyph className={GLYPH[label]} />
        </a>
      ))}
    </div>
  )
}
