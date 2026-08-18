"use client"

import * as React from "react"
import Link from "next/link"

import type { ArticleEntry, CollectionEntry } from "@/content/collections"
import { ArrowRight, ArrowUpRight } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { InstallChip } from "./install-chip"
import { usePreviewAnchor } from "./preview-popover"

/* ----------------------------------------------------------------------------
   THE COLLECTION ROW — Figma component set 20:1030 (+ 20:1291, the article
   flavour). One shape, four variants, and the rulebook's first line:

     h48 · radius 12 (`rounded-md`) · pad H 12 · gap 12
     icon 20 (radius 6, raw) · name Subhead foreground
     one-liner Body muted-foreground, TRUNCATING · ↗ 16 muted at the far right

   "One line per item" is a rule, not a side effect: a collection row never
   wraps and never grows. Everything else a reader might want lives in the
   preview.

   HOVER SNAPS, LEAVE EASES. Background to `muted` in 0ms, back over 150ms —
   the system-wide convention (motion-system-spec principle 5), same technique
   as the Button and the section wheel. `data-active` holds the same fill while
   this row's preview card is open, including when the pointer has walked into
   the card itself.

   ── ROW-ACTION SIGNATURES (Ion, 2026-08-18) ────────────────────────────────

   "The navigation is not really clear." Every row now says what it will do
   BEFORE it is clicked, and it says it with the same glyph in the same place —
   the far right, muted at rest, foreground on hover:

     →   ArrowRight     goes somewhere on this site (article rows)
     ↗   ArrowUpRight   leaves for another site, in a new tab (stack rows,
                        "Skills I use" rows, the group header's GitHub link)
     chip                copies an install command; does not navigate at all
                        (Ion's own skills — already the clearest of the three,
                        and unchanged)

   There is NO fourth state. A row with no affordance would be a row a reader
   has to click to discover, which is the complaint. The article row used to be
   exactly that: no glyph, `href="#"`, and a click handler that cancelled
   itself. It is a real internal link now.

   The distinction is the point, not the decoration: ↗ has always meant "you
   are leaving" on this site, so giving internal rows the SAME arrow would have
   made both meaningless. The two glyphs are declared together in lib/icons.ts.
   ------------------------------------------------------------------------- */

/** The far-right affordance glyph, both arrows. Colour only — the row's own
 *  fill is the movement, and a second moving part in a 48px row is noise.
 *  Same snap-in / ease-out timing as everything else in the pattern.
 *
 *  `stroke-width: 1.5` is the icon contract (token-contract.md 3.9,
 *  lib/icons.ts). It was MISSING here: the row is not a `<Button>`, so nothing
 *  was setting it and the ↗ rendered at lucide's default 2 — half a pixel
 *  heavier than every other icon on the site. Fixed rather than matched,
 *  because the two arrows have to read as one family for the distinction
 *  between them to mean anything. Flagged in the report as a visible change to
 *  an already-shipped glyph. */
const AFFORDANCE = cn(
  "size-4 shrink-0 text-muted-foreground [&]:[stroke-width:1.5]",
  "[transition-property:color]",
  "[transition-duration:var(--duration-fast)]",
  "[transition-timing-function:var(--motion-glide)]",
  "group-hover:text-foreground group-hover:[transition-duration:0ms]",
  "group-data-[active=true]:text-foreground"
)

const ROW = cn(
  "group flex h-12 items-center gap-3 rounded-md px-3",
  "[transition-property:background-color]",
  "[transition-duration:var(--duration-fast)]",
  "[transition-timing-function:var(--motion-glide)]",
  "hover:bg-muted hover:[transition-duration:0ms]",
  "data-[active=true]:bg-muted data-[active=true]:[transition-duration:0ms]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
)

/**
 * A Stack / Agents & skills row.
 *
 * Three shapes come out of one component, exactly as the Figma props do:
 *   `credit`  adds the "by <author>" Caption (Skills I use).
 *   `install` replaces the ↗ with the install chip (Mine) — and takes the
 *             href away with it: those rows do not navigate, they copy.
 *   neither   the plain tool row (Stack).
 */
export function CollectionRow({
  entry,
  previewKey,
}: {
  entry: CollectionEntry
  previewKey: string
}) {
  const { attach, active, handlers } = usePreviewAnchor(previewKey)

  const inner = (
    <>
      {/* The brand mark. PLACEHOLDER: the frame draws a muted 20x20 stand-in
          (20:1017) for every row, because the real marks are art Ion has not
          picked yet. Radius 6 is raw and concentric with the row's 12 — the
          same documented allowance as the landing's project icons. */}
      <span
        aria-hidden="true"
        className="size-5 shrink-0 rounded-[6px] bg-stone-300 dark:bg-stone-600"
      />

      <span className="text-subhead shrink-0 text-foreground">
        {entry.name}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
        {entry.oneLiner}
      </span>

      {/* The credit is desktop information. At 390 it costs ~90px and the
          one-liner — the row's actual description — pays for it. Hidden below
          `sm`; flagged, because no frame rules a mobile collection page. */}
      {entry.credit && (
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {entry.credit}
        </span>
      )}

      {entry.install ? (
        <InstallChip name={entry.install} />
      ) : (
        <ArrowUpRight aria-hidden="true" className={AFFORDANCE} />
      )}
    </>
  )

  // An install row is not a link. Its only click target is the chip, so the row
  // itself is a plain element that happens to be a preview anchor — and it
  // still takes focus, so a keyboard reader can open the preview and reach the
  // chip inside it.
  if (entry.install || !entry.href) {
    return (
      <div
        ref={attach}
        data-active={active}
        tabIndex={0}
        className={ROW}
        {...handlers}
      >
        {inner}
      </div>
    )
  }

  return (
    <a
      ref={attach}
      href={entry.href}
      target="_blank"
      rel="noreferrer"
      data-active={active}
      className={ROW}
      {...handlers}
    >
      {inner}
    </a>
  )
}

/**
 * An article row — Figma 20:1291.
 *
 * The iconless flavour, ratified in the lab: no 20px mark (there is no brand to
 * stand in for, and an avatar would make the list louder than the writing), no
 * one-liner. Title Subhead, then the date in the palette's shortcut position.
 * Articles go inward, so the row is quieter than a Stack row.
 *
 * TWO CHANGES FROM THE FRAME, both from Ion's 2026-08-18 ruling:
 *
 *   the link    real. `next/link` to `/articles/<slug>`, and the row is
 *               keyboard-reachable and prefetched like any other internal
 *               navigation. It used to be `href="#"` with a click handler that
 *               swallowed the click, because there was no detail page.
 *   the arrow   a trailing `→`. The frame draws no glyph here — deliberately,
 *               to keep the list quiet — but "quiet" turned into "you cannot
 *               tell this is a link". `→` is the smallest thing that says
 *               "this goes somewhere", and it says "somewhere HERE", which the
 *               ↗ on every other page explicitly does not.
 *
 * The date sits BEFORE the arrow, so both row families read the same way left
 * to right: what it is, what you need to know about it, what will happen.
 */
export function ArticleRow({
  entry,
  previewKey,
}: {
  entry: ArticleEntry
  previewKey: string
}) {
  const { attach, active, handlers } = usePreviewAnchor(previewKey)

  return (
    <Link
      ref={attach}
      href={entry.href}
      data-active={active}
      className={ROW}
      {...handlers}
    >
      <span className="text-subhead min-w-0 flex-1 truncate text-foreground">
        {entry.title}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {entry.date}
      </span>
      <ArrowRight aria-hidden="true" className={AFFORDANCE} />
    </Link>
  )
}
