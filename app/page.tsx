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
 * 1512). Top offset 136. Below 1512 the left gutter is fluid and the media
 * column keeps its share — see the comment on the desktop wrapper.
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
        {/* desktop — 1024 and up.

            THE LEFT GUTTER IS FLUID. Ruled by Ion, 2026-08-18: the split has
            to stay proportional down to mobile, and the space has to come out
            of the rail's whitespace before it comes out of the media. The
            gutter was a hard 164, so every pixel a narrower window cost came
            straight off the media column: at Ion's ~1236 the panels had lost
            a fifth of their width while the margin beside the rail had lost
            nothing.

              padding-left = clamp(40px, 164px − (1512px − 100vw) × 0.25, 164px)

            0.25 = the gutter pays a quarter of whatever the window gives up
            from the 1512 frame. That is steeper than the frame's own
            proportions on purpose — whitespace first — and it lands the media
            column within a few percent of a straight scale of the frame:
            1013 at 1512, 806 at 1236, 647 at 1024, against 1013 / 828 / 686
            for a pure scale. The 40px floor is the last width at which the
            chip still reads as being in a margin rather than against the
            edge. `100vw`, not `100%`, so the 1512 frame keeps its exact 164
            on a platform whose scrollbar takes width from the content box.

            The 263 rail and the 24 right gutter are Figma and do not move;
            the media column is `flex-1` and takes what is left. */}
        <div className="hidden min-h-screen gap-12 pt-[136px] pr-6 pb-6 pl-[clamp(40px,164px_-_(1512px_-_100vw)*0.25,164px)] lg:flex">
          <div
            // `data-rail` is what the hover previews (POR-24) bound themselves
            // to vertically: a preview may overhang this column sideways — a
            // 264-wide card on a 263-wide rail is meant to — but it may never
            // float above the rail's top edge, where the identity chip is.
            data-rail
            className="sticky top-[136px] flex h-[700px] max-h-[calc(100dvh-160px)] w-[263px] shrink-0 flex-col gap-16 self-start"
          >
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
