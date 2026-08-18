import { SectionRail, type SectionNavItem } from "@/components/nav/section-rail"

/**
 * The collection page chassis — one grid, three pages.
 *
 * Figma "Stack — desktop light" 20:1033, "Agents & skills" 20:1293 and
 * "Articles" 20:1363 are the same 1512-wide frame: rail at x=164, 640 content
 * column at x=436, 136 top offset. 436 − 164 = 272, so a symmetric
 * 272 / 640 / 272 grid, 1184 wide and centred, lands both columns exactly
 * where the frames have them. That is the letter page's grid, unchanged — the
 * collection frames were cloned from the letter frame, and the code follows.
 *
 * The empty third column is what keeps the reading column centred rather than
 * pushed right; nothing renders into it.
 *
 * MOBILE / narrow. Below `xl` the grid collapses to one column, the wheel
 * hides (the rail's own rule) and "Home" stays — the page becomes the plain
 * readable stack the spec rules for it: title, groups, rows, footer. Gutters
 * are 16, not the letter's 24, because a 48px row with 12px of its own padding
 * needs the width more than the letter's prose does. No frame draws a mobile
 * collection page; this is the ruled minimal adaptation, flagged in the report.
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
    <main className="min-h-dvh bg-background">
      <div className="mx-auto grid max-w-[1184px] grid-cols-1 gap-10 px-4 py-16 xl:grid-cols-[272px_640px_272px] xl:gap-0 xl:px-0 xl:py-34">
        <SectionRail sections={nav} label={label} />
        {children}
      </div>
    </main>
  )
}
