"use client"

import * as React from "react"

import { SettleImage } from "@/components/ui/settle-in"
import {
  createSpring,
  prefersReducedMotion,
  SPRING_CELL,
  SPRING_CROSSFADE,
  type SpringDriver,
} from "@/lib/motion"

/* ============================================================================
   CoverFlow — a fanned deck of photographs that spreads on hover and can be
   dragged through.

   POR-31. It replaces the letter's static two-up photo row. Ion's reference is
   amicro.vercel.app/components/card-cover-flow; what came from there and what
   did not is written out at the end of this comment, because "rebuilt in our
   system" is a claim that ought to be checkable.

   ── THE MODEL: TWO NUMBERS, ONE FRAME FUNCTION ─────────────────────────────

   Every card's appearance is a pure function of two scalars:

     pos      the fractional index at the centre of the deck. 0 puts the first
              photograph in front; 2.4 is two-fifths of the way from the third
              to the fourth. A drag moves it continuously, a release settles it
              on an integer.
     spread   0 = the resting fan (a hand of photographs), 1 = the open flow
              (the front card square to the reader, its neighbours turned away).

   `frame(offset, spread)` turns those into a transform, an opacity and a
   z-index. NOTHING ELSE DECIDES ANYTHING, and that is what makes the
   interaction interruption-safe by construction: there is no per-card state to
   fall out of step, and grabbing the deck halfway through a spread just seeds
   the drag from whatever `pos` happens to be.

   The same `frame` runs on the server for the resting fan and in the rAF loop
   for every frame after, so the deck cannot look different before and after
   hydration.

   ── THE CHANNEL: `--cf-t`, AND WHY IT IS NOT `style.transform` ─────────────

   The paint writes three custom properties per card rather than the properties
   themselves. It is the same trick as the morph's `--morph-p` and the icon
   swap's `--swap-p` — one JS-owned value, CSS decides what to do with it —
   and here it buys the reduced-motion path for free. `transform` is applied
   by a `motion-safe:` utility, so under `prefers-reduced-motion: reduce` the
   variable is simply never read and the cards lie flat in an ordinary row. An
   inline `style.transform` would have won that fight and there would have been
   no way to hold the fan back without a second React tree.

   It also means the server can render the resting fan into the HTML: with
   JavaScript off, or before hydration, the deck is already fanned and already
   correct. Nothing flashes.

   ── THE COMPONENT RENDERS EXACTLY ONCE ─────────────────────────────────────

   No `useState`, anywhere. This is the discipline `components/ui/press-spring.tsx`
   documents at length, and it is a correctness requirement rather than tidiness:
   a re-render re-runs callback refs, React tears the old one down and attaches
   the new one, and a spring rebuilt mid-flight restarts at velocity zero —
   which is exactly the stutter a spring is chosen to prevent. So the pointer
   handlers talk to the drivers directly and React never hears about the drag.

   ── THE MOTION PATH: rAF, NOT `motion/react` ───────────────────────────────

   CLAUDE.md allows `motion/react` for micro-interactions behind a proven ≤3KB
   gz split point. This surface has none: it is reached from `prose.tsx`, which
   every letter section renders through, so LazyMotion would land on /letter's
   first load rather than behind a gate. The sanctioned alternative is the rAF
   integrator in `lib/motion.ts` — `createSpring`, reading the very same
   constants `motion/react` would have been handed. Measured first-load delta
   for /letter is in the report.

   ── WHICH SPRING, AND WHY ──────────────────────────────────────────────────

   The shelf splits motion into a READOUT that snaps and CONTENT that settles.
   Both halves exist here, so both families get used, and neither is invented:

     spread  SPRING_CELL       520/34/0.45   A READOUT. The spread is the deck
             ~171ms to 95%                   answering "you can move this", and
                                             it has to land inside
                                             `--duration-base` for the reason
                                             `SPRING_POP` gives about the hover
                                             preview: a hover response is a
                                             thing you wait for.

     pos     SPRING_CROSSFADE  260/34/0.8    CONTENT. The deck travelling across
             ~342ms to 95%                   space is interior.dev's own case
                                             for this family, and a photograph
                                             arriving wants the longer, softer
                                             settle. The reference's hand-picked
                                             200/25 sits in the same
                                             neighbourhood; CROSSFADE is the
                                             version of it we already own.

     A THIRD SPRING RUNS HERE AND IS NOT THIS COMPONENT'S: each photograph
     settles in when its own bytes land, on `SPRING_SETTLE` — the muted plate
     behind the card, the picture rising out of it. It lives in
     `components/ui/settle-in.tsx` as a bare callback ref precisely so it can
     be attached inside the `photos.map` below without a hook and without a
     single re-render, which is what keeps the "renders exactly once" rule
     above true. The deck's own two drivers never learn that it happened.

   ── REDUCED MOTION IS A CSS DECISION ───────────────────────────────────────

   Under `prefers-reduced-motion: reduce` this is a plain horizontal row of
   photographs that scrolls if it overflows — no fan, no perspective, no drag,
   as the ticket asks. The layout is chosen by Tailwind's `motion-safe:` /
   `motion-reduce:` variants, so there is ONE server-rendered tree and no
   hydration branch. JavaScript then declines to attach: the drivers are never
   built and the channel is never written, so the stylesheet is unopposed.

   The media query is subscribed to, not read once, so flipping the OS setting
   with the page open swaps behaviour in both directions.

   ── WHAT CAME FROM AMICRO ──────────────────────────────────────────────────

   TAKEN, as a geometry idea: the cover-flow ladder — derive x, rotateY,
   translateZ, scale and opacity from a card's signed offset from centre, stack
   z-index by absolute offset, under one `perspective` on the container. Their
   numbers (x 32, rotateY ±38, z ±50, scale −0.08/step, opacity −0.25/step, on
   an 80px card) were the starting point for the ladder below, re-derived
   against a 288px card. The idea of a stack that lifts and rotates on hover is
   the same author's `card-wheel-fan`, and only the idea survives.

   NOT TAKEN: their code. Framer Motion, a `<motion.div animate>` per card,
   `useState(activeIndex)`, the Unsplash sources, the dark glassmorphic chrome,
   the chevron-and-dots pill, `bg-zinc-950/40`, `border-white/10`,
   `shadow-2xl`, `text-white/80`. The reference has no hover spread, no drag,
   no keyboard, no reduced-motion path and no caption model; all of that is
   ours.

   RETHEMED: every surface is a ratified token. Cards wear `bg-card` and the
   Raised elevation — whose fifth layer IS the 1px ring, so `shadow-raised`
   gives the card its edge and a `border` would be a second one. Radii are
   concentric off the ratified steps: `rounded-xl` (21px) outside, 6px of card
   left showing as a print margin, and 21 − 6 = 15 = `rounded-lg` on the image.
   ========================================================================== */

