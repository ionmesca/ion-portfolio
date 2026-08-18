"use client"

import { cn } from "@/lib/utils"
import type { Project } from "@/lib/projects"

import { useActiveProject } from "./active-project"
import { ProjectIcon } from "./project-icon"

/* ----------------------------------------------------------------------------
   Motion — the same hover-snap rule the Button follows (motion-system-spec.md
   principle 5). The background snaps in at 0ms and eases out over 150ms, so a
   pointer sweeping the list does not leave a trail of fading rows.

   Only `background-color` is animated, so unlike the Button there is no need
   to split the duration list per property.
   ------------------------------------------------------------------------- */
const ROW_MOTION = [
  "[transition-property:background-color]",
  "[transition-duration:var(--duration-fast)]",
  "[transition-timing-function:var(--motion-glide)]",
  "hover:[transition-duration:0ms]",
].join(" ")

/**
 * ProjectList — the rail's five rows.
 *
 * Figma component set "Project row" (11:1646) has exactly three states and
 * they are the whole visual language of this list:
 *
 *   Default  no fill,        year hidden
 *   Hover    muted at 60%,   year hidden
 *   Active   muted at 100%,  year visible
 *
 * Nothing else changes — no opacity ramp on the inactive rows, no dimmed
 * names, no icon treatment. The active row is the only one that shows a year.
 *
 * Hover is gated on the row NOT being active, because muted/60 is lighter than
 * muted/100: without the gate, pointing at the selected row would dim it.
 */
export function ProjectList({ projects }: { projects: Project[] }) {
  const { activeIndex, setActiveIndex } = useActiveProject()

  return (
    <ul className="flex flex-col gap-3" aria-label="Projects">
      {projects.map((project, index) => {
        const isActive = index === activeIndex

        return (
          <li key={project.id}>
            <button
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              data-active={isActive}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-md py-1 pr-3 pl-1 text-left",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                ROW_MOTION,
                isActive ? "bg-muted" : "hover:bg-muted/60"
              )}
            >
              <ProjectIcon mark={project.mark} />
              <span className="text-subhead min-w-0 flex-1 truncate text-foreground">
                {project.name}
              </span>
              {isActive ? (
                <span className="text-subhead text-muted-foreground">
                  {project.year}
                </span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
