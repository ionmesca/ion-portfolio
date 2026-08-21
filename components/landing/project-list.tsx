"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { Project } from "@/lib/projects"

import { useActiveProject } from "./active-project"
import { INTRO_DELAY, INTRO_ROW_STEP, useIntroReveal } from "./intro-reveal"
import { ProjectIcon } from "./project-icon"
import { useProjectWheel, type WheelRow } from "./use-wheel"

/* ----------------------------------------------------------------------------
   Motion — the same hover-snap rule the Button follows (motion-system-spec.md
   principle 5). The background snaps in at 0ms and eases out over 150ms, so a
   pointer sweeping the list does not leave a trail of fading rows.

   It now lives on a layer rather than on the row itself, because the row's own
   opacity and transform are written per frame by the wheel controller and must
   not be caught by a transition. The two muted layers also make the "hover is
   ignored on the active row" rule physical instead of conditional: the active
   row's fill is an opaque muted rectangle painted over the hover tint, so
   pointing at the selected row cannot dim it.

   The prototype animates hover in AND out over 130ms (line 310). Our motion
   system wins on easing, per the handoff: hover snaps in.
   ------------------------------------------------------------------------- */
const HOVER_MOTION = [
  "[transition-property:opacity]",
  "[transition-duration:var(--duration-fast)]",
  "[transition-timing-function:var(--motion-glide)]",
  "group-hover:opacity-60",
  "group-hover:[transition-duration:0ms]",
].join(" ")

/* ----------------------------------------------------------------------------
   THE PRESS (Ion, round 3, 2026-08-18) — "project rows get a subtle press
   acknowledgment matching the buttons".

   Same family as `components/ui/button.tsx`: scale to 0.97 on `:active`, on
   `--motion-spring` over `--duration-fast`, in both directions. Not a new
   number and not a new curve — a row that is clickable should answer a click
   the way every other clickable thing on this site does.

   IT LIVES ON A LAYER, FOR THE SAME REASON THE HOVER TINT DOES. The row's own
   `transform` is written per frame by the wheel controller (use-wheel.ts writes
   `translateY(...) scale(...)` while the list turns) and its `transform-origin`
   is `left center` so the lens leans the rail from its hinge. A press painted
   on the row itself would be a second author on a property the wheel owns, and
   it would pivot from the left edge instead of from the middle — a row that
   shrinks sideways, not a row that is being pushed.

   So the press rides an inner layer that holds everything the row draws, with
   the default centre origin. The layer is `absolute inset-0`, which is what
   makes it geometrically free: it takes exactly the row's border box, so
   nothing about the resting layout moves, and it is its own containing block,
   so the two `-z-10` fill layers keep resolving against the same rectangle they
   always did whether or not a transform is present.

   `group-active`, not `active`: `:active` reaches an element and its ancestors,
   never its descendants, so a bare `active:` here would answer a pointer press
   (which lands inside the layer) and stay dead for Space and Enter (which
   activate the button above it). Keying off the row's own `group` covers both.
   ------------------------------------------------------------------------- */
const PRESS_MOTION = [
  "[transition-property:scale]",
  "[transition-duration:var(--duration-fast)]",
  "[transition-timing-function:var(--motion-spring)]",
  "group-active:scale-[0.97]",
].join(" ")

/**
 * ProjectList — the rail's five rows, and the wheel that spins them.
 *
 * REST is the Figma component set "Project row" (11:1646), which has exactly
 * three states and they are the whole visual language of this list:
 *
 *   Default  no fill,        year hidden
 *   Hover    muted at 60%,   year hidden
 *   Active   muted at 100%,  year visible
 *
 * Nothing else changes at rest — no opacity ramp on the inactive rows, no
 * dimmed names, no icon treatment, no blur.
 *
 * IN MOTION the wheel's lens rides on top: while the list is turning, rows
 * lean away from the active one, scale down with distance, fade off, and take
 * a whisker of blur at the far end. All of that is written as inline style by
 * `useProjectWheel` and all of it is cleared the moment the wheel settles, so
 * the resting page is exactly the frame above. See use-wheel.ts for the
 * constants and their source lines in the prototype.
 *
 * WHAT TURNS IT is the document scroll — the panel stack in the other column
 * moving past a reference line. This list captures no wheel events and hijacks
 * no scrolling; a click or an arrow key scrolls the document instead, which is
 * the same signal by another name.
 *
 * The year is now always in the DOM, at opacity 0 when the row is not active.
 * That is the prototype's rule (line 341: "The element always keeps its box,
 * so revealing it never reflows the name column") and it is what lets the date
 * fade and drift in with the settle instead of popping.
 */
