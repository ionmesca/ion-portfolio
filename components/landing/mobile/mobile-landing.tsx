"use client"

import * as React from "react"
import Image from "next/image"

import { buttonVariants } from "@/components/ui/button"
import { ArrowUpRight } from "@/lib/icons"
import { projectPanelIndices, type Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

import { LEDGY_HREF } from "../ledgy-preview"
import { ProjectArt } from "../project-art"
import { SOCIALS } from "../socials"
import { MobileIndicator } from "./mobile-indicator-lazy"
import { MobileTopBar } from "./mobile-top-bar"
import { useProgressChannel } from "./progress-channel"
import { useMobileScroll } from "./use-mobile-scroll"

/* ============================================================================
   MOBILE LANDING — Option B, "scroll as control" (POR-22, ratified).

   VISUAL LAW: Figma page `Screens v3`, three 390-wide frames extracted
   read-only to scratchpad/mb-mobile-tree.json —
     C1 20:468  "Landing v3 — mobile light"    at rest, 390 x 2632
     C2 20:562  "Landing v3 — mobile scrolled" the indicator's anatomy
     C3 20:635  "Landing v3 — mobile menu"     the sheet (see mobile-menu.tsx)

   BEHAVIOUR LAW: docs/design/mobile-lab.html, Option B — see
   use-mobile-scroll.ts, which is the whole controller.

   THE SHAPE OF IT

     top bar    56 tall, `background`, 1px `border` under it, 16 gutters:
                avatar 28 + "Ion Mesca" Subhead, and on the right the menu
                icon button that opens the sheet. Sticky.
     indicator  40 tall, ABSENT at rest, fixed under the top bar once the
                first card reaches it. Anatomy in C2 (20:605).
     hero       24/16 padding, gap 16: Title 24, Heading 18 muted, actions.
     cards      one per media panel, 358 x 447 (4:5) inside 16 gutters, gap 16,
                radius `xl`, `Raised`. Projects with several panels keep their
                desktop order. THE CARDS ARE THE PAGE.
     footer     48 above, 16 around, Caption muted.

   The 16px gutter is bound: 20 is not a step in this system (token-contract
   3.3), and the pass-11 critique moved every mobile gutter off it.

   WHY THE BRANCH IS CSS, NOT A ROUTE. Same `app/page.tsx`, same
   `lib/projects.ts`, one `lg:` split. A JS-chosen tree would have to pick a
   branch before it knows the viewport, which means either a flash or a
   guess. Only the parts whose BEHAVIOUR differs consult matchMedia — the
   scroll controller here, and the palette's own desktop gate.
   ========================================================================== */

/**
 * Card art — muted stand-ins, exactly as in Figma (the artwork is a later
 * ticket, and the Figma Panel component is deliberately an empty rectangle).
 * The stops are the stone ramp, listed as a documented allowance in pass 11:
 * they are placeholder art, not surfaces, so they are not expected to be
 * roles. `135deg` is Figma's gradient transform for all five.
 *
 * Dark mode drops the gradient and keeps the flat `muted` card underneath,
 * which is what the desktop media panels already do — there is no dark mobile
 * frame to copy, and a light-ramp gradient on a near-black page is not it.
 */
const CARD_ART: Record<string, string> = {
  "equity-admin": "linear-gradient(135deg, #e7e5e4, #f5f5f4)",
  "ledgy-agent": "linear-gradient(135deg, #e7e5e4, #f5f5f4)",
  "buna-app": "linear-gradient(135deg, #d6d3d1, #e7e5e4)",
  "equity-dashboard": "linear-gradient(135deg, #f5f5f4, #d6d3d1)",
  "vesting-builder": "linear-gradient(135deg, #d6d3d1, #f5f5f4)",
  "ripple-agent": "linear-gradient(135deg, #e7e5e4, #fafaf9)",
}

export function MobileLanding({ projects }: { projects: Project[] }) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const meterRef = React.useRef<HTMLSpanElement>(null)
  const mobileCards = projects.flatMap((project, projectIndex) =>
    projectPanelIndices(project).map((mediaIndex) => ({
      art: project.media?.[mediaIndex],
      mediaIndex,
      project,
      projectIndex,
    }))
  )

  // The controller writes raw scroll progress into this channel every frame and
  // the indicator reads it through a spring. Not React state, for the same
  // reason the meter was a direct DOM write before: a re-render per frame to
  // move 2px of fill is a bill nobody should pay. Not a MotionValue either,
  // because the Motion runtime lives in the indicator's own lazy chunk and must
  // not be dragged back up here.
  const [subscribeToProgress, publishProgress] = useProgressChannel()

  const { index, revealed } = useMobileScroll({
    listRef,
    meterRef,
    count: projects.length,
    onProgress: publishProgress,
  })

  return (
    <div className="lg:hidden">
      {/* -- top bar ------------------------------------------------------- */}
      <MobileTopBar>
        <div className="flex items-center gap-3">
          <Image
            src="/ion-avatar.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-7 rounded-sm object-cover"
          />
          <span className="text-subhead text-foreground">Ion Mesca</span>
        </div>
      </MobileTopBar>

      <MobileIndicator
        projects={projects}
        index={index}
        revealed={revealed}
        subscribe={subscribeToProgress}
        meterRef={meterRef}
      />

      {/* -- hero ---------------------------------------------------------- */}
      {/* Ion, 2026-08-22: the hero breathes top and bottom (56px), the title
          and intro read as one group (8px), and the CTA row stands apart
          from them (24px). Proximity does the grouping, not rules. */}
      <section className="flex flex-col px-4 py-14">
        <h1 className="text-2xl text-foreground">Software Designer</h1>
        <p className="mt-2 text-lg text-muted-foreground [letter-spacing:-0.005em]">
          Curious generalist at heart, building AI native software and fintech
          systems at{" "}
          {/* No hover on a phone, so no site preview: the mention is the
              plain underlined link to ledgy.com that the desktop anchor is
              at rest. */}
          <a
            href={LEDGY_HREF}
            target="_blank"
            rel="noreferrer noopener"
            className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Ledgy
          </a>
        </p>

        <div className="mt-6 flex items-center gap-4">
          {/* Same treatment as the desktop hero (intro.tsx): the variants carry
              the look, the 70% glyph is Figma's own measurement. `touch` is the
              40px size the Button set gained in pass 10 §B. */}
          <a
            href="https://cal.com/"
            target="_blank"
            rel="noreferrer noopener"
            data-slot="button"
            data-variant="primary"
            className={cn(buttonVariants({ size: "touch" }), "[&_svg]:opacity-70")}
          >
            Book a call
            <ArrowUpRight />
          </a>

          {SOCIALS.map(({ label, href, Glyph, size }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              data-slot="button"
              data-variant="ghost"
              data-size="icon-touch"
              // Figma 20:489/20:493/20:497: on mobile the bare desktop glyph
              // becomes a 40 x 40 icon button, because a 20px glyph is not a
              // touch target. The frame fills it `card` + `Subtle`; ghost per
              // Ion's review (2026-08-18) — three shadowed cards next to the
              // primary CTA read as four buttons of equal weight. Ghost keeps
              // the same 40px target and lets "Book a call" lead. The glyph
              // stays `muted-foreground` (the `icon-touch` size otherwise
              // promotes it to `current`), and the muted fill arrives on
              // `:active` as well as `:hover`, since a finger never hovers.
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-touch" }),
                "text-muted-foreground active:bg-ghost-hover"
              )}
            >
              <Glyph className={size} />
            </a>
          ))}
        </div>
      </section>

      {/* -- the cards ARE the page ---------------------------------------- */}
      <div ref={listRef} className="flex flex-col gap-4 px-4">
        {mobileCards.map(
          ({ art, mediaIndex, project, projectIndex }, cardIndex) => {
            return (
              <article
                key={`${project.id}-${mediaIndex}`}
                data-slot="mobile-card"
                data-project={project.id}
                data-project-index={projectIndex}
                // No shadow: the desktop panels (media-column.tsx) sit flat on
                // the page, and the mobile cards match.
                className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted"
              >
                <h2 className="sr-only">
                  {project.name} — {project.year}, image {mediaIndex + 1}
                </h2>
                {art ? (
                  <ProjectArt
                    art={art}
                    priority={cardIndex === 0}
                    mobile
                    sizes="100vw"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 dark:hidden"
                    style={{ backgroundImage: CARD_ART[project.id] }}
                  />
                )}
              </article>
            )
          }
        )}
      </div>

      <footer className="px-4 pt-12 pb-4">
        <p className="text-xs text-muted-foreground">Updated Aug 16, 2026</p>
      </footer>
    </div>
  )
}
