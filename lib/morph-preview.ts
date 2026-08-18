"use client"

import * as React from "react"

import { createMorph, type Morph, type MorphRect } from "./morph"
import {
  createSpring,
  D_BASE,
  D_FAST,
  POP_CHANNEL,
  SPRING_POP,
  type SpringDriver,
} from "./motion"

/* ============================================================================
   THE HOVER-PREVIEW ENGINE — shared by every member of the popover family.

   Ported from `docs/design/popover-lab.html`, which is the ratified behaviour
   law for this family (Demo 2 "Social previews — the Colin morph" and Demo 3
   "Ledgy — the external-site preview"), which in turn decoded the mechanic
   from Colin Lienard's Contacts.svelte. `docs/design/collection-lab.html`
   lifted the same block unchanged for the collection rows.

   THIS FILE EXISTS BECAUSE THERE WERE ABOUT TO BE THREE COPIES OF IT. The
   collection preview shipped first and had the whole thing inline; the social
   cluster and the Ledgy card need the identical controller with a different
   placement rule. What is genuinely per-surface — how wide the card is, where
   it sits relative to its trigger, what is drawn inside — stays at the call
   site. What is the family's law lives here, once.

   ── THE CONSTANTS ─────────────────────────────────────────────────────────
   Every number below is one of the lab's own; none was re-derived.

     INTENT   150   Hover intent. Nothing opens before the pointer has been on
                    an anchor for 150ms, so crossing a row of icons never
                    flashes cards. Lab line 1583 (`setTimeout(show, 150)`).
     GRACE    140   Leave grace, and the width of the corridor the pointer
                    walks through to reach the card. The family's band is
                    140–300ms (footer map, "Hover intent 150ms, leave grace
                    140–300ms"); the previews sit at the bottom of it. Lab
                    line 1588 (`setTimeout(hide, 140)`).
     GAP        8   Anchor → card. Also that corridor. Lab `anchorRect`.
     EDGE       8   Minimum clearance from the placement bounds. Lab
                    `maxX = sr.width - c.w - 8`, `if (x < 8) x = 8`.
     MORPH_MS 200   `--duration-base`. Anchor → adjacent anchor tweens the ONE
                    container's rect. Lab `morph.move(anchorRect(i), D_BASE)`,
                    where `D_BASE = 200` (lab line 947).
     RADIUS    15   `--radius-lg`. The family's ruling: "Radius by size: 15 for
                    cards and previews, 21 for panels."

   The SURFACE's entrance (scale .98 → 1 + fade + 4px rise) is no longer on a
   CSS glide: Ion moved it onto the rAF spring shelf on 2026-08-18. It is
   driven from this file — see `attachInner` and SPRING_POP (lib/motion.ts).
   The recipe stays in CSS, derived from the `--pop-p` channel; see the
   `.hover-pop-inner` block in app/globals.css.

   ── THE TWO RULES THAT ARE EASY TO BREAK ──────────────────────────────────
   1. ONE CONTAINER PER ANCHOR GROUP. Moving between siblings morphs it; it
      never closes and reopens. That is why `enter()` skips the intent delay
      when something is already open — re-serving it there is exactly what
      would turn a morph back into a close-and-reopen.
   2. THE ENTRANCE DOES THE GROWING, NOT THE BOX. The first open SNAPS the
      container to its final rect and lets the surface's entrance grow it. Only
      a sibling move tweens the rect. Animating both at once reads as a shove.
   ========================================================================= */

/** ms. Hover intent before a first open.
 *
 *  Spelled as the ladder's fast rung and not as a bare `150` because the site
 *  should contain exactly one 150. The two facts behind it are separate and
 *  both are recorded above: the LAB says 150 (line 1583), and `--duration-fast`
 *  is also 150. They agree today. If the ratified ladder ever moves, this pins
 *  back to a literal 150 — the lab is the law here, not the token. */
export const INTENT = D_FAST
/** ms. Leave grace, and the pointer corridor into the card.
 *
 *  NOT on the ladder, and it is the one number in this file that is not: 140
 *  is the bottom of the family's 140–300ms band (lab line 1588), and there is
 *  no token equal to it. It stays a literal with its provenance attached
 *  rather than being rounded onto a rung it does not belong to. */
export const GRACE = 140
/** px. Anchor → card, and the corridor's width. */
export const GAP = 8
/** px. Minimum clearance from the placement bounds. */
export const EDGE = 8
/** ms. `--duration-base`. Anchor → adjacent anchor. */
export const MORPH_MS = D_BASE
/** px. `--radius-lg`. */
export const PREVIEW_RADIUS = 15

