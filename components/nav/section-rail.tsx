"use client"

import * as React from "react"
import Link from "next/link"

import { clsx } from "clsx"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@/lib/icons"
import {
  clamp,
  createWheelEngine,
  lensBlur,
  lensFill,
  lensOpacity,
  lensTransform,
  type WheelEngine,
} from "@/lib/wheel-engine"

/* ----------------------------------------------------------------------------
   The section wheel.

   IT IS THE HOME WHEEL NOW. Ion's ruling, 2026-08-18: "why are these wheels not
   acting the same as the one on the home page?" This wheel used to compute one
   integer — the section whose top last crossed the 40% line — and swap a
   class. The landing's wheel instead holds a CONTINUOUS position, lerps it
   toward the scroll, and paints a lens off the fraction. That is the whole
   difference between a highlight that slides and a highlight that slams.

   The physics now come from `lib/wheel-engine.ts`, a copy of the landing's
   `components/landing/use-wheel.ts` (lerp 0.12, the 40% line, the 400px
   handoff, the lens ladder, the 150ms lens release). That file documents what
   was copied and the three options added for variable-height sections; the
   landing keeps running its own copy and is untouched.

   WHAT THE FRACTION DRIVES HERE
     opacity   the lens falloff, PERMANENTLY. This is the one place the rail
               parts company with the landing: the landing's resting rows are
               flat, so it gates opacity on motion, while the frame's rail rows
               rest at 1 / .75 / .59 / .47 — the dim ladder IS the resting
               state. Feeding it the fraction is what makes it glide.
     fill      the active row's muted rectangle, crossfading between rows.
     push,     motion only, multiplied by the lens, cleared the moment the
     scale,    wheel settles — so a settled rail is pixel-identical to the
     blur      frame.

   The ladder the continuous curve produces at whole distances is
   1 / .756 / .585 / .495 against the frame's 1 / .75 / .59 / .47. The first
   three are the frame; the fourth is the collection-lab's own JavaScript
   curve, which has always disagreed with the frame's .47 at distance 3 (it was
   flagged when this rail was written, with a literal ladder used instead).
   Making the wheel continuous forces the curve, so .495 wins now — a hair
   lighter than the frame on the FOURTH row out, and only the letter is even
   four rows long. Re-flagged in the report.

   REDUCED MOTION: instant and discrete. The engine snaps the position and
   holds the lens at 0; the paint below rounds the position too, so the ladder
   lands on whole steps and nothing eases.
   ------------------------------------------------------------------------- */

/** How far, in px, before the document bottom the wheel starts pulling to the
 *  last row. A short final section can never cross the 40% line, so without
 *  this the last row is unreachable — the old integer wheel had the same guard
 *  as a hard `atEnd` test. A window makes it a glide instead of a snap. */
const END_PULL = 260

/** Vertical gap between "Home" and the wheel.
 *
 *  RULED, and a sanctioned deviation from Figma: the frames hand-place 112px
 *  (there is no auto-layout in the rail) and Ion called it too much on
 *  2026-08-18 — "move the wheel up", 48-64px. 56 is the middle of that range
 *  and the one that keeps the wheel's first row optically level with the top
 *  of the reading column's title block at 1512. */
const WHEEL_GAP = "mt-14"

/** Is the wheel actually on screen? Nothing below is attached until it is.
 *  Below `lg` the wheel is `display: none` and there is nothing for six
 *  listeners and a rAF loop to drive. Written in `rem` for the same reason the
 *  Tailwind utility is: a reader who raised their base font size gets the same
 *  breakpoint the CSS gives them. MUST track the rail's visibility breakpoint
 *  in rail-shell.tsx. */
const RAIL_QUERY = "(min-width: 64rem)"

