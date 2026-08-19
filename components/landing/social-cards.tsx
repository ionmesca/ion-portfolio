"use client"

import Image from "next/image"
import * as React from "react"

import { cn } from "@/lib/utils"

import { LinkedInGlyph, XGlyph } from "./brand-glyphs"

/* ============================================================================
   THE THREE SOCIAL CARD FACES — POR-36.

   Ion's ruling, 2026-08-18: the container morph was right and the INNARDS
   were thin. He posted three screenshots of colinlienard.dev and said "this
   level of richness". The reference is the MIT-licensed clone kept in the
   scratchpad — `src/components/Contacts.svelte` and `GithubGraph.svelte` —
   and every anatomical decision below is traced to it.

   WHAT WE TOOK, AND WHAT WE DID NOT.

   Took: the anatomy. A cover strip, an avatar puck straddling its bottom-left
   seam, a name/handle line with a verified seal, muted sub-lines, and a
   filled pill pushed to the right of them. Colin's exact trick for the X card
   too — the handle carries the top margin that clears the avatar while the
   pill stays at the top of the same row, which is what lands the button level
   with the cover's edge instead of level with the text.

   Did not: his photographic profile banner behind the X avatar. The covers
   are drawn, not photographed (see `Cover`), because a hover card whose whole
   premise is that it is instant must not fire a network request to open.

   TWO OF THE HUES CAME BACK (Ion, 2026-08-19): "for linkedin make the call to
   action linkedin color, for twitter make the checkmark blue". So the Connect
   pill is LinkedIn blue and the X card's seal is X blue — the two places
   where the hue IS the identification, which is exactly what a preview card
   of somebody's profile is for. Everything else on all three cards stays
   stone: the Follow pill, the LinkedIn seal, the covers, every line of text.
   The earlier all-stone ruling still governs the rest of the surface.

   The two values are declared right here (`BRAND` below) and NOT in
   globals.css. They are not system tokens — nothing else on the site may use
   them, and a token is a promise that something might.

   ── WIDTHS ────────────────────────────────────────────────────────────────
   Unchanged: 264 / 244 / 244, the lab's CARDS table. The widths are the
   morph's subject matter, not the cards' — the lab made them deliberately
   unequal "so the morph is visible rather than theoretical". Richer innards
   changed the HEIGHTS, which is the axis this pass was allowed to move.

   ── WHAT IS REAL AND WHAT IS PLACEHOLDER ──────────────────────────────────
   REAL: all three hrefs (from `socials.ts` — Ion's own profiles as of
   2026-08-19), the avatar, the pills, and both handles on the faces —
   `@ionmesca` on X and `ionmesca` on GitHub are the handles their hrefs
   actually point at.
   PLACEHOLDER: every number and every line of prose. The contribution counts
   come from an integer hash, the dates from a fixed anchor, and the bios are
   stand-ins.

   THE PILLS ARE LINKS NOW, and that reverses POR-24's note that they were
   decorative `<span>`s. The rule that note was protecting is "a hover-opened
   surface never holds an action you must not misfire", and a link that opens
   the same profile the icon under it opens is not such an action — the worst
   a misfire does is the thing you were already hovering to do. The Ledgy card
   set the precedent: its whole surface has been a real link since POR-24.
   Two consequences, both handled at the call site in `social-previews.tsx`:
   the container swapped `aria-hidden` for `inert`, because a focusable node
   inside an `aria-hidden` subtree is an assistive-tech dead end; and the card
   body is NOT itself a link, because an anchor inside an anchor is invalid
   HTML. That last point is why you will not find the brief's
   `stopPropagation` here: there is no ancestor click handler to stop.
   ========================================================================= */

const AVATAR = 48

