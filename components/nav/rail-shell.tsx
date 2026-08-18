import { SectionRail, type SectionNavItem } from "@/components/nav/section-rail"
import { cn } from "@/lib/utils"

/**
 * The rail chassis — one grid, four pages (the letter and the three
 * collections).
 *
 * ── Where the numbers come from ────────────────────────────────────────────
 *
 * Figma "Letter — light" 13:2941 and the three collection frames ("Stack —
 * desktop light" 20:1033, "Agents & skills" 20:1293, "Articles" 20:1363) are
 * the same 1512-wide frame: rail at x=164, 640 content column at x=436, 136
 * top offset. 436 − 164 = 272, so a symmetric 272 / 640 / 272 grid, 1184 wide
 * and centred, lands both columns exactly where the frames have them. The
 * empty third column is what keeps the reading column centred rather than
 * pushed right; nothing renders into it.
 *
 * The letter page and the collection pages drew this grid twice, character for
 * character. They now share this component — the breakpoint work below has to
 * be true on all four pages, and two copies of it is two chances to be wrong.
 * The only thing that ever differed is the narrow-screen gutter, which is a
 * prop.
 *
 * ── The three widths ───────────────────────────────────────────────────────
 *
 * ≥1280 (`xl`)     Figma geometry, untouched: 272 / 640 / 272, gap 0, the
 *                  1184 block centred on the page.
 *
 * 1024–1279 (`lg`) The rail STAYS. Real laptop windows land here (Ion's is
 *                  ~1236) and the whole signature layout used to vanish at
 *                  1279. Compressed, not squeezed: the rail column drops to
 *                  its own content width (200 — the wheel rows are 200 in
 *                  every frame, the 272 was only the offset to the column),
 *                  the gap becomes 48, and the 200+48+640 = 888 pair is
 *                  centred as a block with `justify-center`. The reading
 *                  column is still exactly 640; it is never the thing that
 *                  gives. At the narrowest lg window, 1024 − 48 of gutter =
 *                  976, so 888 still clears it.
 *
 * <1024            Unchanged: one centred column, no wheel, "Home" stays.
 *
 * `SectionRail`'s own `xl:` rules and its matchMedia gate move to `lg` in step
 * with this — see the note on RAIL_QUERY there.
 *
 * Vertical: the frame's page padding is 136px top and bottom (`py-34`), which
 * is off the spacing convention in token-contract.md 3.8 (it stops at 96) —
 * flagged; the frame wins as visual law. It now starts at `lg`, with the rail,
 * rather than at `xl`.
 *
 * The page is flat `bg-background`, with no white shell. That is the frame:
 * the landing's gray-behind-white relationship does not carry over here.
 */
export function RailShell({
  nav,
  label,
  gutter = "prose",
  children,
}: {
  nav: SectionNavItem[]
  /** `aria-label` for the wheel — "Letter sections", "Stack sections", … */
  label: string
  /**
   * The narrow-screen gutter. `prose` is 24 (the letter). `rows` is 16 — a
   * 48px collection row carries 12px of its own padding and needs the width
   * more than prose does. Above `lg` the grid is fixed-width and centred, so
   * this only ever governs the single-column stack.
   */
  gutter?: "prose" | "rows"
  children: React.ReactNode
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div
        className={cn(
          "mx-auto grid max-w-[1184px] grid-cols-1 gap-10 py-16",
          gutter === "prose" ? "px-6" : "px-4",
          "lg:grid-cols-[200px_640px] lg:justify-center lg:gap-12 lg:py-34",
          "xl:grid-cols-[272px_640px_272px] xl:gap-0 xl:px-0 xl:py-34"
        )}
      >
        <SectionRail sections={nav} label={label} />
        {children}
      </div>
    </main>
  )
}