/**
 * Where previews exist at all.
 *
 * DESKTOP ONLY, by ruling: hover previews are supplementary and there is no
 * hover to intend with on a touch device. The `min-width` clause is the
 * spec's "below lg gets no popovers" written literally — the hover clause
 * alone still fires on a narrow desktop window, where a 264-wide card next to
 * a 263-wide rail has nowhere to go.
 */
export const DESKTOP_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 1024px)"

/**
 * Is this a pointer device wide enough for previews, and does its owner want
 * motion?
 *
 * `enabled` is state because it decides whether the container is rendered at
 * all. `reduced` is a ref because it is only ever read inside an event handler
 * — re-rendering the whole surface because the OS motion preference changed
 * would be work for nothing.
 */
export function usePreviewMedia(query: string = DESKTOP_QUERY) {
  const [enabled, setEnabled] = React.useState(false)
  const reducedRef = React.useRef(false)

  React.useEffect(() => {
    const desktop = window.matchMedia(query)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      setEnabled(desktop.matches)
      reducedRef.current = reduced.matches
    }
    sync()
    desktop.addEventListener("change", sync)
    reduced.addEventListener("change", sync)
    return () => {
      desktop.removeEventListener("change", sync)
      reduced.removeEventListener("change", sync)
    }
  }, [query])

  return { enabled, reducedRef }
}

/** The region a card must stay inside, in viewport coordinates. */
export type PreviewBounds = {
  top: number
  bottom: number
  left: number
  right: number
}

export type PreviewPlaceInput = {
  /** The trigger's viewport rect. */
  anchor: DOMRect
  w: number
  h: number
  /**
   * Which side to try first.
   *
   * The lab rules this per surface, and both rulings are about what the card
   * would land ON rather than about geometry:
   *   · social icons prefer BELOW — "the row sits high in this hero, and a
   *     card above it lands on the identity chip, which reads as a
   *     replacement rather than a preview" (lab `anchorRect`).
   *   · the Ledgy link prefers ABOVE — the site preview belongs over the
   *     sentence that named the site (lab `targetRect`).
   */
  prefer: "above" | "below"
  /**
   * Where the card may sit. Vertical and horizontal are separate questions
   * and callers routinely answer them from different boxes: the landing
   * clamps X to the viewport (a 264 card is wider than the 263 rail and is
   * meant to overhang it) but clamps Y to the rail, which is what keeps a
   * preview off the identity chip. That is the lab's stage-relative fit test,
   * written in viewport space.
   */
  bounds: PreviewBounds
  /**
   * Horizontal anchoring. `center` is the lab's social/Ledgy rule; `inset`
   * is the collection list's, where a centred card would cover the rows
   * underneath and a covered row cannot be hovered.
   */
  align: { kind: "center" } | { kind: "inset"; inset: number }
  /**
   * The container's own coordinate origin, in viewport coords. A container
   * positioned against a stage passes the stage's top-left; a `data-fixed`
   * one passes nothing. Subtracted BEFORE rounding, so the returned rect is
   * whole pixels in the space the container actually paints in.
   */
  origin?: { x: number; y: number }
  gap?: number
  edge?: number
}

export type Placement = MorphRect & {
  /** Which side it landed on. The caller needs it for `transform-origin`:
   *  a card that flipped above must shrink downward on close. */
  below: boolean
}

/**
 * Solve one card's rect. Viewport coordinates; a caller positioning against a
 * stage subtracts the stage's own origin.
 */
export function placePreview({
  anchor,
  w,
  h,
  prefer,
  bounds,
  align,
  origin,
  gap = GAP,
  edge = EDGE,
}: PreviewPlaceInput): Placement {
  const ox = origin?.x ?? 0
  const oy = origin?.y ?? 0

  const wanted =
    align.kind === "center"
      ? anchor.left + anchor.width / 2 - w / 2
      : anchor.left + align.inset

  const minX = bounds.left + edge
  const maxX = bounds.right - edge - w
  // `Math.max(maxX, minX)` and not a bare clamp: when the bounds are narrower
  // than the card, maxX is to the LEFT of minX and a naive clamp would pin the
  // card to its right edge, off the left of the region.
  const x = Math.round(Math.min(Math.max(wanted, minX), Math.max(maxX, minX)) - ox)

  const fitsBelow = anchor.bottom + gap + h + edge <= bounds.bottom
  const fitsAbove = anchor.top - gap - h - edge >= bounds.top
  // Fall back to the other side only when the preferred one does not fit AND
  // the fallback does. Otherwise keep the preference: a card that fits nowhere
  // should overhang the side it was designed for, not the other one.
  const below =
    prefer === "below" ? fitsBelow || !fitsAbove : !(fitsAbove || !fitsBelow)

  const y = Math.round(
    (below ? anchor.bottom + gap : anchor.top - gap - h) - oy
  )

  return { x, y, w, h, r: PREVIEW_RADIUS, below }
}