/* ----------------------------------------------------------------------------
   THE TWO BRAND HUES

   Component-scoped constants, deliberately not tokens. Each is the network's
   own published colour, converted to oklch so it sits in the same colour space
   as everything else this file renders next to; the source hex is kept beside
   it because THAT is the value anyone will check against a brand page.

     linkedin  #0A66C2  →  oklch(51.6% 0.163 254.7)
     x         #1D9BF0  →  oklch(66.7% 0.161 245.5)

   ONE DECLARATION EACH, no dark-mode variant, and that is a measured decision
   rather than a shortcut:

   · The Connect pill carries WHITE text, and white on #0A66C2 is 5.69:1 —
     above AA for body text — no matter what is behind the pill, so the thing
     the reader actually has to read never changes with the theme. The pill
     itself against the dark card (stone-900) sits at 2.99:1, which clears the
     3:1 bar for a UI component's own boundary within rounding. Lightening it
     for dark would cost the brand match to buy contrast the white text
     already has. So L is NOT adjusted, in either theme.
   · The X seal is a 14px mark beside the handle, and #1D9BF0 is bright enough
     to read on the white card (3.00:1) and on the dark one. Its inner tick
     stays `--color-popover`, punched out of the blue in whatever stone the
     card is — the same construction the muted LinkedIn seal uses, so the two
     seals are one shape with two fills rather than two drawings.
   -------------------------------------------------------------------------- */
const BRAND = {
  /** LinkedIn blue — brand.linkedin.com, #0A66C2. */
  linkedin: "oklch(51.6% 0.163 254.7)",
  /** X blue — the verified seal's own hue, #1D9BF0. */
  x: "oklch(66.7% 0.161 245.5)",
} as const

/** The ink on a brand-filled pill. Plain white, not `--background`: the pill's
 *  fill does not follow the theme, so its text must not either. */
const BRAND_INK = "oklch(100% 0 0)"

/**
 * The cover strips.
 *
 * RATIO-MATCHED to the reference rather than eyeballed. Colin's cards are
 * 288 wide with a 96px X banner and a 64px LinkedIn one — 33% and 22% of the
 * card. Ours are 244 wide, so 34% and 23%. Copying his PIXELS would have made
 * both covers a third heavier relative to a narrower card, which is exactly
 * how a quiet cover turns into the loudest band in the hero.
 *
 * They stay unequal for the same reason the widths do: X taller than
 * LinkedIn is what the reference reads like, and it gives the container's
 * morph something to travel on the vertical axis as well as the horizontal.
 */
const COVER_H = { X: 84, LinkedIn: 56 } as const

/* ----------------------------------------------------------------------------
   X
   -------------------------------------------------------------------------- */

