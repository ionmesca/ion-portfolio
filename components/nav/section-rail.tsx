"use client"

import * as React from "react"
import Link from "next/link"

import { clsx } from "clsx"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@/lib/icons"

/* ----------------------------------------------------------------------------
   The section wheel's constants.

   ACTIVE_LINE — the 40% line. A section becomes active when its top crosses 40%
   of the viewport height. Source: docs/design/collection-lab.html
   (`var ACTIVE_LINE = 0.40`) and its rulebook row "The section wheel … tracks
   the 40% line". Same number in the lab and on a real page; the lab measures it
   against a scrolling column, this measures it against the window.

   LENS — the opacity falloff, by distance from the active row. Taken from the
   Figma frame's own row opacities (13:2954..13:2960: 1 / .75 / .59 / .47), which
   are also the four numbers the collection-lab rulebook prints.

   NOTE, flagged in the report: the lab's *JavaScript* computes the lens from a
   curve (`0.47 + 0.53 * (1 - d/4)^2.2`) that yields .495 at distance 3, not .47.
   The frame and the rulebook prose both say .47. The frame is visual law here,
   so the ladder is written out literally. Rows further than 3 away hold the
   floor — the letter only has four sections, so this never bites today.
   ------------------------------------------------------------------------- */
const ACTIVE_LINE = 0.4
const LENS = [1, 0.75, 0.59, 0.47] as const

function lens(distance: number) {
  return LENS[Math.min(distance, LENS.length - 1)]
}

export type SectionNavItem = { id: string; nav: string }

/**
 * The left rail — "Home", the section wheel, and the scroll hint.
 *
 * ONE rail, four pages. It was built for the letter (Figma "Letter — light" →
 * "Left rail" 13:2942) and the three collection frames redraw it byte for byte
 * — "Stack — desktop light" 20:1034, "Agents & skills" 20:1294, "Articles"
 * 20:1364 all repeat the same 85x32 Home button, the same 112px gap, the same
 * 200x32 wheel rows at 12px pitch, the same 16px gap and the same "scroll →".
 * Only the labels differ (letter headings / categories / years), so the rail
 * was moved here and generalised rather than forked. `sections` is whatever
 * the page's wheel lists; `label` names the nav for a screen reader.
 *
 * The rail box is 263 wide in the frames but its contents are 200, and it sits
 * 272px to the left of the centred 640 column; the letter and collection pages
 * reproduce that with a symmetric 272/640/272 grid. What lives here is only
 * what is inside the rail:
 *
 *   Button "Home"   85x32 secondary, ArrowLeft 16 — the Button primitive's
 *                   `secondary` + `default` size is this component byte for byte.
 *   112px gap       hand-placed in the frame (the rail has no auto-layout).
 *   Section wheel   rows 200x32, `rounded-md` (12), 12px vertical gap,
 *                   4/12 padding, label at the Subhead step, active row on
 *                   `muted`, the rest dimmed by the lens above.
 *   16px gap
 *   "scroll →"      Caption, muted-foreground, inset 12 to line up with the
 *                   row labels.
 *
 * Rows are anchors, not buttons: with JavaScript off (or before hydration) a
 * click still jumps to the section, and `globals.css` gives every `[id]` the
 * 96px scroll clearance either way.
 */
