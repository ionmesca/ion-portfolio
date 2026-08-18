"use client"

import * as React from "react"

import { Check, Copy, ICON_STROKE } from "@/lib/icons"
import { useCopyToClipboard } from "@/lib/use-copy"

/**
 * The install chip — Figma 20:1188, on Ion's own skills only.
 *
 * Geometry, verbatim: pad 4/8, gap 6, `muted` fill, 1px `border`, radius 9.
 * Nine is NOT a raw value here even though the frame and the lab both call it
 * one: `--radius-sm` is `--radius * 0.6` = 9px, so `rounded-sm` is the step.
 * Flagged in the report — the design docs and the stylesheet agree, they just
 * use different words for it.
 *
 * The chip is the ONE place in this pattern where a row holds a click target
 * that is not the row (collection-lab rulebook, flagged call #2). It is a copy,
 * so it cannot misfire into anything: those rows have no href at all, and the
 * chip stops the click before it can reach an ancestor.
 *
 * Feedback is the ratified copy → check moment (lib/use-copy.ts): icon swaps to
 * a check, label swaps to "Copied", both revert after 1.5s, Sound A on the
 * commit. ZERO layout shift: the command owns the box and "Copied" rides on
 * top of it, exactly as the ⌘K palette's row does.
 *
 * Hover colour: the row's hover fill is `muted`, and a `muted` chip on a
 * `muted` row would disappear, so the frame's Hover variant (20:1194) darkens
 * the chip one stone step. That is `stone-200` in light — a documented raw
 * allowance, like the sheet's grab handle, because the system has no
 * "one step above muted" role.
 */
export function InstallChip({ name }: { name: string }) {
  const { copied, copy } = useCopyToClipboard()
  const command = `npx skills add ionmesca/${name}`

  return (
    <button
      type="button"
      onClick={(event) => {
        // The chip lives inside a row that is an anchor on every other page of
        // this pattern. Stop early rather than rely on there being no href.
        event.preventDefault()
        event.stopPropagation()
        void copy(command)
      }}
      aria-label={`Copy install command for ${name}`}
      className={[
        // `min-w-0` and a truncating label, not `shrink-0`: at 640 the row has
        // spare width and the chip keeps its natural size, but a 390 phone
        // cannot hold `npx skills add ionmesca/design-tokens` next to a name
        // and a one-liner. The command truncates on screen; the click still
        // copies all of it. No frame draws a mobile collection page — flagged.
        "flex min-w-0 items-center gap-1.5 rounded-sm border px-2 py-1",
        "bg-muted group-hover:bg-stone-200 dark:group-hover:bg-stone-700",
        "[transition-property:background-color]",
        "[transition-duration:var(--duration-fast)]",
        "[transition-timing-function:var(--motion-glide)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
      ].join(" ")}
    >
      <span className="relative size-3.5 shrink-0">
        <Copy
          data-on={!copied}
          className="icon-swap absolute inset-0 size-3.5 text-muted-foreground"
          strokeWidth={ICON_STROKE}
        />
        <Check
          data-on={copied}
          className="icon-swap absolute inset-0 size-3.5 text-muted-foreground"
          strokeWidth={ICON_STROKE}
        />
      </span>

      {/* Below `sm` the chip is the copy ICON alone. `npx skills add
          ionmesca/design-tokens` is 200px of text nobody can run on a phone,
          and at 390 it squeezed the row's one-liner down to a single letter.
          The tap still copies the whole command; the icon swap is the whole
          feedback there. Ruled adaptation — no frame draws a mobile
          collection page. */}
      <span className="relative hidden min-w-0 text-xs whitespace-nowrap text-muted-foreground sm:block">
        <span
          data-on={!copied}
          data-dir="out"
          aria-hidden={copied}
          className="label-swap block truncate"
        >
          {command}
        </span>
        <span
          data-on={copied}
          data-dir="in"
          aria-hidden={!copied}
          className="label-swap absolute inset-0 block truncate"
        >
          Copied
        </span>
      </span>
    </button>
  )
}