export type CoverFlowPhoto = {
  /** Path under /public. */
  src: string
  /** The photograph's own description. This carries the meaning; the caption
   *  is a label beside it, not a substitute for it. */
  alt: string
  /** The line under the deck, at Caption (`text-xs`) — the frame's own step. */
  caption: string
}

/* ---------------------------------------------------------------------------
   The geometry ladder.

   Both states are spelled in the same five terms so one number can blend them.

   THE HORIZONTAL STEP IS A FRACTION OF THE CARD'S OWN WIDTH and is spent as a
   PERCENTAGE in `translateX`, which resolves against the element's own border
   box. That is what lets the deck rescale from 288px in the reading column to
   234px at 390 with no media query in JavaScript and no measurement at all —
   and it is what makes the server-rendered resting fan exact.

   DEPTH IS ABSOLUTE PIXELS, and deliberately not a fraction. It is spent in
   `translateZ` against a fixed 1200px perspective, so scaling it with the card
   would change how hard the deck foreshortens on a phone.
   ------------------------------------------------------------------------- */

type Rung = {
  /** Horizontal step per index, as a fraction of card width. */
  step: number
  /** Peak Y-rotation of the off-centre cards, degrees. */
  turn: number
  /** In-plane tilt per index, degrees. The hand-of-photographs look. */
  tilt: number
  /** Depth step per index, px. */
  depth: number
  /** Scale lost per index of distance from centre. */
  falloff: number
}