/* ----------------------------------------------------------------------------
   THE CONDITIONAL WHEEL — Ion's ruling, 2026-08-18.

   The wheel answers "where am I in this?". On a page you can take in without
   scrolling, that question has no content, and the answer is furniture. So the
   wheel now has a condition: the reading column has to be longer than
   `WHEEL_MIN_RATIO` viewports before it appears. The BACK BUTTON is
   unconditional — "← Home" / "← Writing" is how you leave, and that is always
   a live question.

   In practice, today: the letter and the long articles keep their wheel; the
   three collection pages and the short articles drop it and grow into it as
   Ion's real content lands. Nothing is configured per page — the page's own
   height decides.

   ── WHAT IS MEASURED, and why it is not the document ───────────────────────

   The READING COLUMN plus the page's own top and bottom padding — which is the
   document's height, arrived at without ever asking the rail how tall it is.

   `document.scrollHeight` would be the obvious thing to measure and is the one
   thing that cannot be used: the rail and the reading column share a grid ROW,
   so the row is as tall as the taller of the two. On a page with many short
   sections the rail can be the taller one — and then removing the wheel
   shortens the document, which drops it back under the threshold, which brings
   the wheel back, which lengthens the document. A wheel that flickers on and
   off forever is a worse bug than a wheel that should not be there. Leaving the
   rail out of the sum removes the feedback loop by construction.

   The padding is REAL and has to be counted. Dropping it cost the letter its
   wheel in the first pass: 1382px of prose in a 945px window is 1.46 viewports
   and fails, while the page the reader actually scrolls — 136 + 1382 + 136 —
   is 1.75 and passes. The frame's own 136px top and bottom are page, not
   margin.

   ── NO LAYOUT SHIFT ────────────────────────────────────────────────────────

   Two independent guarantees, because "reserve the space OR fade it in" is
   cheap enough to do both:

     1. The wheel is the LAST element in the rail's column and nothing follows
        it, so its presence moves nothing — not the back button above it, not
        the reading column beside it (a fixed 272px grid track), not the page.
     2. It is in the DOM from the server render and stays in flow. Only
        `opacity` changes. There is no mount, no unmount, and nothing to
        reflow.

   The server cannot know the viewport, so it renders the wheel at opacity 0 and
   the measurement runs in a LAYOUT effect — before the browser paints the
   hydrated tree — so a qualifying page never paints a frame with the wheel in
   the wrong state. The 400ms fade is the grace on top of that: the wheel
   arrives, it does not pop. Under `prefers-reduced-motion` the global rule in
   globals.css collapses that transition to nothing, which is correct — the
   ruling is about whether the wheel exists, not about how it moves.

   A wheel that has not qualified is `inert` and `aria-hidden`: invisible to the
   pointer, to the keyboard and to a screen reader. It is dropped in every sense
   a reader can perceive; it simply keeps its 200px of empty rail column so the
   geometry can never move.
   ------------------------------------------------------------------------- */

/** Reading column height, in viewports, above which the wheel earns its place.
 *  1.5 is Ion's number: one screen you can see, plus half a screen you cannot,
 *  is the shortest page where "where am I" is a real question. */
const WHEEL_MIN_RATIO = 1.5

/** Where the back button goes, and what it says. The letter and the three
 *  collections go Home; an article goes back to its index. POR-27:
 *  "destination-labelled back button". */
export type RailBack = { href: string; label: string }

const HOME: RailBack = { href: "/", label: "Home" }

export type SectionNavItem = { id: string; nav: string }

/** The two elements a row hands the wheel: itself, and its fill. */
type RailRow = { row: HTMLElement | null; fill: HTMLElement | null }

/** Last value written per element, so a frame only touches what changed
 *  (use-wheel.ts lines 134-158). `" "` is "nothing written yet". */
type RowCache = {
  o: string | null
  f: string | null
  t: string | null
  b: string | null
  z: string | null
  wc: string | null
}

const freshCache = (): RowCache => ({
  o: " ",
  f: " ",
  t: " ",
  b: " ",
  z: " ",
  wc: " ",
})