/* ============================================================================
   THE CORRIDOR, ON ITS OWN.

   Factored out on 2026-08-18 when Ion ruled that HOVER OPENS THE ⌘K PALETTE.
   The palette is not a preview — it owns no card, no placement and no morph of
   this file's kind — but it is now the biggest member of this family by the
   only measure that matters to a reader: it answers a hovering pointer on the
   same clock as the social cards and the collection rows. Two surfaces with
   150/140 and a third with its own numbers would be three surfaces that feel
   like three products.

   So the TIMERS moved out of `useMorphPreview` and became this hook, and
   `useMorphPreview` is now its first consumer. Nothing about the preview
   behaviour changed: the four operations below are the four that were inline,
   with the same clear-before-set discipline, in the same order.

     serve(run, immediate)  pointer reached an anchor. Runs `run` after INTENT,
                            or AT ONCE when `immediate` — which is the family's
                            rule that an already-open surface morphs rather
                            than closing and reopening.
     release(run)           pointer left. Runs `run` after GRACE.
     hold()                 drop a pending close. THIS is what makes a surface
                            enterable: the pointer crosses the gap, the surface
                            says "not yet", and the countdown started by
                            leaving the trigger is dropped.
     disarm()               drop a pending open.
     cancel()               drop both.

   The hook owns no state, only refs — nothing here should ever re-render the
   thing it is timing.
   ========================================================================= */

export type HoverCorridor = {
  serve: (run: () => void, immediate?: boolean) => void
  release: (run: () => void) => void
  hold: () => void
  disarm: () => void
  cancel: () => void
}

export function useHoverCorridor({
  intent = INTENT,
  grace = GRACE,
}: { intent?: number; grace?: number } = {}): HoverCorridor {
  const tIn = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const tOut = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const hold = React.useCallback(() => {
    if (tOut.current) clearTimeout(tOut.current)
    tOut.current = null
  }, [])

  const disarm = React.useCallback(() => {
    if (tIn.current) clearTimeout(tIn.current)
    tIn.current = null
  }, [])

  const cancel = React.useCallback(() => {
    disarm()
    hold()
  }, [disarm, hold])

  const serve = React.useCallback(
    (run: () => void, immediate = false) => {
      hold()
      if (immediate) {
        run()
        return
      }
      disarm()
      tIn.current = setTimeout(run, intent)
    },
    [disarm, hold, intent]
  )

  const release = React.useCallback(
    (run: () => void) => {
      cancel()
      tOut.current = setTimeout(run, grace)
    },
    [cancel, grace]
  )

  React.useEffect(() => cancel, [cancel])

  // MEMOISED, and it matters. `useMorphPreview` puts this object in the
  // dependency list of `show`, `hide`, `enter` and `leave`, and `hide` is in
  // the deps of the effect that owns the scroll, resize and Escape listeners.
  // A fresh object per render would tear those three listeners down and
  // rebuild them on every render of every surface in the family.
  return React.useMemo(
    () => ({ serve, release, hold, disarm, cancel }),
    [serve, release, hold, disarm, cancel]
  )
}

export type MorphPreviewOptions<K extends string> = {
  /** False disables every handler and skips all listeners. */
  enabled: boolean
  /** Solve `key`'s rect in the container's own coordinate space. */
  place: (key: K) => Placement | null
  /** Read once per open, per the family's reduced-motion mode. */
  reducedRef: React.RefObject<boolean>
  intent?: number
  grace?: number
}

