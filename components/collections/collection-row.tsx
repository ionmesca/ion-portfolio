"use client"

import * as React from "react"

import type { ArticleEntry, CollectionEntry } from "@/content/collections"
import { ArrowUpRight } from "@/lib/icons"
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
   ------------------------------------------------------------------------- */

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
        <ArrowUpRight
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            "[transition-property:color]",
            "[transition-duration:var(--duration-fast)]",
            "[transition-timing-function:var(--motion-glide)]",
            "group-hover:text-foreground group-hover:[transition-duration:0ms]",
            "group-data-[active=true]:text-foreground"
          )}
        />
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
 * ↗, no one-liner. Title Subhead, and the date at the far right in the
 * palette's shortcut position. Articles go inward, so the row is quieter.
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
    <a
      ref={attach}
      // The article detail template and its MDX pipeline are a later phase.
      // A dead anchor is a smaller lie than a 404 — the same call the ⌘K
      // palette's placeholder rows make.
      href="#"
      onClick={(event) => event.preventDefault()}
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
    </a>
  )
}
