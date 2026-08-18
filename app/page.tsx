import { ActiveProjectProvider } from "@/components/landing/active-project";
import { CommandPalette } from "@/components/landing/command-palette";
import { Intro } from "@/components/landing/intro";
import { Reveal } from "@/components/landing/intro-reveal";
import { MediaColumn } from "@/components/landing/media-column";
import { MobileLanding } from "@/components/landing/mobile/mobile-landing";
import { ProjectList } from "@/components/landing/project-list";
import { projects } from "@/lib/projects";

/**
 * Landing — desktop light.
 *
 * Figma frame "Landing v3 — desktop light" (11:1665), 1512 x 982. The page is
 * FLAT `background` (white); there is no shell, card, or chassis behind it.
 *
 * The frame's measurements, left to right: 164 gutter, 263 rail, 48 gap, the
 * right column filling the rest, 24 gutter (164 + 263 + 48 + 1013 + 24 =
 * 1512). Top offset 136.
 *
 * THE PAGE SCROLLS, AND THE RAIL DOES NOT. This is the wheel prototype's own
 * model (docs/design/wheel-prototype.html): the right column stacks every
 * project's media panels, the document scrolls through them, and the rail —
 * chip, intro, project list, footer — is pinned in the viewport the whole way
 * down. The prototype pins it with `position: fixed` (line 144); `sticky` is
 * the same result without taking the rail out of the flex row that already
 * measures the two columns.
 *
 * The rail's height is Figma's flat 700 with the footer bottom-aligned inside
 * it, capped so it can never be taller than the viewport it is pinned in
 * (136 top offset + 24 bottom gutter = 160). `self-start` is what makes the
 * sticky work at all: a stretched flex item is already as tall as the row and
 * has nothing to stick within.
 *
 * MOBILE. Below `lg` (1024) this whole layout is `display: none` and
 * `MobileLanding` is the page — Option B, "scroll as control", Figma
 * `Screens v3` 20:468 / 20:562 / 20:635. One route, one data source, one CSS
 * split; see components/landing/mobile/mobile-landing.tsx. Nothing above this
 * line changes at 1024 and up.
 */
export default function Home() {
  return (
    <ActiveProjectProvider count={projects.length}>
      <main className="bg-background">
        {/* desktop — unchanged at 1024 and up */}
        <div className="hidden min-h-screen gap-12 pt-[136px] pr-6 pb-6 pl-[164px] lg:flex">
          <div className="sticky top-[136px] flex h-[700px] max-h-[calc(100dvh-160px)] w-[263px] shrink-0 flex-col gap-16 self-start">
            <div className="flex flex-col gap-6">
              {/* The identity chip, and — on a desktop pointer — the ⌘K palette
                  it morphs into. The chip's slot holds its place in the flow,
                  so the panel growing out of it never moves this column.

                  It joins the first-load entrance as a FADE ONLY: the chip's
                  box belongs to the morph, which measures and freezes its
                  atoms, and opacity is the one thing that cannot disturb it. */}
              <Reveal group="chip" mode="fade">
                <CommandPalette />
              </Reveal>
              <Intro />
            </div>

            <ProjectList projects={projects} />

            {/* Figma gives the footer the rail's remaining height and bottom-
                aligns the text inside it, rather than pinning it to the rail's
                last line. flex-1 + items-end is the same arrangement. */}
            <p className="flex flex-1 items-end text-xs text-muted-foreground">
              Updated Aug 16, 2026
            </p>
          </div>

          <MediaColumn projects={projects} />
        </div>

        <MobileLanding projects={projects} />
      </main>
    </ActiveProjectProvider>
  );
}