export type MorphPreview<K extends string> = {
  /**
   * Attach to the node that carries `.hover-pop` — the one container.
   *
   * CALLBACK REFS, not ref objects, and not for style: `ref={api.someRef}`
   * reads a ref through a property during render, which is exactly what
   * `react-hooks/refs` forbids (it cannot tell that from reading `.current`).
   * The same rule is why `usePreviewAnchor` calls its row ref `attach`.
   */
  attachPop: (el: HTMLDivElement | null) => void
  /** Attach to the surface inside it, which owns the entrance and its origin. */
  attachInner: (el: HTMLDivElement | null) => void
  /** The anchor the open card belongs to; null when closed. */
  active: K | null
  /** The face on screen. Survives a close, so the card fades out still
   *  showing what it was, rather than blanking first. */
  shown: K | null
  /** Pointer entered an anchor. Serves intent, or morphs if already open. */
  enter: (key: K) => void
  /** Pointer left an anchor or the card. Starts the grace countdown. */
  leave: () => void
  /** Cancel a pending close. This is what makes the card ENTERABLE: the
   *  pointer crosses the 8px corridor, the card says "not yet", and the
   *  grace countdown started by leaving the anchor is dropped. */
  hold: () => void
  /** Keyboard focus reached an anchor. Opens with no intent delay — a tab
   *  stop is already a statement of intent. */
  focus: (key: K) => void
  /** Close now (Escape, blur, unmount). */
  dismiss: () => void
  /** Re-solve and re-snap the open card. Called for you on scroll/resize. */
  reposition: (force?: boolean) => void
}

/**
 * The controller: one container, one clock, one open card.
 *
 * It owns the morph, the intent/grace corridor, the open/shown split, the
 * scroll and resize correction, and Escape. It owns no geometry and no markup
 * — `place` is the caller's, and so is everything inside the container.
 */
