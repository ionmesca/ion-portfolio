"use client"

import type { Project } from "@/lib/projects"

import { useActiveProject } from "./active-project"

/**
 * MediaColumn — the two large panels beside the rail.
 *
 * Figma's Panel component (11:1662) is an EMPTY muted rectangle: 538 tall,
 * radius `xl` (21), fill `muted`, no children and no per-project variants.
 * The blank tiles in the reference export are the design, not a missing
 * asset — the artwork is a later ticket. So the panels here are muted stand-
 * ins with an art slot inside.
 *
 * The slot is keyed on the active project so the swap animation is already
 * wired: changing the selection remounts the slot, which replays a 200ms
 * fade + 8px rise on `--motion-glide` (motion-system-spec.md: `--duration-base`
 * for panel state, glide for things that move themselves). Today the slot is
 * empty, so the motion has nothing to carry — `data-project` on the panel is
 * how you can see the swap happen before the art lands.
 *
 * Reduced motion drops the rise and keeps the fade. Note that globals.css
 * section 8 additionally collapses every transition and animation to 0.01ms
 * under `prefers-reduced-motion`, so in practice the fade is instant rather
 * than the 150ms the motion spec describes — flagged in the report.
 */

const PANEL_ART_MOTION = [
  "animate-in fade-in slide-in-from-bottom-2",
  "duration-200 ease-glide",
  "motion-reduce:slide-in-from-bottom-0",
].join(" ")

function Panel({ project }: { project: Project }) {
  return (
    <div
      className="h-[538px] shrink-0 rounded-xl bg-muted"
      data-project={project.id}
      role="img"
      aria-label={project.name}
    >
      <div key={project.id} className={`size-full ${PANEL_ART_MOTION}`}>
        {/* art slot — project media lands here */}
      </div>
    </div>
  )
}

export function MediaColumn({ projects }: { projects: Project[] }) {
  const { activeIndex } = useActiveProject()
  const project = projects[activeIndex]

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <Panel project={project} />
      <Panel project={project} />
    </div>
  )
}