export function XCard({ href }: { href: string }) {
  return (
    <div className="relative flex flex-col">
      <Cover h={COVER_H.X} Glyph={XGlyph} wash={WASH_X} />
      <Puck seam={COVER_H.X} />

      <div className="flex flex-col p-3">
        {/* `items-start` + the margin on the LEFT child: the handle drops to
            clear the avatar, the pill does not travel with it. Colin's. */}
        <div className="flex items-start justify-between gap-3">
          <span className="mt-5 inline-flex items-center gap-1 text-small font-medium text-foreground">
            @ionmesca
            <VerifiedSeal tint={BRAND.x} />
          </span>
          <Pill href={href} label="Follow" />
        </div>
        {/* ONE LINE, and it has to stay one: the reference's bio is a single
            muted line under the handle, and a second line pushes the card
            past LinkedIn's height and flips which of the two is taller. */}
        <p className="text-xs text-muted-foreground">
          Design engineer. I build interfaces.
        </p>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   LinkedIn
   -------------------------------------------------------------------------- */

export function LinkedInCard({ href }: { href: string }) {
  return (
    <div className="relative flex flex-col">
      <Cover h={COVER_H.LinkedIn} Glyph={LinkedInGlyph} wash={WASH_LI} />
      <Puck seam={COVER_H.LinkedIn} />

      {/* `pt-8` and not `p-3`: 32px is what clears the half of the puck that
          hangs below the seam (26px) with the family's 6px of air. */}
      <div className="flex flex-col gap-1 p-3 pt-8">
        <span className="inline-flex items-center gap-1 text-small font-medium text-foreground">
          Ion Mesca
          <VerifiedSeal />
        </span>
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Design Engineer at Ledgy
            <br />
            Zurich, Switzerland
          </p>
          <Pill href={href} label="Connect" brand={BRAND.linkedin} />
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   GitHub
   -------------------------------------------------------------------------- */

export function GitHubCard() {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <Avatar size={22} />
        <span className="text-small font-medium text-foreground">ionmesca</span>
        <span className="ml-auto text-xs text-muted-foreground">github.com</span>
      </div>
      <p className="text-xs text-muted-foreground">
        1,204 contributions in the last year
      </p>
      <ContributionGraph />
    </div>
  )
}

/* ============================================================================
   THE COVER

   NO PHOTOGRAPH, by Ion's brief. Colin's X card pulls a 1500x500 off
   `pbs.twimg.com`; ours would be a network request fired on hover, on a
   surface whose whole job is to be instant, for a picture that says nothing.

   So it is drawn: `bg-muted` with three washes over it, and the network's own
   mark set very large, very faint, bleeding off the bottom-right. Every
   colour is `--color-foreground` at a low alpha, which is the only way a
   drawn cover can be quiet in BOTH themes off one declaration — a hardcoded
   pair of stones would need a `.dark` override, and section 1 of globals.css
   is not this crew's to edit.

   The two washes differ because two identical covers would make the morph
   between X and LinkedIn read as a resize of one card rather than a change of
   subject. X's light comes from the lower left, LinkedIn's from the upper
   right.
   ========================================================================= */

const fg = (pct: number) =>
  `color-mix(in oklch, var(--color-foreground) ${pct}%, transparent)`

const WASH_X = [
  `radial-gradient(120% 150% at 6% 118%, ${fg(9)} 0%, transparent 62%)`,
  `radial-gradient(80% 120% at 96% -24%, ${fg(6)} 0%, transparent 58%)`,
  `linear-gradient(112deg, transparent 12%, ${fg(4)} 100%)`,
].join(", ")

const WASH_LI = [
  `radial-gradient(110% 160% at 104% -30%, ${fg(9)} 0%, transparent 60%)`,
  `radial-gradient(90% 130% at -8% 130%, ${fg(6)} 0%, transparent 56%)`,
  `linear-gradient(68deg, transparent 10%, ${fg(4)} 100%)`,
].join(", ")

function Cover({
  h,
  Glyph,
  wash,
}: {
  h: number
  Glyph: (props: React.ComponentProps<"svg">) => React.ReactElement
  wash: string
}) {
  return (
    <div
      aria-hidden="true"
      className="relative w-full shrink-0 overflow-hidden bg-muted"
      style={{ height: h, backgroundImage: wash }}
    >
      <Glyph className="absolute -right-4 -bottom-5 size-24 text-foreground/[0.06]" />
    </div>
  )
}

/**
 * The avatar puck.
 *
 * A 2px ring of the card's own surface, centred on the cover's bottom seam —
 * `top: seam` plus a half-height translate, which is Colin's construction and
 * survives the avatar changing size without a second number to keep in sync.
 * `bg-popover` and not `bg-background`: the ring has to be the colour of the
 * card it sits on, and in dark mode those two are different stones.
 */
function Puck({ seam }: { seam: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-3 z-10 -translate-y-1/2 rounded-full bg-popover p-0.5"
      style={{ top: seam }}
    >
      <Avatar size={AVATAR} />
    </div>
  )
}

function Avatar({ size }: { size: number }) {
  return (
    <Image
      src="/ion-avatar.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className="block shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  )
}

/**
 * The verified seal.
 *
 * A filled scalloped badge, drawn here rather than pulled from `lib/icons.ts`
 * for the reason `brand-glyphs.tsx` gives: filled marks are not lucide
 * strokes and do not belong in the stroke set.
 *
 * ONE SHAPE, TWO FILLS. X's is X blue (Ion, 2026-08-19: "for twitter make the
 * checkmark blue") — on that card the seal is the platform's own signature and
 * the hue is half of what identifies it. LinkedIn's stays muted stone, because
 * that card spends its colour on the Connect pill and two blues on one 244px
 * card is a card with a theme instead of a subject.
 */
function VerifiedSeal({ tint }: { tint?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={tint ? { color: tint } : undefined}
      className="size-3.5 shrink-0 text-muted-foreground"
    >
      <path d="M12 1.5l2.34 1.86 2.98-.2.98 2.82 2.7 1.28-.87 2.86L21.9 12l-1.77 2.34.87 2.86-2.7 1.28-.98 2.82-2.98-.2L12 22.5l-2.34-1.86-2.98.2-.98-2.82-2.7-1.28.87-2.86L2.1 12l1.77-2.34-.87-2.86 2.7-1.28.98-2.82 2.98.2z" />
      <path
        d="M8.2 12.1l2.5 2.5 5.1-5.1"
        fill="none"
        stroke="var(--color-popover)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The call to action.
 *
 * A real link — see the note at the top of this file. The BOX is the family's
 * filled pill: fully round, `px-2.5 py-1`, Small ink, and hover is opacity
 * rather than a colour swap, because there is no second filled-pill token to
 * swap to and inventing one is a globals.css ruling this crew does not have.
 *
 * `brand` repaints only the two colours. Given, the pill is that network's
 * blue with white ink and stays so in both themes; withheld, it is the
 * family's `foreground`-on-`background` pill and flips with the theme as it
 * always has. LinkedIn's Connect is the one call site that passes it — X's
 * Follow stays stone, because that card already spends its hue on the seal.
 *
 * The values ride `style` and not a class: they are one-off constants at the
 * top of this file, and a Tailwind arbitrary value would put a colour nobody
 * else may use into the generated stylesheet.
 */
function Pill({
  href,
  label,
  brand,
}: {
  href: string
  label: string
  brand?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      style={brand ? { backgroundColor: brand, color: BRAND_INK } : undefined}
      className={cn(
        "h-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
        "[transition:opacity_var(--duration-fast)_var(--motion-glide)] hover:opacity-90 hover:[transition-duration:0ms]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        !brand && "bg-foreground text-background"
      )}
    >
      {label}
    </a>
  )
}

/* ============================================================================
   THE CONTRIBUTION GRAPH, AND ITS TOOLTIP

   The grid is POR-24's, unchanged: 24 columns x 7 days of 8px cells, coloured
   from an INTEGER hash so the server and the client draw the same picture and
   React reports no hydration mismatch.

   GREEN, and specifically `--status-available`. The system is pure stone by
   decision and carries exactly one non-stone hue; reusing it is the only way
   to draw a green graph without inventing a token, and inventing one is a
   ratification call for Ion. STILL FLAGGED, unchanged from POR-24.

   ── THE TOOLTIP (new, POR-36) ─────────────────────────────────────────────
   "3 contributions · Mar 12", stone-dark, above the hovered day.

   IMPERATIVE, and deliberately so. React state would re-render 168 cells on
   every cell the pointer crosses, which on a fast diagonal is several per
   frame, on the one surface in the system whose entire premise is that it
   answers instantly. So there is ONE delegated `pointerover` on the wrapper —
   Colin's technique too — and it writes text and two offsets onto a ref'd
   node. No state, no re-render, no work for the morph to fight.

   Positioned against the WRAPPER, which is the cells' `offsetParent`, and
   clamped to it horizontally so a Sunday in the first or last column does not
   push the tooltip through the card's edge (the surface is `overflow: hidden`,
   so an unclamped tooltip would be sliced rather than overflow). Vertically it
   sits 4px above the cell, which for the top row lands it over the muted
   count line — the same trade Colin takes.

   Reduced motion: works unchanged. The only motion is a 100ms opacity fade,
   and section 8's blanket collapse turns that into a cut. Nothing about
   WHICH day is reported depends on an animation.
   ========================================================================= */

const GRAPH_COLS = 24
const GRAPH_ROWS = 7
const CELL = 8
const CELL_GAP = 2

/**
 * The day the graph ends on. A FIXED anchor, not `Date.now()`, for the same
 * reason the levels come from a hash: this renders once on the server and
 * again on the client, and "today" is not guaranteed to be the same date in
 * both. It also keeps the picture stable between builds, so a screenshot
 * taken for a review still matches the one in the report.
 */
const GRAPH_END = Date.UTC(2026, 7, 16)
const DAY_MS = 86_400_000
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function hash(col: number, row: number) {
  let h = (col * 73856093) ^ (row * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  return h
}

function level(col: number, row: number) {
  const v = hash(col, row) % 100
  if (v < 46) return 0
  if (v < 68) return 1
  if (v < 84) return 2
  if (v < 95) return 3
  return 4
}

/** Ramp for levels 1–4. Level 0 is `bg-muted`, the empty day. */
const LEVEL_OPACITY = [0, 0.3, 0.5, 0.75, 1]
/** A plausible count band per level, so the tooltip agrees with the colour. */
const LEVEL_FLOOR = [0, 1, 3, 7, 13]
const LEVEL_SPREAD = [1, 2, 4, 6, 9]

function dayCount(col: number, row: number) {
  const l = level(col, row)
  if (l === 0) return 0
  return LEVEL_FLOOR[l] + ((hash(col, row) >>> 7) % LEVEL_SPREAD[l])
}

/** "3 contributions · Mar 12", from a cell's DOM-order index. */
function tipLabel(i: number) {
  const col = Math.floor(i / GRAPH_ROWS)
  const row = i % GRAPH_ROWS
  const n = dayCount(col, row)
  const d = new Date(GRAPH_END - (GRAPH_COLS * GRAPH_ROWS - 1 - i) * DAY_MS)
  const when = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
  if (n === 0) return `No contributions · ${when}`
  return `${n} contribution${n === 1 ? "" : "s"} · ${when}`
}

function ContributionGraph() {
  const wrapRef = React.useRef<HTMLDivElement | null>(null)
  const tipRef = React.useRef<HTMLDivElement | null>(null)

  const onPointerOver = React.useCallback((event: React.PointerEvent) => {
    const tip = tipRef.current
    const wrap = wrapRef.current
    if (!tip || !wrap) return

    const cell = (event.target as HTMLElement).closest?.(
      "[data-day]"
    ) as HTMLElement | null
    if (!cell) {
      tip.style.opacity = "0"
      return
    }

    // Text first: the clamp below needs the width this label actually takes,
    // and the label's width changes with the day.
    tip.textContent = tipLabel(Number(cell.dataset.day))
    const half = tip.offsetWidth / 2
    const centre = cell.offsetLeft + cell.offsetWidth / 2
    const x = Math.min(Math.max(centre, half), wrap.offsetWidth - half)
    tip.style.left = `${x}px`
    tip.style.top = `${cell.offsetTop}px`
    tip.style.opacity = "1"
  }, [])

  const onPointerLeave = React.useCallback(() => {
    if (tipRef.current) tipRef.current.style.opacity = "0"
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}
    >
      <div
        aria-hidden="true"
        className="grid"
        style={{
          gap: CELL_GAP,
          gridTemplateColumns: `repeat(${GRAPH_COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${GRAPH_ROWS}, ${CELL}px)`,
          gridAutoFlow: "column",
        }}
      >
        {Array.from({ length: GRAPH_COLS * GRAPH_ROWS }, (_, i) => {
          const l = level(Math.floor(i / GRAPH_ROWS), i % GRAPH_ROWS)
          return (
            <span
              key={i}
              data-day={i}
              className="rounded-[2px] bg-muted"
              style={
                l === 0
                  ? undefined
                  : {
                      backgroundColor: "var(--color-status-available)",
                      opacity: LEVEL_OPACITY[l],
                    }
              }
            />
          )
        })}
      </div>

      {/* Stone-dark, whatever the theme: a tooltip is the one surface in the
          family that INVERTS, so it reads as an annotation on the card rather
          than another panel of it. `stone-900 / stone-950` is the same pair
          Colin uses and the same pair the palette's own hints use. */}
      <div
        ref={tipRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 -translate-x-1/2 translate-y-[calc(-100%-4px)] rounded-md bg-stone-900 px-1.5 py-1 text-[11px] leading-none whitespace-nowrap text-stone-100 opacity-0 shadow-md [transition:opacity_100ms_var(--motion-glide)] dark:bg-stone-950"
      />
    </div>
  )
}
