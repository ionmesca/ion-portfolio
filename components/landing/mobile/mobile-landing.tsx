"use client"

import * as React from "react"
import Image from "next/image"

import { buttonVariants } from "@/components/ui/button"
import { ArrowUpRight } from "@/lib/icons"
import type { Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

import { ProjectIcon } from "../project-icon"
import { SOCIALS } from "../socials"
import { MobileMenu } from "./mobile-menu"
import { INDICATOR_H, TOPBAR_H, useMobileScroll } from "./use-mobile-scroll"

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
     cards      one per project, 358 x 447 (4:5) inside 16 gutters, gap 16,
                radius `xl`, `Raised`. THE CARDS ARE THE PAGE.
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
  "ledgy-agent": "linear-gradient(135deg, #e7e5e4, #f5f5f4)",
  "hey-buna-app": "linear-gradient(135deg, #d6d3d1, #e7e5e4)",
  "equity-dashboard": "linear-gradient(135deg, #f5f5f4, #d6d3d1)",
  "ripple-agent": "linear-gradient(135deg, #e7e5e4, #fafaf9)",
  "vesting-builder": "linear-gradient(135deg, #d6d3d1, #f5f5f4)",
}

export function MobileLanding({ projects }: { projects: Project[] }) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const meterRef = React.useRef<HTMLSpanElement>(null)
  const { index, revealed } = useMobileScroll({
    listRef,
    meterRef,
    count: projects.length,
  })

  return (
    <div className="lg:hidden">
      {/* -- top bar ------------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4"
        style={{ height: TOPBAR_H }}
      >
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

        <MobileMenu />
      </header>

      <Indicator
        projects={projects}
        index={index}
        revealed={revealed}
        meterRef={meterRef}
      />

      {/* -- hero ---------------------------------------------------------- */}
      <section className="flex flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl text-foreground">Software Designer</h1>
        <p className="text-lg text-muted-foreground">
          Curious generalist at heart, building AI native software and fintech
          systems at <span className="underline">Ledgy</span>
        </p>

        <div className="flex items-center gap-4">
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
              // Figma 20:489/20:493/20:497: on mobile the bare desktop glyph
              // becomes a 40 x 40 icon button — radius `md`, `card` fill,
              // `Subtle` — because a 20px glyph is not a touch target.
              className="flex size-10 shrink-0 items-center justify-center rounded-md bg-card text-muted-foreground shadow-subtle [transition:color_var(--duration-fast)_var(--motion-glide)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <Glyph className={size} />
            </a>
          ))}
        </div>
      </section>

      {/* -- the cards ARE the page ---------------------------------------- */}
      <div ref={listRef} className="flex flex-col gap-4 px-4">
        {projects.map((project) => (
          <article
            key={project.id}
            data-slot="mobile-card"
            data-project={project.id}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted shadow-raised"
          >
            <h2 className="sr-only">
              {project.name} — {project.year}
            </h2>
            <div
              aria-hidden="true"
              className="absolute inset-0 dark:hidden"
              style={{ backgroundImage: CARD_ART[project.id] }}
            />
            {/* art slot — project media lands here */}
          </article>
        ))}
      </div>

      <footer className="px-4 pt-12 pb-4">
        <p className="text-xs text-muted-foreground">Updated Aug 16, 2026</p>
      </footer>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   The sticky indicator (Figma 20:605).

   40 tall, 16 gutters, `background`: thumbnail 20 + name Subhead + year
   Caption muted on the left, "n / 5" Caption muted on the right, both counters
   in TABULAR numerals so the digits do not dance as they change. The bar's
   bottom 2px is the meter: `border` track, `foreground` fill.

   It is FIXED, not sticky, and it is not in the flow: showing and hiding it
   must never move the cards it is describing (mobile-lab.html made the same
   call). At rest it is absent — that is the design, not a missing state.

   The name/year line uses the system's own text-swap recipe (`.palette-label`,
   catalog ruling #4): every project's line is mounted, and which one is `on`
   is what changes, so the crossfade needs no mount/unmount bookkeeping. Lines
   above the active one leave upward, lines below arrive from below, in both
   scroll directions. Deviation from mobile-lab.html: the lab travels 6px with
   no blur, the system recipe travels 4px with the 2px garnish blur — the
   system wins, flagged in the report.
   ------------------------------------------------------------------------- */

function Indicator({
  projects,
  index,
  revealed,
  meterRef,
}: {
  projects: Project[]
  index: number
  revealed: boolean
  meterRef: React.RefObject<HTMLSpanElement | null>
}) {
  return (
    <div
      data-slot="mobile-indicator"
      data-on={revealed}
      aria-live="polite"
      className="mobile-indicator fixed inset-x-0 z-20 flex items-center gap-2 bg-background px-4"
      style={{ top: TOPBAR_H, height: INDICATOR_H }}
    >
      <div className="relative h-[21px] min-w-0 flex-1">
        {projects.map((project, i) => (
          <span
            key={project.id}
            data-on={i === index}
            data-dir={i < index ? "out" : "in"}
            aria-hidden={i !== index}
            className="palette-label absolute inset-0 flex items-center gap-2 whitespace-nowrap"
          >
            <ProjectIcon mark={project.mark} size={20} />
            <span className="text-subhead text-foreground">{project.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {project.year}
            </span>
          </span>
        ))}
      </div>

      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {index + 1} / {projects.length}
      </span>

      {/* the meter — the bar's bottom edge, not a border under it */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 block h-0.5 bg-border"
      >
        <span
          ref={meterRef}
          data-slot="mobile-meter"
          data-progress="0"
          className="block h-full w-full origin-left bg-foreground"
          style={{ transform: "scaleX(0)" }}
        />
      </span>
    </div>
  )
}
