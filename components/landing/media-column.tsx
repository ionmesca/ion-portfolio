"use client"

import type { Project } from "@/lib/projects"

import { useActiveProject } from "./active-project"
import { INTRO_DELAY, useIntroReveal } from "./intro-reveal"

/**
 * MediaColumn — the panel stack the whole desktop landing scrolls through.
 *
 * THIS COLUMN IS THE SCROLL. Every project contributes two panels, so the
 * column is 10 panels tall and the document is long. The rail beside it is
 * sticky and never moves; the selection in its project list is READ OFF this
 * column's position, one project per pair of panels (the wheel's stride is
 * literally 2 x (538 + 16) = 1108px). See use-wheel.ts.
 *
 * An earlier pass rendered only the active project's two panels and captured
 * the wheel event over the rail instead. That is deleted: the panel stack is
 * the input, the page scrolls normally, nothing is hijacked.
 *
 * Figma's Panel component (11:1662) is an EMPTY muted rectangle: 538 tall,
 * radius `xl` (21), fill `muted`, no children and no per-project variants. The
 * blank tiles in the reference export are the design, not a missing asset —
 * the artwork is a later ticket. So the panels here are muted stand-ins with
 * an art slot inside, and `data-project` is how you can see which project you
 * are scrolling through before the art lands.
 *
 * The FIRST panel of each project registers itself as that project's anchor
 * (see active-project.tsx): its document Y is the boundary the wheel's
 * smoothstep handoff ends at.
 *
 * The tail spacer is the prototype's `.end-spacer` (line 401, 55vh). Without
 * it the last project would never get to sit still at the top of the column —
 * the page would run out of scroll while its panels were still arriving.
 */

const PANELS_PER_PROJECT = 2

function Panel({
  project,
  index,
  anchor,
}: {
  project: Project
  index: number
  anchor?: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={anchor}
      className="h-[538px] shrink-0 rounded-xl bg-muted"
      data-project={project.id}
      role="img"
      aria-label={`${project.name}, image ${index + 1} of ${PANELS_PER_PROJECT}`}
    >
      <div className="size-full">{/* art slot — project media lands here */}</div>
    </div>
  )
}

export function MediaColumn({ projects }: { projects: Project[] }) {
  const { anchorsRef } = useActiveProject()
  const intro = useIntroReveal()

  return (
    <div
      className={intro.className("flex min-w-0 flex-1 flex-col gap-4")}
      style={intro.style(INTRO_DELAY.media)}
    >
      {projects.map((project, k) =>
        Array.from({ length: PANELS_PER_PROJECT }, (_, n) => (
          <Panel
            key={`${project.id}-${n}`}
            project={project}
            index={n}
            anchor={
              n === 0
                ? (el) => {
                    anchorsRef.current[k] = el
                  }
                : undefined
            }
          />
        ))
      )}

      {/* prototype line 401 — the last project needs somewhere to arrive. */}
      <div aria-hidden="true" className="h-[55vh] shrink-0" />
    </div>
  )
}
