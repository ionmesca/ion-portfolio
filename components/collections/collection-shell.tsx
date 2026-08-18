import { RailShell } from "@/components/nav/rail-shell"
import { type SectionNavItem } from "@/components/nav/section-rail"

/**
 * The collection page chassis — the stack, agents & skills, and articles pages.
 *
 * The grid it draws is the letter page's grid, unchanged: the collection frames
 * were cloned from the letter frame, so the code shares one component with it
 * (`RailShell`, which carries the geometry and the breakpoint reasoning). This
 * file is now only the collection pages' name for that chassis plus their one
 * difference from the letter — the narrow-screen gutter is 16, not 24, because
 * a 48px row with 12px of its own padding needs the width more than prose does.
 *
 * MOBILE / narrow. Below `lg` the grid collapses to one column, the wheel hides
 * (the rail's own rule) and "Home" stays — the page becomes the plain readable
 * stack the spec rules for it: title, groups, rows, footer. No frame draws a
 * mobile collection page; this is the ruled minimal adaptation, flagged in the
 * report.
 */
export function CollectionShell({
  nav,
  label,
  children,
}: {
  nav: SectionNavItem[]
  label: string
  children: React.ReactNode
}) {
  return (
    <RailShell nav={nav} label={label} gutter="rows">
      {children}
    </RailShell>
  )
}
