import Link from "next/link"

import { MobileTopBar } from "@/components/landing/mobile/mobile-top-bar"
import {
  RAIL_HOME,
  SectionRail,
  type RailBack,
  type SectionNavItem,
} from "@/components/nav/section-rail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@/lib/icons"
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
 * top offset. 436 − 164 = 272, so the page reads, left to right:
 *
 *     164 gutter │ 272 rail column │ 640 reading column │ 272 tail │ 164 gutter
 *
 * The rail column is 200 of wheel plus the 72 that separates it from the text.
 * The tail is empty; it is what keeps the reading column centred on the page
 * rather than pushed right. Nothing renders into it.
 *
 * The letter page and the collection pages drew this grid twice, character for
 * character. They share this component now — the responsive work below has to
 * be true on all four pages, and two copies of it is two chances to be wrong.
 * The only thing that ever differed is the narrow-screen gutter, which is a
 * prop.
 *
 * ── ≥1024: ONE FLUID RANGE, NO STEPS ───────────────────────────────────────
 *
 * RULED by Ion, 2026-08-18: "the ratio between the left side and the right
 * side needs to be proportional until it gets to mobile — take space from the
 * sidebar whitespace, not only from the images." This grid used to jump:
 * 272/640/272 above 1280, then a hard cut to a centred 200+48+640 block below
 * it. A window one pixel either side of 1280 got a different layout. Both
 * steps are gone; there is one formula across the whole desktop range.
 *
 * WHITESPACE IS THE ONLY THING THAT MOVES. The three whitespace terms — the
 * left gutter, the tail and the right gutter — are 164 / 272 / 164 at 1512,
 * which is 600px of slack around a fixed 912 of structure (272 rail + 640
 * text). Shrinking the window spends that slack, in the frame's own
 * proportions:
 *
 *     left gutter = clamp(32px, (100vw − 912px) × 164 / 600, 164px)
 *
 *   164/600 is the left gutter's share of the frame's own slack, so
 *   every width in the range is the 1512 frame with its margins scaled, not a
 *   different layout. The right gutter uses the same expression, and the tail
 *   is `1fr`, so it takes what is left and lands on the frame's 272 at 1512 by
 *   arithmetic rather than by being told to.
 *
 *     1512  164 │ 272 │ 640 │ 272 │ 164     the frame, exactly
 *     1280  101 │ 272 │ 640 │ 167 │ 101
 *     1236   89 │ 272 │ 640 │ 147 │  89     Ion's window
 *     1100   51 │ 272 │ 640 │  85 │  51
 *     1024   32 │ 272 │ 640 │  48 │  32     the 32 floor, 0.6px below share
 *
 * THE READING COLUMN IS NEVER THE THING THAT GIVES. It is 640 at every width
 * above. `minmax(560px, 640px)` is a safety valve, not part of the plan: grid
 * only shrinks a track below its max once the `1fr` tail is spent, so the text
 * column gives last and only where it must — a browser whose root font makes
 * `lg` (64rem) land well under 1024px. The 200-wide wheel rows never move;
 * they are control, not whitespace.
 *
 * ── <1024 ──────────────────────────────────────────────────────────────────
 *
 * One centred column, no wheel. The back control leaves the rail and sits in
 * the same 56px sticky top bar the landing uses (Ion, 2026-08-19): destination
 * on the left, menu on the right. `SectionRail` is `hidden` here — an empty
 * first grid row would still cost `gap-10`. Its matchMedia gate tracks `lg`
 * for the wheel; see RAIL_QUERY.
 *
 * Vertical: the frame's page padding is 136px top and bottom (`py-34`), which
 * is off the spacing convention in token-contract.md 3.8 (it stops at 96) —
 * flagged; the frame wins as visual law.
 *
 * The page is flat `bg-background`, with no white shell. That is the frame:
 * the landing's gray-behind-white relationship does not carry over here.
 */

/** The left/right page gutter above `lg`. See the table above.
 *
 *  `100vw`, not `100%`: a percentage resolves against the content box, which
 *  is the window LESS its scrollbar, and on a platform with classic scrollbars
 *  that pulled the 1512 frame 3px off its own geometry. `100vw` is the window,
 *  so 1512 is the frame exactly, everywhere. It cannot overflow either — the
 *  `1fr` tail absorbs the scrollbar's width before any track does. */
const FLUID_GUTTER =
  "lg:px-[clamp(32px,calc((100vw_-_912px)*164/600),164px)]"

export function RailShell({
  nav,
  label,
  back,
  gutter = "prose",
  children,
}: {
  nav: SectionNavItem[]
  /** `aria-label` for the wheel — "About sections", "Stack sections", … */
  label: string
  /**
   * Where the rail's back button goes. Omitted is "← Home" — the letter and the
   * three collections. An article detail page passes "← Writing".
   *
   * IMPORTANT for the conditional wheel: `children` must stay the grid's SECOND
   * item, because `SectionRail` measures its own `nextElementSibling` to decide
   * whether the page earns a wheel. Wrapping the children in anything is fine;
   * putting a third element between the rail and them is not.
   */
  back?: RailBack
  /**
   * The narrow-screen gutter. `prose` is 24 (the letter). `rows` is 16 — a
   * 48px collection row carries 12px of its own padding and needs the width
   * more than prose does. Above `lg` the fluid gutter takes over and this only
   * governs the single-column stack.
   */
  gutter?: "prose" | "rows"
  children: React.ReactNode
}) {
  const dest = back ?? RAIL_HOME

  return (
    <main className="min-h-dvh bg-background">
      {/* Sibling of the grid, not a grid item: sticky inside the rail cell
          has nothing to stick against on a one-column stack, and putting
          this first inside the grid would steal the page-entrance's
          `:first-child` (the rail) on desktop. */}
      <MobileTopBar>
        <Button
          variant="secondary"
          asChild
          className="relative before:absolute before:-inset-1.5 before:content-['']"
        >
          <Link href={dest.href}>
            <ArrowLeft />
            {dest.label}
          </Link>
        </Button>
      </MobileTopBar>
      <div
        className={cn(
          "mx-auto grid max-w-[1184px] grid-cols-1 gap-10 py-16",
          gutter === "prose" ? "px-6" : "px-4",
          "lg:grid-cols-[272px_minmax(560px,640px)_minmax(0,1fr)]",
          "lg:max-w-none lg:gap-0 lg:py-34",
          FLUID_GUTTER
        )}
      >
        <SectionRail sections={nav} label={label} back={back} />
        {children}
      </div>
    </main>
  )
}