export function SectionRail({
  sections,
  label,
}: {
  sections: SectionNavItem[]
  /** `aria-label` for the wheel — "Letter sections", "Stack sections", … */
  label: string
}) {
  const [active, setActive] = React.useState(0)

  /* A wheel click is a statement about where the reader is, and it outranks the
     40% line until they move the page themselves. Without the lock, clicking a
     short section parks it at the top and leaves the line sitting inside the
     NEXT one, so the rail immediately contradicts the click. The lock is
     released by a real gesture only — never by the smooth scroll's own scroll
     events. (collection-lab rulebook: "A wheel click outranks the line".) */
  const lockedRef = React.useRef(false)

  React.useEffect(() => {
    const computeActive = () => {
      const line = window.scrollY + window.innerHeight * ACTIVE_LINE
      let next = 0
      sections.forEach((section, i) => {
        const el = document.getElementById(section.id)
        if (!el) return
        if (el.getBoundingClientRect().top + window.scrollY <= line) next = i
      })
      // At the very bottom of the page the last section owns the rail —
      // otherwise a short final section can never become active. Guarded on the
      // page actually scrolling: on a viewport tall enough to show everything,
      // "you are at the bottom" is true from the first frame, and the rail would
      // open on the last section instead of the first.
      const doc = document.documentElement
      const scrollable = doc.scrollHeight > window.innerHeight + 2
      const atEnd =
        scrollable && window.scrollY + window.innerHeight >= doc.scrollHeight - 2
      return atEnd ? sections.length - 1 : next
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (!lockedRef.current) setActive(computeActive())
      })
    }

    const release = () => {
      lockedRef.current = false
    }

    setActive(computeActive())

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    window.addEventListener("wheel", release, { passive: true })
    window.addEventListener("touchmove", release, { passive: true })
    window.addEventListener("keydown", release)
    // pointerdown covers a scrollbar drag, which fires no wheel event. It also
    // fires before `click`, so pressing a wheel row releases the old lock a
    // beat before the click handler sets the new one.
    window.addEventListener("pointerdown", release)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("wheel", release)
      window.removeEventListener("touchmove", release)
      window.removeEventListener("keydown", release)
      window.removeEventListener("pointerdown", release)
    }
  }, [sections])

  const onSelect = (
    event: React.MouseEvent<HTMLAnchorElement>,
    index: number,
    id: string
  ) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    lockedRef.current = true
    setActive(index)
    // Reduced motion: the smooth scroll falls back to an instant jump. The
    // global `scroll-behavior: auto !important` in globals.css cannot do this
    // for us — an explicit `behavior: "smooth"` here would override it.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
  }

  return (
    <div className="flex flex-col items-start xl:sticky xl:top-34 xl:self-start">
      <Button variant="secondary" asChild>
        <Link href="/">
          <ArrowLeft />
          Home
        </Link>
      </Button>

      {/* The wheel is a desktop convenience: it needs the rail column, and the
          frame has no mobile letter yet. Below xl the page falls back to the
          document's own heading order, and "Home" stays. Flagged in the report
          as a judgement call, not a rule inferred from the frame. */}
      <nav aria-label={label} className="mt-28 hidden flex-col gap-3 xl:flex">
        {sections.map((section, i) => {
          const isActive = i === active
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? "location" : undefined}
              style={{ opacity: lens(Math.abs(i - active)) }}
              onClick={(event) => onSelect(event, i, section.id)}
              // `clsx`, not `cn`: tailwind-merge cannot know that `subhead` is
              // a size, so it files `text-subhead` under text-COLOUR and drops
              // whichever of `text-subhead` / `text-foreground` comes first.
              // Same footgun documented in components/ui/kbd.tsx. There is no
              // incoming className to merge here, so twMerge buys nothing.
              className={clsx(
                "flex h-8 w-50 items-center rounded-md px-3 py-1",
                "text-subhead text-foreground",
                // The hover-snap rule: background in at 0ms, out over 150ms
                // (motion-system-spec principle 5, same as the Button). Opacity
                // rides the slower base duration because it is the lens moving,
                // not a hover.
                "[transition-property:background-color,opacity]",
                "[transition-duration:var(--duration-fast),var(--duration-base)]",
                "[transition-timing-function:var(--motion-glide)]",
                "hover:bg-muted hover:[transition-duration:0ms,var(--duration-base)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                isActive && "bg-muted"
              )}
            >
              {section.nav}
            </a>
          )
        })}
      </nav>

      <p className="mt-4 hidden px-3 text-xs text-muted-foreground xl:block">
        scroll →
      </p>
    </div>
  )
}