/**
 * The left rail — "Home" and the section wheel.
 *
 * ONE rail, four pages. It was built for the letter (Figma "Letter — light"
 * 13:2942 → "Left rail") and the three collection frames redraw it byte for
 * byte — "Stack — desktop light" 20:1034, "Agents & skills" 20:1294,
 * "Articles" 20:1364 all repeat the same 85x32 Home button and the same 200x32
 * wheel rows at 12px pitch. Only the labels differ (letter headings /
 * categories / years), so the rail is generalised rather than forked.
 * `sections` is whatever the page's wheel lists; `label` names the nav for a
 * screen reader.
 *
 * The rail box is 263 wide in the frames but its contents are 200, and it sits
 * 272px to the left of the centred 640 column; `rail-shell.tsx` reproduces
 * that and carries the responsive reasoning. What lives here is only what is
 * inside the rail:
 *
 *   Back button     85x32, ArrowLeft 16, `default` size, variant `secondary` —
 *                   "Home" everywhere the frames draw it, "Writing" on an
 *                   article detail page (POR-27: the label names the
 *                   destination, not the gesture). Unconditional; the wheel
 *                   beside it is not.
 *                   the frame's own variant. Round 1 made it `ghost`; Ion
 *                   reversed that for THIS button on 2026-08-18. Call-site
 *                   variant only; the Button set is untouched.
 *   56px gap        `WHEEL_GAP` above — was the frame's 112, ruled down.
 *   Section wheel   rows 200x32, `rounded-md` (12), 12px vertical gap, 4/12
 *                   padding, label at the Subhead step, the active row's fill
 *                   on `muted`, the rest dimmed by the lens.
 *
 * The "scroll →" caption that used to sit under the wheel is GONE — Ion,
 * 2026-08-18: a prototype artifact. All four pages lose it.
 *
 * Rows are anchors, not buttons: with JavaScript off (or before hydration) a
 * click still jumps to the section, and `globals.css` gives every `[id]` the
 * 96px scroll clearance either way.
 */
