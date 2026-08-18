"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { Project } from "@/lib/projects"

import { useActiveProject } from "./active-project"
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
 * The year is now always in the DOM, at opacity 0 when the row is not active.
 * That is the prototype's rule (line 341: "The element always keeps its box,
 * so revealing it never reflows the name column") and it is what lets the date
 * fade and drift in with the settle instead of popping.
 */
export function ProjectList({ projects }: { projects: Project[] }) {
  const { activeIndex, setActiveIndex, count } = useActiveProject()

  const listRef = React.useRef<HTMLUListElement>(null)
  const rowsRef = React.useRef<(WheelRow | null)[]>([])

  const { goTo } = useProjectWheel({
    count,
    activeIndex,
    setActiveIndex,
    regionRef: listRef,
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
   * Arrows are the wheel's accessible twin: one press steps the selection by
   * one project, through the same physics, and carries focus with it so the
   * keyboard user is never left pointing at a row that is no longer current.
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
    rowsRef.current[target]?.row?.focus()
  }

  return (
    <ul
      ref={listRef}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-3"
      aria-label="Projects"
    >
      {projects.map((project, index) => {
        const isActive = index === activeIndex

        return (
          <li key={project.id}>
            <button
              type="button"
              ref={(el) => {
                slot(index).row = el
              }}
              aria-current={isActive ? "true" : undefined}
              onClick={() => goTo(index)}
              data-active={isActive}
              className={cn(
                "group relative isolate flex h-8 w-full items-center gap-2",
                "rounded-md py-1 pr-3 pl-1 text-left",
                "[transform-origin:left_center]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              )}
            >
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
              <span className="text-subhead min-w-0 flex-1 truncate text-foreground">
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
                className={`text-subhead text-muted-foreground${
                  isActive ? "" : " opacity-0"
                }`}
              >
                {project.year}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
