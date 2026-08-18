import { ActiveProjectProvider } from "@/components/landing/active-project";
import { CommandPalette } from "@/components/landing/command-palette";
import { Intro } from "@/components/landing/intro";
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
 * 1512). Top offset 136. The rail's own height is a flat 700 in Figma with the
 * footer bottom-aligned inside it; no rule derives 700 from the viewport, so it
 * is reproduced literally.
 *
 * The right column is taller than the frame (2 x 538 + 16 = 1092), which is why
 * the second panel is cut off in the reference export. The page scrolls.
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
          <div className="flex h-[700px] w-[263px] shrink-0 flex-col gap-16">
            <div className="flex flex-col gap-6">
              {/* The identity chip, and — on a desktop pointer — the ⌘K palette
                  it morphs into. The chip's slot holds its place in the flow,
                  so the panel growing out of it never moves this column. */}
              <CommandPalette />
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