export function SectionRail({
  sections,
  label,
  back = HOME,
}: {
  sections: SectionNavItem[]
  /** `aria-label` for the wheel — "About sections", "Stack sections", … */
  label: string
  /** Defaults to "← Home". Article pages pass "← Writing". */
  back?: RailBack
}) {
  const [active, setActive] = React.useState(0)
  const [visible, setVisible] = React.useState(false)
  /** Is the reading column long enough to earn a wheel? See WHEEL_MIN_RATIO. */
  const [longEnough, setLongEnough] = React.useState(false)

  const railRef = React.useRef<HTMLDivElement>(null)
  const rowsRef = React.useRef<(RailRow | null)[]>([])
  const cachesRef = React.useRef<RowCache[]>([])
  const engineRef = React.useRef<WheelEngine | null>(null)

  /* A wheel click is a statement about where the reader is, and it outranks
     the 40% line until they move the page themselves. Without it, clicking a
     short section parks it at the top and leaves the line sitting inside the
     NEXT one, so the rail immediately contradicts the click. The engine still
     LERPS to the held index, so the click glides like a scroll. The hold is
     released by a real gesture only — never by the smooth scroll's own scroll
     events. (collection-lab rulebook: "A wheel click outranks the line".) */
  const heldRef = React.useRef<number | null>(null)

  const slot = (index: number) => {
    const existing = rowsRef.current[index]
    if (existing) return existing
    const created: RailRow = { row: null, fill: null }
    rowsRef.current[index] = created
    return created
  }

  React.useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia(RAIL_QUERY)
    } catch {
      // No matchMedia is a very old browser, not a narrow one: fall back to
      // attaching, because a rail that never lights up is the worse failure.
      setVisible(true)
      return
    }
    const sync = () => setVisible(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  /* Does this page qualify for a wheel? See the CONDITIONAL WHEEL note above.
     A LAYOUT effect: it runs before the browser paints the hydrated tree, so a
     qualifying page does not paint a frame without its wheel. */
  React.useLayoutEffect(() => {
    if (sections.length < 2) {
      // One section is not a wheel, it is a label. Nothing to track.
      setLongEnough(false)
      return
    }

    /* The reading column is the rail's next sibling in the grid, and the grid
       is the rail's parent — see rail-shell.tsx. Reading both off the DOM
       rather than threading refs through three components keeps `RailShell`'s
       children API exactly as it was. */
    const column = railRef.current?.nextElementSibling as HTMLElement | null
    const grid = railRef.current?.parentElement
    if (!column || !grid) return

    const measure = () => {
      /* THE PAGE HEIGHT, AS IF THE RAIL WERE NOT THERE.
         `column + the grid's own vertical padding` is the document height on
         every page where the reading column is the taller of the two grid
         items — which is every page — and it stays that number when it is not.
         The rail's height is deliberately absent from the sum: include it and
         a wheel could shorten the page below the threshold, which would bring
         it back, which would lengthen the page again, forever.
         (The 136px top/bottom padding is `py-34` above `lg`, `py-16` below, so
         it is read rather than assumed.) */
      const style = getComputedStyle(grid)
      const padding =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      const height = padding + column.getBoundingClientRect().height
      setLongEnough(height > window.innerHeight * WHEEL_MIN_RATIO)
    }
    measure()

    /* Three things move the answer: the window resizing (both terms change),
       the column reflowing at a width the window did not change for (an image
       loading, a font swapping), and the webfont landing — which is the one
       that reliably moves a page of prose across the line. */
    const observer = new ResizeObserver(measure)
    observer.observe(column)
    window.addEventListener("resize", measure)
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) measure()
    })

    return () => {
      cancelled = true
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [sections])

  const showWheel = visible && longEnough

  React.useEffect(() => {
    if (!showWheel) return

    /* The array itself is created once and only ever mutated in place by
       `slot`, so holding the reference for the effect's lifetime is safe — and
       it is what the exhaustive-deps rule wants to see in the cleanup. */
    const rows = rowsRef.current
    const caches = cachesRef.current

    const setStyle = (
      el: HTMLElement | null,
      prop: "transform" | "opacity" | "filter" | "zIndex" | "willChange",
      value: string | null
    ) => {
      if (!el) return
      el.style[prop] = value ?? ""
    }

    const paint = (f: number, lens: number, reduced: boolean) => {
      /* Reduced motion gets whole steps: the ladder still describes the page,
         it just never sits between two rungs. */
      const position = reduced ? Math.round(f) : f
      const lit = lens > 0

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        if (!r) continue
        const cache = caches[i] ?? (caches[i] = freshCache())

        const offset = i - position
        const d = offset < 0 ? -offset : offset

        const opacity = String(lensOpacity(d))
        const fill = String(lensFill(d))
        const t = lit ? lensTransform(offset, lens) : null
        const b = lit ? lensBlur(d, lens) : null
        const z = lit ? String(10 - Math.round(clamp(d, 0, 4) * 2)) : null
        /* will-change only for the duration of the motion. Left on permanently
           it promotes every row to its own compositing layer, which changes
           text antialiasing at rest. */
        const wc = lit ? "transform, opacity" : null

        if (cache.o !== opacity) {
          setStyle(r.row, "opacity", opacity)
          cache.o = opacity
        }
        if (cache.f !== fill) {
          setStyle(r.fill, "opacity", fill)
          cache.f = fill
        }
        if (cache.t !== t) {
          setStyle(r.row, "transform", t)
          cache.t = t
        }
        if (cache.b !== b) {
          setStyle(r.row, "filter", b)
          cache.b = b
        }
        if (cache.z !== z) {
          setStyle(r.row, "zIndex", z)
          cache.z = z
        }
        if (cache.wc !== wc) {
          setStyle(r.row, "willChange", wc)
          cache.wc = wc
        }
      }
    }

    const engine = createWheelEngine({
      anchors: () => sections.map((s) => document.getElementById(s.id)),
      render: paint,
      onIndex: setActive,
      endPull: END_PULL,
      override: () => heldRef.current,
    })
    engineRef.current = engine

    const release = () => {
      if (heldRef.current === null) return
      heldRef.current = null
      engine.start()
    }

    /* pointerdown covers a scrollbar drag, which fires no wheel event. It also
       fires before `click`, so pressing a wheel row releases the old hold a
       beat before the click handler sets the new one. */
    window.addEventListener("wheel", release, { passive: true })
    window.addEventListener("touchmove", release, { passive: true })
    window.addEventListener("keydown", release)
    window.addEventListener("pointerdown", release)

    return () => {
      window.removeEventListener("wheel", release)
      window.removeEventListener("touchmove", release)
      window.removeEventListener("keydown", release)
      window.removeEventListener("pointerdown", release)
      engine.destroy()
      engineRef.current = null
      /* The rail may come back (a resize across `lg`), and it must not inherit
         a half-finished frame's inline styles. */
      caches.length = 0
      for (const r of rows) {
        if (!r) continue
        r.row?.removeAttribute("style")
        r.fill?.removeAttribute("style")
      }
    }
  }, [sections, showWheel])

  const onSelect = (
    event: React.MouseEvent<HTMLAnchorElement>,
    index: number,
    id: string
  ) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    heldRef.current = index
    setActive(index)
    /* `scrollIntoView`, not the engine's own jump: every `[id]` on the site
       carries a 96px `scroll-margin-top` from globals.css, and this keeps that
       one number in charge of where a section lands.
       Reduced motion falls back to an instant jump. The global
       `scroll-behavior: auto !important` cannot do this for us — an explicit
       `behavior: "smooth"` here would override it. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
    engineRef.current?.start()
  }

  return (
    <div
      ref={railRef}
      className="flex flex-col items-start lg:sticky lg:top-34 lg:self-start"
    >
      <Button variant="secondary" asChild>
        <Link href={back.href}>
          <ArrowLeft />
          {back.label}
        </Link>
      </Button>

      {/* The wheel is a desktop convenience: it needs the rail column, and the
          frame has no mobile letter yet. Below lg the page falls back to the
          document's own heading order, and the back button stays. Flagged in
          the report as a judgement call, not a rule inferred from the frame.

          `opacity` and `inert` — never `display` — carry the conditional-wheel
          ruling, so the element's box never changes and nothing can shift.
          See the CONDITIONAL WHEEL note at the top of this file. */}
      <nav
        aria-label={label}
        aria-hidden={showWheel ? undefined : true}
        inert={!showWheel}
        data-wheel={showWheel ? "on" : "off"}
        className={clsx(
          WHEEL_GAP,
          "hidden flex-col gap-3 lg:flex",
          "[transition-property:opacity]",
          "[transition-duration:var(--duration-slow)]",
          "[transition-timing-function:var(--motion-glide)]",
          showWheel ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {sections.map((section, i) => {
          const isActive = i === active
          return (
            <a
              key={section.id}
              ref={(el) => {
                slot(i).row = el
              }}
              href={`#${section.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => onSelect(event, i, section.id)}
              // `clsx`, not `cn`: tailwind-merge cannot know that `subhead` is
              // a size, so it files `text-subhead` under text-COLOUR and drops
              // whichever of `text-subhead` / `text-foreground` comes first.
              // Same footgun documented in components/ui/kbd.tsx. There is no
              // incoming className to merge here, so twMerge buys nothing.
              className={clsx(
                // w-50 is 200 — the frame's row width, and the whole rail
                // column at the narrow end of the desktop range.
                "relative isolate flex h-8 w-50 items-center rounded-md px-3 py-1",
                "text-subhead text-foreground",
                // The hover-snap rule: background in at 0ms, out over 150ms
                // (motion-system-spec principle 5, same as the Button). ONLY
                // the background transitions — the row's opacity and transform
                // are written per frame by the wheel and must not be caught by
                // a transition.
                "[transition-property:background-color]",
                "[transition-duration:var(--duration-fast)]",
                "[transition-timing-function:var(--motion-glide)]",
                "hover:bg-muted hover:[transition-duration:0ms]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              )}
            >
              {/* The active fill, driven per frame so the highlight crossfades
                  between rows instead of hopping. It starts on the class the
                  server rendered and is inline-driven from the wheel's first
                  paint onward. */}
              <span
                aria-hidden="true"
                ref={(el) => {
                  slot(i).fill = el
                }}
                className={clsx(
                  "pointer-events-none absolute inset-0 -z-10 rounded-md bg-muted",
                  isActive ? undefined : "opacity-0"
                )}
              />
              {/* ONE LINE, ALWAYS. The letter's and the collections' labels
                  are short by authorship, but an ARTICLE's wheel rows are its
                  own h2s, and nobody writes a heading to fit a 200px rail. A
                  wrapped label breaks the frame's 32px row and takes the 12px
                  pitch with it, so a long label clips instead. The full text
                  stays in the DOM, so a screen reader reads the whole heading.
                  On its own span, not on the row: `text-overflow` needs a
                  block container, and the row is a flex box. */}
              <span className="min-w-0 truncate">{section.nav}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