/** Resting: a fan wide enough to read as five photographs, tilted like a hand
 *  of cards, with just enough turn to say the deck has depth. */
const REST: Rung = { step: 0.16, turn: 10, tilt: 2.6, depth: 20, falloff: 0.035 }

/** Open: the cover flow. A wider throw, the front card square to the reader,
 *  its neighbours turned hard away.
 *
 *  0.38 of card width was measured, not guessed. At 0.29 the neighbours sat
 *  70% behind the front card and the open state read as "the stack got
 *  bigger" rather than as a flow. 0.38 puts the second card out at roughly the
 *  reading column's edge once its turn and falloff have shrunk it — the widest
 *  throw that still lands inside 640 rather than being sliced by the clip. */
const OPEN: Rung = { step: 0.38, turn: 34, tilt: 0, depth: 52, falloff: 0.06 }

/** What the front card gains as the deck opens: it rises, comes forward
 *  through the perspective, and grows a little. All three are small on
 *  purpose — this is a photograph stepping out of a stack, not a pop. */
const FRONT_LIFT = 10
const FRONT_Z = 40
const FRONT_GROW = 0.02

/** Cards fade out between these distances from centre, so a long deck does not
 *  pile visible edges at the ends of the fan. */
const FADE_FROM = 2
const FADE_TO = 3

/** Depth is capped: past three cards back there is nothing left to see, and an
 *  uncapped deck would eventually push a card through the perspective origin. */
const DEPTH_CAP = 3

/** Card width to assume before the DOM can be measured. Matches the `18rem`
 *  ceiling in the markup; it is only ever a first-gesture fallback. */
const NOMINAL_WIDTH = 288

/** Past the ends, a drag moves the deck by this fraction of the distance.
 *  Rubber rather than a wall — you can feel that you have run out. */
const RESISTANCE = 0.35

/** Seconds of the flick's velocity projected past the release. 0.12s is about
 *  one hand-off: a lazy drag lands on the neighbour, a flick carries three. */
const FLICK_PROJECTION = 0.12

/** A pointer that travelled less than this was never a drag, so the gesture
 *  resolves as a click on whichever card is under it. */
const CLICK_SLOP = 4

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** What one card looks like, given where it sits relative to the deck's centre
 *  and how far open the deck is. The only place geometry is decided. */