export function ProjectList({ projects }: { projects: Project[] }) {
  const { activeIndex, setActiveIndex, count, anchorsRef } = useActiveProject()
  const intro = useIntroReveal()

  const rowsRef = React.useRef<(WheelRow | null)[]>([])

  const { goTo } = useProjectWheel({
    count,
    activeIndex,
    setActiveIndex,
    anchorsRef,
    rowsRef,
  })

  const slot = (index: number) => {
    const existing = rowsRef.current[index]
    if (existing) return existing
    const created: WheelRow = { row: null, fill: null, year: null }
    rowsRef.current[index] = created
    return created
  }

  /**
   * Arrows are the wheel's accessible twin: one press scrolls the document to
   * the next project — the same move a click makes — and carries focus with it
   * so the keyboard user is never left pointing at a row that is no longer
   * current. `preventScroll` because the rail is sticky and already fully in
   * view: letting focus scroll would fight the smooth scroll we just started.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    let next: number | null = null
    if (event.key === "ArrowDown") next = activeIndex + 1
    else if (event.key === "ArrowUp") next = activeIndex - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = count - 1
    if (next === null) return

    const target = Math.min(Math.max(next, 0), count - 1)
    event.preventDefault()
    goTo(target)
    rowsRef.current[target]?.row?.focus({ preventScroll: true })
  }

  return (
    <ul onKeyDown={onKeyDown} className="flex flex-col gap-3" aria-label="Projects">
      {projects.map((project, index) => {
        const isActive = index === activeIndex

        return (
          /* The row group of the first-load choreography: rows enter 25ms
             apart, after the actions row. See intro-reveal.tsx. */
          <li
            key={project.id}
            className={intro.className()}
            style={intro.style(INTRO_DELAY.rows + index * INTRO_ROW_STEP)}
          >
            <button
              type="button"
              ref={(el) => {
                slot(index).row = el
              }}
              aria-current={isActive ? "true" : undefined}
              onClick={() => goTo(index)}
              data-active={isActive}
              className={cn(
                "group relative isolate block h-8 w-full",
                "rounded-md text-left",
                "[transform-origin:left_center]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              )}
            >
              {/* THE PRESS LAYER. It holds everything the row draws and owns
                  the row's whole box — `absolute inset-0`, so the padding, the
                  flex row and the two fills are exactly where they were, and
                  the button above it keeps a transform the wheel alone writes.
                  See PRESS_MOTION. */}
              <span className={cn(
                "absolute inset-0 flex items-center gap-2",
                "rounded-md py-1 pr-3 pl-1",
                PRESS_MOTION
              )}>
                {/* hover tint — CSS only */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 -z-10 rounded-md bg-muted opacity-0",
                    HOVER_MOTION
                  )}
                />
                {/* active fill — driven per frame while the wheel turns, handed
                    back to this class the moment it settles */}
                <span
                  aria-hidden="true"
                  ref={(el) => {
                    slot(index).fill = el
                  }}
                  className={cn(
                    "pointer-events-none absolute inset-0 -z-10 rounded-md bg-muted",
                    isActive ? undefined : "opacity-0"
                  )}
                />
                <ProjectIcon mark={project.mark} />
                {/* The system subhead line height is 20.25px. That fractional
                    box rasterises one pixel differently when this row leaves
                    the wheel's scale transform. Keep the system's 15px size
                    and weight, but use its 20px line-height step in this fixed
                    32px control so the resting and moving baselines match. */}
                <span className="text-subhead min-w-0 flex-1 truncate leading-5 text-foreground">
                  {project.name}
                </span>
                <span
                  ref={(el) => {
                    slot(index).year = el
                  }}
                  aria-hidden={isActive ? undefined : "true"}
                  /* NOT cn(): tailwind-merge reads our custom `text-subhead`
                     step as a text COLOUR, so `cn("text-subhead
                     text-muted-foreground")` silently drops the size and the
                     date renders at 16px in the wrong place. Same footgun the
                     name span above avoids by staying a plain string. */
                  className={`text-subhead leading-5 text-muted-foreground${
                    isActive ? "" : " opacity-0"
                  }`}
                >
                  {project.year}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
