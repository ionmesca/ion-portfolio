"use client"

import type { Project } from "@/lib/projects"

import { useActiveProject } from "./active-project"
import { INTRO_DELAY, useIntroReveal } from "./intro-reveal"
import { ProjectArt } from "./project-art"

/**
 * MediaColumn — the panel stack the whole desktop landing scrolls through.
 *
 * THIS COLUMN IS THE SCROLL. Every project contributes at least two panels,
 * so the column is long and the document is the input. A project can grow
 * past two when it has extra media (Ledgy Agent's thinking mark and loop).
 * The rail beside it is sticky and never moves; the selection in its project
 * list is READ OFF this column's position, one project per its first panel.
 * The wheel measures those positions from the DOM (use-wheel.ts), so the
 * panel's box can change without a matching constant over there.
 *
 * An earlier pass rendered only the active project's two panels and captured
 * the wheel event over the rail instead. That is deleted: the panel stack is
 * the input, the page scrolls normally, nothing is hijacked.
 *
 * RATIO. Figma's Panel (11:1662) was 538 tall in a ~1013-wide column — about
 * 1.88:1, a cinematic strip. Software windows live closer to a laptop
 * screen. Ion, 2026-08-20: less squashed. **16:10** is the MacBook / product-
 * UI ratio; `aspect-[16/10]` keeps that shape as the column flexes, instead
 * of a fixed height that went from letterbox at 1512 to nearly square at
 * 1024. `object-cover object-top` keeps the title bar when a shot is taller
 * than the well.
 *
 * The FIRST panel of each project registers itself as that project's anchor
 * (see active-project.tsx): its document Y is the boundary the wheel's
 * smoothstep handoff ends at.
 *
 * The tail spacer is the prototype's `.end-spacer` (line 401, 55vh). Without
 * it the last project would never get to sit still at the top of the column —
 * the page would run out of scroll while its panels were still arriving.
 */

const MIN_PANELS_PER_PROJECT = 2

function panelCount(project: Project) {
  return Math.max(MIN_PANELS_PER_PROJECT, project.media?.length ?? 0)
}

function Panel({
  project,
  index,
  count,
  anchor,
  priority,
  lazy,
}: {
  project: Project
  index: number
  count: number
  anchor?: (el: HTMLDivElement | null) => void
  priority?: boolean
  lazy?: boolean
}) {
  const art = project.media?.[index]
  return (
    <div
      ref={anchor}
      // `relative` is here for the `fill` image below, and it is also what
      // lifts this panel out of in-flow painting into the positioned layer —
      // where, for one build, it painted over the open ⌘K panel's overhang.
      // The rail states its own rank now (`z-10`, app/page.tsx), so anything
      // positioned in this column sits below the whole pinned column by rule
      // rather than by luck. Do not answer a future z-order surprise here.
      className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-muted"
      data-project={project.id}
      // With no artwork the muted rectangle IS the picture, and it has to say
      // which project it belongs to. With artwork the <img> carries its own
      // description, and a `role="img"` wrapped round it would announce the
      // panel twice.
      role={art ? undefined : "img"}
      aria-label={
        art ? undefined : `${project.name}, image ${index + 1} of ${count}`
      }
    >
      {art ? (
        <ProjectArt
          art={art}
          priority={priority}
          lazy={lazy}
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      ) : null}
    </div>
  )
}

export function MediaColumn({ projects }: { projects: Project[] }) {
  const { anchorsRef } = useActiveProject()
  const intro = useIntroReveal()

  const cells = projects.flatMap((project, k) => {
    const count = panelCount(project)
    return Array.from({ length: count }, (_, n) => ({ project, k, n, count }))
  })

  return (
    <div
      className={intro.className("flex min-w-0 flex-1 flex-col gap-4")}
      style={intro.style(INTRO_DELAY.media)}
    >
      {cells.map(({ project, k, n, count }, columnIndex) => (
        <Panel
          key={`${project.id}-${n}`}
          project={project}
          index={n}
          count={count}
          priority={columnIndex === 0}
          lazy={columnIndex >= 2}
          anchor={
            n === 0
              ? (el) => {
                  anchorsRef.current[k] = el
                }
              : undefined
          }
        />
      ))}

      {/* prototype line 401 — the last project needs somewhere to arrive. */}
      <div aria-hidden="true" className="h-[55vh] shrink-0" />
    </div>
  )
}