export function useMorphPreview<K extends string>({
  enabled,
  place,
  reducedRef,
  intent = INTENT,
  grace = GRACE,
}: MorphPreviewOptions<K>): MorphPreview<K> {
  const popRef = React.useRef<HTMLDivElement | null>(null)
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  /** Bumped when the container node arrives, so the morph is built against it.
   *  A callback ref fires before layout effects, so one bump is enough. */
  const [popNode, setPopNode] = React.useState<HTMLDivElement | null>(null)

  const attachPop = React.useCallback((el: HTMLDivElement | null) => {
    popRef.current = el
    setPopNode(el)
  }, [])
  /**
   * The surface's entrance/exit spring.
   *
   * BUILT IN THE CALLBACK REF, never in an effect, and the callback is stable
   * — the trap `components/ui/press-spring.tsx` documents at length. React
   * treats a NEW ref function as a new ref: it detaches the old driver and
   * attaches a fresh one at velocity zero. This surface re-renders on every
   * open and every anchor change (`active` and `shown` are state), so a
   * per-render ref here would rebuild the spring at exactly the moments the
   * spring exists to survive, and a fast enter-leave-enter would stop dead
   * instead of turning around.
   */
  const innerSpringRef = React.useRef<SpringDriver | null>(null)

  const attachInner = React.useCallback((el: HTMLDivElement | null) => {
    innerRef.current = el
    innerSpringRef.current?.stop()
    innerSpringRef.current = null
    if (!el) return
    const driver = createSpring(SPRING_POP, (p) => {
      el.style.setProperty(POP_CHANNEL, String(p))
    })
    innerSpringRef.current = driver
    // Snapped closed, never sprung: a card must not animate into existence on
    // mount. It also writes `--pop-p` in the commit before the first paint, so
    // the surface is invisible from frame one rather than relying on the CSS
    // fallback for a frame.
    driver.snap(0)
  }, [])

  React.useEffect(() => () => innerSpringRef.current?.stop(), [])

  const [active, setActive] = React.useState<K | null>(null)
  const [shown, setShown] = React.useState<K | null>(null)

  const morphRef = React.useRef<Morph | null>(null)
  const openRef = React.useRef(false)
  const keyRef = React.useRef<K | null>(null)
  const belowRef = React.useRef(true)
  /** The intent/grace clock. Shared with the ⌘K palette since 2026-08-18 —
   *  see `useHoverCorridor` above. */
  const corridor = useHoverCorridor({ intent, grace })

  React.useLayoutEffect(() => {
    if (!enabled || !popNode) return
    const morph = createMorph(popNode)
    morphRef.current = morph
    return () => {
      morph.cancel()
      morphRef.current = null
    }
  }, [enabled, popNode])

  /** Which edge the card shrinks toward on close. Set on every open, not only
   *  the first: a card that flipped above must not shrink upward. */
  const setOrigin = React.useCallback((below: boolean) => {
    belowRef.current = below
    if (innerRef.current) {
      innerRef.current.style.transformOrigin = below ? "50% 0%" : "50% 100%"
    }
  }, [])

  const show = React.useCallback(
    (key: K) => {
      corridor.hold()
      const morph = morphRef.current
      const pop = popRef.current
      if (!morph || !pop) return
      if (openRef.current && keyRef.current === key) return

      const target = place(key)
      if (!target) return
      setOrigin(target.below)

      if (!openRef.current) {
        // First open: placed at its FINAL rect. The surface's spring does the
        // growing; the box itself never animates on the way in.
        morph.snap(target)
        openRef.current = true
        pop.setAttribute("data-open", "true")
        // `set`, not `snap` — and it is `set` even when the previous close is
        // still fading, because that is the reversal the spring is here for:
        // the surface turns around from wherever it is, carrying its speed.
        // Under reduced motion it snaps, and the stylesheet's carve-out turns
        // the entrance back into a 150ms opacity crossfade off `data-open`.
        if (reducedRef.current) innerSpringRef.current?.snap(1)
        else innerSpringRef.current?.set(1)
      } else {
        // Sibling anchor: the one container morphs. Reduced motion collapses
        // the travel to zero and leaves the content crossfade to carry it.
        morph.move(target, reducedRef.current ? 0 : MORPH_MS)
      }

      keyRef.current = key
      setShown(key)
      setActive(key)
    },
    [corridor, place, reducedRef, setOrigin]
  )

  const hide = React.useCallback(() => {
    corridor.disarm()
    if (!openRef.current) return
    openRef.current = false
    popRef.current?.setAttribute("data-open", "false")
    if (reducedRef.current) innerSpringRef.current?.snap(0)
    else innerSpringRef.current?.set(0)
    setActive(null)
    // `shown` is deliberately kept — see its doc comment.
  }, [corridor, reducedRef])

  const reposition = React.useCallback(
    (force = false) => {
      if (!openRef.current || !keyRef.current) return
      const target = place(keyRef.current)
      if (!target) return
      const cur = morphRef.current?.rect()
      const moved =
        !cur ||
        cur.x !== target.x ||
        cur.y !== target.y ||
        cur.w !== target.w ||
        cur.h !== target.h
      if (!force && !moved && target.below === belowRef.current) return
      setOrigin(target.below)
      morphRef.current?.snap(target)
    },
    [place, setOrigin]
  )

  /* --- the card stays glued -------------------------------------------------
     Scroll runs on a rAF gate, on the same pattern the wheel and the mobile
     controller use: unthrottled it does three rect reads and a full morph
     paint per scroll EVENT, which on a trackpad is several per frame. The
     `moved` check above then makes the common case cost the reads and nothing
     else — for a container positioned against a stage that scrolls with its
     anchors, that is every frame.

     Resize is unconditional: it moves the anchors, the bounds, and the width
     budget all at once. */
  React.useEffect(() => {
    if (!enabled) return
    let ticking = false
    let raf = 0

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        ticking = false
        raf = 0
        reposition(false)
      })
    }
    const onResize = () => reposition(true)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openRef.current) hide()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("keydown", onKey)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, reposition, hide])

  const enter = React.useCallback(
    // `immediate` when something is already open: an adjacent anchor morphs at
    // once. Re-serving the intent delay here is what would turn the morph into
    // a close-and-reopen.
    (key: K) => corridor.serve(() => show(key), openRef.current),
    [corridor, show]
  )

  const leave = React.useCallback(
    () => corridor.release(hide),
    [corridor, hide]
  )

  const focus = React.useCallback(
    (key: K) => {
      corridor.hold()
      show(key)
    },
    [corridor, show]
  )

  return {
    attachPop,
    attachInner,
    active,
    shown,
    enter,
    leave,
    hold: corridor.hold,
    focus,
    dismiss: hide,
    reposition,
  }
}

/**
 * Measure the mounted faces.
 *
 * Heights are READ, never computed: the copy in every one of these cards is
 * placeholder and will change length, and a card measured from a table of
 * hardcoded heights is a card that goes wrong the first time someone edits a
 * word. The faces are absolutely positioned, so measuring costs no layout of
 * the page.
 *
 * Aeonik is a webfont, so the first measurement is taken again once
 * `fonts.ready` settles — a card measured before the font loads is a card
 * measured in the fallback's metrics.
 */
export function useFaceMeasure(enabled: boolean, deps: React.DependencyList) {
  const faces = React.useRef(new Map<string, HTMLElement>())
  const heights = React.useRef(new Map<string, number>())

  const measure = React.useCallback(() => {
    faces.current.forEach((el, key) => {
      const h = el.offsetHeight
      if (h > 0) heights.current.set(key, h)
    })
  }, [])

  const registerFace = React.useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) faces.current.set(key, el)
      else faces.current.delete(key)
    },
    []
  )

  React.useLayoutEffect(() => {
    if (!enabled) return
    measure()
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    void fonts?.ready.then(measure)
    const onResize = () => measure()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, measure, ...deps])

  return { registerFace, heights, measure }
}

export type { MorphRect }