function frame(offset: number, spread: number) {
  const distance = Math.abs(offset)
  // How much of the front card's privilege this card holds: 1 dead centre, 0
  // by the time its neighbour is.
  const front = Math.max(0, 1 - distance)
  // Clamped to ±1 so the turn eases through zero at the centre rather than
  // flipping sign — that is what makes a drag read as a rotation and not a swap.
  const direction = clamp(offset, -1, 1)
  const capped = Math.min(distance, DEPTH_CAP)

  const x = offset * lerp(REST.step, OPEN.step, spread) * 100
  const y = -FRONT_LIFT * spread * front
  const z = -capped * lerp(REST.depth, OPEN.depth, spread) + FRONT_Z * spread * front
  const turn = -lerp(REST.turn, OPEN.turn, spread) * direction
  const tilt = lerp(REST.tilt, OPEN.tilt, spread) * offset
  const scale =
    1 - capped * lerp(REST.falloff, OPEN.falloff, spread) + FRONT_GROW * spread * front

  return {
    // Placed, then turned. The −50% pair centres the card against
    // `left-1/2 top-1/2`; the card's own centre origin makes rotateY a turn in
    // place rather than a swing.
    transform:
      `translate3d(calc(-50% + ${x.toFixed(2)}%), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px)` +
      ` rotateY(${turn.toFixed(2)}deg) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
    opacity: clamp((FADE_TO - distance) / (FADE_TO - FADE_FROM), 0, 1).toFixed(3),
    // Integer, derived from distance, so the front card is on top through a
    // drag — including at the half-way point where two cards are equidistant.
    zIndex: String(1000 - Math.round(distance * 100)),
    // The caption belonging to this card. Gone by the time its neighbour is
    // centred, so only ever one line is legible.
    caption: clamp(1 - distance * 1.8, 0, 1).toFixed(3),
  }
}

type Drag = {
  id: number
  originX: number
  originPos: number
  travelled: number
  /** Index of the card the gesture started on, or −1 for the bare deck. */
  index: number
  lastX: number
  lastAt: number
  /** Index units per second, sign matching `pos`. */
  velocity: number
}

export function CoverFlow({
  photos,
  label = "Photographs",
}: {
  photos: CoverFlowPhoto[]
  /** The deck's accessible name. */
  label?: string
}) {
  const last = photos.length - 1
  /** Where the deck rests before anyone touches it: centred on itself. */
  const home = last / 2

  const cardsRef = React.useRef<(HTMLElement | null)[]>([])
  const capsRef = React.useRef<(HTMLElement | null)[]>([])

  const posRef = React.useRef(home)
  const spreadRef = React.useRef(0)

  const posDriver = React.useRef<SpringDriver | null>(null)
  const spreadDriver = React.useRef<SpringDriver | null>(null)
  const dragRef = React.useRef<Drag | null>(null)
  const hoverRef = React.useRef(false)

  /* -- paint ---------------------------------------------------------------
     Both drivers call this. When they are both running the second call in a
     frame would repeat the first's work, so the last painted pair is kept and
     compared — cheaper than the style writes it saves.                      */

  const paintedRef = React.useRef("")

  const paint = React.useCallback(() => {
    const pos = posRef.current
    const spread = spreadRef.current
    const key = `${pos.toFixed(4)}|${spread.toFixed(4)}`
    if (key === paintedRef.current) return
    paintedRef.current = key

    for (let i = 0; i < cardsRef.current.length; i++) {
      const el = cardsRef.current[i]
      if (!el) continue
      const f = frame(i - pos, spread)
      el.style.setProperty("--cf-t", f.transform)
      el.style.setProperty("--cf-o", f.opacity)
      el.style.setProperty("--cf-z", f.zIndex)
      const cap = capsRef.current[i]
      if (cap) cap.style.opacity = f.caption
    }
  }, [])

  /* -- setup ---------------------------------------------------------------
     A layout effect rather than an effect, so a driver exists before the
     browser's first paint and a pointer that is already down cannot find a
     half-built deck.                                                        */

  React.useLayoutEffect(() => {
    const teardown = () => {
      posDriver.current?.stop()
      spreadDriver.current?.stop()
      posDriver.current = null
      spreadDriver.current = null
      paintedRef.current = ""
    }

    const attach = () => {
      // Reduced motion: the stylesheet is already rendering the static row and
      // is not reading the channel, so there is nothing to drive. Building the
      // springs anyway would just burn frames writing variables no rule uses.
      if (prefersReducedMotion()) return
      posDriver.current = createSpring(
        SPRING_CROSSFADE,
        (value) => {
          posRef.current = value
          paint()
        },
        posRef.current,
        // A thousandth of an index is well under a pixel at any card size, so
        // the deck stops when it has visually arrived.
        0.001
      )
      spreadDriver.current = createSpring(
        SPRING_CELL,
        (value) => {
          spreadRef.current = value
          paint()
        },
        spreadRef.current,
        0.001
      )
    }

    attach()

    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onQuery = () => {
      teardown()
      attach()
    }
    query.addEventListener("change", onQuery)

    return () => {
      query.removeEventListener("change", onQuery)
      teardown()
    }
  }, [paint])

  /* -- the two channels' setters ------------------------------------------ */

  const openTo = React.useCallback((value: number) => {
    const driver = spreadDriver.current
    if (!driver) return
    // Re-read per call rather than cached: the OS setting can change while the
    // page is open.
    if (prefersReducedMotion()) driver.snap(value)
    else driver.set(value)
  }, [])

  const settleOn = React.useCallback(
    (index: number) => {
      const driver = posDriver.current
      if (!driver) return
      const target = clamp(Math.round(index), 0, last)
      if (prefersReducedMotion()) driver.snap(target)
      else driver.set(target)
    },
    [last]
  )

  /** Index-space distance of one pointer pixel, at the CURRENT spread. The
   *  card's layout width is read rather than stored: `offsetWidth` ignores the
   *  transform we just wrote, so this cannot feed back on itself, and reading
   *  it at the START of a gesture means a resize needs no bookkeeping. */
  const stepPx = React.useCallback(() => {
    const width = cardsRef.current[0]?.offsetWidth || NOMINAL_WIDTH
    return lerp(REST.step, OPEN.step, spreadRef.current) * width
  }, [])

  /* -- drag ----------------------------------------------------------------
     Direct manipulation: `snap` rather than `set`, so the deck sits under the
     finger with no lag. It is interruption-safe because the gesture is seeded
     from `posDriver.value()` — grabbing a deck that is still spreading, or
     still settling from the last flick, carries on from exactly where it is
     with no jump and no restart. Momentum is the last few milliseconds of
     pointer velocity projected onto the release, which is what makes a flick
     cross several photographs and a slow drag hand over to the neighbour.   */

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const driver = posDriver.current
      if (!driver || event.button !== 0) return
      const card = (event.target as Element | null)?.closest<HTMLElement>("[data-card]")
      dragRef.current = {
        id: event.pointerId,
        originX: event.clientX,
        originPos: driver.value(),
        travelled: 0,
        index: card ? Number(card.dataset.card) : -1,
        lastX: event.clientX,
        lastAt: event.timeStamp,
        velocity: 0,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      // Touch has no hover, so the grab itself is what opens the deck.
      openTo(1)
    },
    [openTo]
  )

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current
      const driver = posDriver.current
      if (!drag || !driver || drag.id !== event.pointerId) return

      const dx = event.clientX - drag.originX
      drag.travelled = Math.max(drag.travelled, Math.abs(dx))

      const step = stepPx()
      let next = drag.originPos - dx / step
      if (next < 0) next *= RESISTANCE
      else if (next > last) next = last + (next - last) * RESISTANCE
      driver.snap(next)

      const dt = event.timeStamp - drag.lastAt
      if (dt > 0) {
        drag.velocity = -((event.clientX - drag.lastX) / step) / (dt / 1000)
        drag.lastX = event.clientX
        drag.lastAt = event.timeStamp
      }
    },
    [last, stepPx]
  )

  const endDrag = React.useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current
      const driver = posDriver.current
      if (!drag || !driver || drag.id !== event.pointerId) return
      dragRef.current = null

      if (drag.travelled < CLICK_SLOP) {
        // A click, not a drag: bring the card that was pressed to the front.
        settleOn(drag.index >= 0 ? drag.index : driver.value())
      } else {
        settleOn(driver.value() + drag.velocity * FLICK_PROJECTION)
      }
      if (!hoverRef.current) openTo(0)
    },
    [openTo, settleOn]
  )

  /* -- hover, focus, keyboard --------------------------------------------- */

  const onPointerEnter = React.useCallback(() => {
    hoverRef.current = true
    openTo(1)
  }, [openTo])

  const onPointerLeave = React.useCallback(() => {
    hoverRef.current = false
    if (!dragRef.current) openTo(0)
  }, [openTo])

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // Only a keyboard arrival opens the deck. A click focuses it too, and the
      // pointer handlers already have that case.
      if (event.currentTarget.matches(":focus-visible")) openTo(1)
    },
    [openTo]
  )

  const onBlur = React.useCallback(() => {
    if (!hoverRef.current && !dragRef.current) openTo(0)
  }, [openTo])

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const driver = posDriver.current
      if (!driver) return
      const at = Math.round(driver.value())
      let next: number | null = null
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = at + 1
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = at - 1
      else if (event.key === "Home") next = 0
      else if (event.key === "End") next = last
      if (next === null) return
      event.preventDefault()
      openTo(1)
      settleOn(next)
    },
    [last, openTo, settleOn]
  )

  /* -- markup --------------------------------------------------------------

     ONE TREE, TWO LAYOUTS, chosen in CSS. Read every `motion-safe:` as "the
     deck" and every `motion-reduce:` as "the plain row".

       deck   clips its own overflow — a five-card fan is wider than a 390px
              column and must not push the page sideways — and pads 32px
              vertically so the lift and the Raised shadow have room inside
              that clip. `touch-pan-y` leaves the page scrollable under a
              vertical swipe while a horizontal one drags the deck.
       row    an ordinary flex row that scrolls if it overflows, which is what
              the ticket asks reduced motion for. `py-4` is the Raised shadow's
              own room, since `overflow-x-auto` clips vertically too.

     THE SPACER is what gives the deck its height. The cards are absolutely
     positioned, so the container would otherwise collapse; an invisible copy of
     a card's box is a height that tracks the card's own CSS with no `calc` and
     no measurement.                                                          */

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="photo deck"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={[
          "relative flex items-center rounded-xl select-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
          "motion-safe:justify-center motion-safe:overflow-hidden motion-safe:py-8",
          "motion-safe:[perspective:1200px] motion-safe:touch-pan-y",
          "motion-safe:cursor-grab motion-safe:active:cursor-grabbing",
          "motion-reduce:gap-4 motion-reduce:overflow-x-auto motion-reduce:px-1 motion-reduce:py-4",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className="invisible w-[min(18rem,60vw)] shrink-0 motion-reduce:hidden"
        >
          <div className="aspect-[4/3]" />
        </div>

        {photos.map((photo, i) => {
          // The resting fan, rendered on the server. The runtime paint writes
          // the same three variables, so hydration changes nothing on screen.
          const at = frame(i - home, 0)
          return (
            <figure
              key={photo.src}
              data-card={i}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              style={
                {
                  "--cf-t": at.transform,
                  "--cf-o": at.opacity,
                  "--cf-z": at.zIndex,
                } as React.CSSProperties
              }
              className={[
                "w-[min(18rem,60vw)] shrink-0 rounded-xl bg-card p-1.5",
                // Raised carries its own 1px ring as a fifth shadow layer, so
                // this is the card's edge as well as its elevation.
                "shadow-raised",
                "motion-safe:absolute motion-safe:top-1/2 motion-safe:left-1/2",
                "motion-safe:[transform:var(--cf-t)] motion-safe:[opacity:var(--cf-o)]",
                "motion-safe:[z-index:var(--cf-z)] motion-safe:will-change-transform",
              ].join(" ")}
            >
              {/* THE STAND-IN MOVED OFF THE PICTURE, and that is the only
                  structural change POR settle-in made here. `bg-muted` used to
                  sit on the <img> itself, which was correct while a photograph
                  appeared instantly and wrong the moment it fades in: an
                  element at opacity 0 takes its own background with it, so the
                  card would have shown `bg-card` exactly where the stone plate
                  belongs. The muted rectangle is now the box, the picture
                  rises out of it, and the 4:3 ratio and the concentric radius
                  came across with it —
                  concentric: 21px card, 6px of card left showing as a print
                  margin, 21 − 6 = 15 = `rounded-lg` on the image. */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                <SettleImage
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  draggable={false}
                  // Hand-written SVG placeholders. Next's optimiser refuses SVG
                  // unless `dangerouslyAllowSVG` is set globally, and that is
                  // not a switch a placeholder gets to throw; the flag comes
                  // off with the first real photograph.
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 60vw, 288px"
                />
              </div>
              {/* The caption belongs to its own figure, in both layouts. In the
                  deck it is only read aloud — what is SEEN is the stacked slot
                  below, which is decoration and says so. */}
              <figcaption className="text-xs text-muted-foreground sr-only motion-reduce:not-sr-only motion-reduce:pt-3">
                {photo.caption}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {/* The deck's caption line: every caption stacked in one slot, faded by
          distance from centre in the same paint as the cards. No React state,
          so scrubbing the deck cannot cost a render. `h-4` is the Caption
          step's own line box, so the letter's rhythm holds whatever the text. */}
      <div aria-hidden="true" className="relative h-4 motion-reduce:hidden">
        {photos.map((photo, i) => (
          <span
            key={photo.src}
            ref={(el) => {
              capsRef.current[i] = el
            }}
            style={{ opacity: frame(i - home, 0).caption }}
            className="absolute inset-x-0 block truncate text-center text-xs text-muted-foreground"
          >
            {photo.caption}
          </span>
        ))}
      </div>
    </div>
  )
}
