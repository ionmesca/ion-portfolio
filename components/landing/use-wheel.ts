"use client"

import * as React from "react"

import { D_FAST } from "@/lib/motion"

/* ============================================================================
   Project wheel — the physics controller.

   SOURCE OF TRUTH: `docs/design/wheel-prototype.html`, variant `calm` with
   `CALM_WINDOW = "lens"` (the file's shipped default). Every number below is
   copied from that file; the line numbers are cited so the port can be
   audited. Nothing here was re-derived or "improved".

   THE INPUT IS THE DOCUMENT SCROLL — the prototype's own model, restored.
   An earlier pass shipped a wheel-event capture over the rail with an
   invented `WHEEL_STRIDE`, because the page rendered only the active
   project's two panels and there was no panel stack to read a position off.
   The right column now stacks every project's panels (media-column.tsx), so
   the prototype's mapping has its input back and the invention is deleted:

     - no `wheel` listener, no `preventDefault`, no scroll hijacking. The page
       scrolls normally everywhere.
     - `f` (the continuous position of the list, 0..count-1) is read off
       `window.scrollY`: each project's FIRST media panel has a document Y,
       and `f` advances by one smooth step as that Y crosses a reference line
       at 40% of the viewport height (prototype lines 656-679).
     - a row click / arrow key scrolls the document to that project's panels
       (prototype lines 817-823), which drives the very same signal. There is
       no separate "selection" channel to arbitrate with.

   ONE DELIBERATE DEVIATION, both small and load-bearing:

     boundaries are measured by walking `offsetTop` rather than by
     `getBoundingClientRect().top + scrollY` (prototype line 665). The two
     agree exactly in a static layout, but the first-load intro choreography
     puts a short-lived `translateY` on the media column, and rect-based
     measurement would bake that 4px into every boundary. `offsetTop` is
     layout-based and cannot see transforms.
   ========================================================================= */

/* -- ported verbatim -------------------------------------------------------
   name          value   prototype source
   lerp          0.12    line 525  SCROLL.lerp
   refLine       0.40    line 526  SCROLL.refLine
   handoff       400     line 527  SCROLL.handoff
   jumpOffset    136     line 528  SCROLL.jumpOffset
   settle eps    0.0004  line 798  frame(): Math.abs(diff) > 0.0004
   frame unit    16.667  line 796  dt / 16.667
   spread        6       line 545  VARIANTS.calm.spread
   spreadEnd     2.5     line 546  VARIANTS.calm.spreadEnd
   lensScaleEnd  0.95    line 547
   lensScaleRef  2       line 548
   opacityMin    0.47    line 28   CALM_WINDOWS.lens.opacityMin
   opacityEnd    4.0     line 28   CALM_WINDOWS.lens.opacityEnd
   opacityPow    2.2     line 28   CALM_WINDOWS.lens.opacityPow
   cullAt        99      line 28   CALM_WINDOWS.lens.cullAt
   CULL_FADE     0.35    line 534
   YEAR_DRIFT    4       line 535
   blurStart     1.6     line 559
   blurEnd       2.2     line 559
   blurMax       0.4     line 559
   fillOut       0.35    line 560
   -------------------------------------------------------------------- */

const LERP = 0.12
const SETTLE_EPS = 0.0004
const FRAME_MS = 16.667

/** prototype lines 524-529 — the scroll mapping, shared by every variant. */
const SCROLL = {
  /** reference line, as a fraction of viewport height */
  refLine: 0.4,
  /** px window, ending at a project boundary, over which f advances by 1 */
  handoff: 400,
  /** px from viewport top where a panel lands on click-to-jump */
  jumpOffset: 136,
} as const

const CULL_FADE = 0.35
const YEAR_DRIFT = 4

const LENS = {
  spread: 6,
  spreadEnd: 2.5,
  scaleEnd: 0.95,
  scaleRef: 2,
  opacityMin: 0.47,
  opacityEnd: 4.0,
  opacityPow: 2.2,
  cullAt: 99,
  blurStart: 1.6,
  blurEnd: 2.2,
  blurMax: 0.4,
  fillOut: 0.35,
} as const

/** Below this the lens is snapped to 0 and the rows are returned to rest. */
const LENS_EPS = 0.002

/* ms the lens takes to let go once the list has settled. NOT a prototype
   number — the prototype's lens is permanent, and gating it on motion is our
   ruled judgment (see `write`). Given that gate, the release needs its own
   clock: sharing the position lerp meant the lens only STARTED fading after
   `f` had crawled inside 0.0004 of its target, so the rows sat in a motion
   treatment for ~2s after the page stopped. `--duration-fast` (globals.css
   line 102) is the motion system's own number for an opacity settle, and
   `D_FAST` (lib/motion.ts) is its JS mirror — a custom property cannot be read
   synchronously inside a rAF tick, which is where this number is spent. */
const LENS_FADE_MS = D_FAST

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

/** prototype line 592 */
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Document Y of an element's top, immune to transforms. See the header. */
const documentTop = (el: HTMLElement) => {
  let y = 0
  let node: HTMLElement | null = el
  while (node) {
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return y
}

/** The three elements the controller writes to, per row. */
export type WheelRow = {
  row: HTMLElement | null
  fill: HTMLElement | null
  year: HTMLElement | null
}

/** Last value written per element, so a frame only touches what changed
    (prototype lines 628-629, 757-768). `null` means "no inline style". */
type RowCache = {
  t: string | null
  o: string | null
  b: string | null
  f: string | null
  z: string | null
  p: string | null
  y: string | null
  yx: string | null
  wc: string | null
}

const freshCache = (): RowCache => ({
  t: " ",
  o: " ",
  b: " ",
  f: " ",
  z: " ",
  p: " ",
  y: " ",
  yx: " ",
  wc: " ",
})

type Options = {
  count: number
  activeIndex: number
  setActiveIndex: (index: number) => void
  /** One entry per project: the FIRST media panel of that project. */
  anchorsRef: React.RefObject<(HTMLElement | null)[]>
  /** One entry per project, in list order. */
  rowsRef: React.RefObject<(WheelRow | null)[]>
}

export function useProjectWheel({
  count,
  activeIndex,
  setActiveIndex,
  anchorsRef,
  rowsRef,
}: Options) {
  /* Latest-value refs. The physics loop is one long-lived closure, so it reads
     the current count and setter through refs rather than being torn down and
     rebuilt whenever the component re-renders. */
  const countRef = React.useRef(count)
  const setActiveIndexRef = React.useRef(setActiveIndex)

  React.useInsertionEffect(() => {
    countRef.current = count
    setActiveIndexRef.current = setActiveIndex
  })

  const state = React.useRef({
    /** rendered position, 0..count-1 (the prototype's `fRender`). */
    f: 0,
    /** 0 = rows at rest, 1 = full lens. */
    lens: 0,
    lastTime: 0,
    published: 0,
    raf: 0,
    caches: [] as RowCache[],
    reduce: false,
  })

  /* Filled in by the effect below; the callbacks returned from this hook reach
     back through them so the controller's loop can live in one closure. */
  const startRef = React.useRef<() => void>(() => {})
  const jumpRef = React.useRef<(index: number) => void>(() => {})

  /* DESKTOP ONLY. Below `lg` the whole rail and the panel stack are
     `display: none` and the mobile landing is the page. A hidden column
     measures as a stack of zeroes, which would put the selection on the last
     project and then hand every mobile scroll event a rAF frame to write
     styles nobody can see. 1024px is Tailwind's `lg` — the same number the
     layout split and the palette's own gate use. Starting `false` keeps the
     server render and the first client render identical. */
  const [desktop, setDesktop] = React.useState(false)

  React.useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia("(min-width: 1024px)")
    } catch {
      return
    }
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  React.useEffect(() => {
    if (!desktop) return

    const s = state.current
    const rows = rowsRef.current

    /* ---------------------------------------------------------- reduced motion */

    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    s.reduce = query.matches
    const onQuery = () => {
      s.reduce = query.matches
      start()
    }
    query.addEventListener("change", onQuery)

    /* ------------------------------------------------- scroll -> target f map */

    /* boundaries[k] = document Y of the top of project k's first panel
       (prototype lines 658-666). */
    let boundaries: number[] = []
    let viewportH = window.innerHeight

    const measure = () => {
      viewportH = window.innerHeight
      boundaries = (anchorsRef.current ?? []).map((el) =>
        el ? documentTop(el) : 0
      )
    }

    /* Prototype lines 668-679, verbatim. f in [0, count-1]. Each project
       boundary contributes one smooth 0->1 step, completing exactly as that
       project's first panel top crosses the reference line at 40% viewport
       height. */
    const targetFrom = (scrollY: number) => {
      const ref = scrollY + SCROLL.refLine * viewportH
      let f = 0
      for (let k = 1; k < boundaries.length; k++) {
        const b = boundaries[k]
        f += smoothstep(b - SCROLL.handoff, b, ref)
      }
      return f
    }

    /* ------------------------------------------------------------------ write */

    const setStyle = (
      el: HTMLElement | null,
      prop: "transform" | "opacity" | "filter" | "zIndex" | "pointerEvents" | "willChange",
      value: string | null
    ) => {
      if (!el) return
      el.style[prop] = value ?? ""
    }

    /* Port of the prototype's `write` (lines 727-780), with one change that is
       a RULED JUDGMENT, not a re-derivation: the lens is multiplied by `lens`,
       which is 0 whenever the list is settled. The Figma frame's static row
       states are the rest truth (no opacity ramp, no push, no scale, no blur);
       the prototype's lens is a MOTION treatment only. At lens = 0 every
       inline style is cleared and the rows fall back to their classes, so a
       settled wheel is pixel-identical to the static landing page. */
    const write = (f: number, lens: number) => {
      const active = Math.round(f)
      const lit = lens > 0

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        if (!r) continue
        const cache = s.caches[i] ?? (s.caches[i] = freshCache())

        const o = i - f
        const ao = o < 0 ? -o : o
        const sign = o < 0 ? -1 : 1

        /* transform — prototype lines 689-698. The push peaks at |o| = 1 and
           is back to zero by |o| = spreadEnd; the scale is a gentle falloff.
           No rotation, so glyphs never shear. */
        let t: string | null = null
        if (lit) {
          const bump =
            ao <= 1 ? smoothstep(0, 1, ao) : 1 - smoothstep(1, LENS.spreadEnd, ao)
          const d = sign * LENS.spread * bump * lens
          const base = 1 - (1 - LENS.scaleEnd) * smoothstep(0, LENS.scaleRef, ao)
          const scale = 1 - (1 - base) * lens
          t = `translateY(${d.toFixed(2)}px) scale(${scale.toFixed(4)})`
        }

        /* opacity — prototype lines 737-741 */
        let opacity: string | null = null
        let pe: string | null = null
        if (lit) {
          const cull = 1 - smoothstep(LENS.cullAt - CULL_FADE, LENS.cullAt, ao)
          const falloff = Math.pow(
            1 - clamp(ao / LENS.opacityEnd, 0, 1),
            LENS.opacityPow
          )
          const base = (LENS.opacityMin + (1 - LENS.opacityMin) * falloff) * cull
          const value = +(1 - (1 - base) * lens).toFixed(3)
          opacity = String(value)
          pe = value < 0.02 ? "none" : "auto"
        }

        /* blur — prototype lines 743-745. Garnish while moving only, which is
           also motion-system-spec principle 4 (blur is never a resting style). */
        let filter: string | null = null
        if (lit) {
          const blur = +(
            LENS.blurMax *
            clamp((ao - LENS.blurStart) / (LENS.blurEnd - LENS.blurStart), 0, 1) *
            lens
          ).toFixed(2)
          filter = blur > 0.01 ? `blur(${blur}px)` : "none"
        }

        /* stacking — prototype line 748 */
        const z = lit ? String(10 - Math.round(clamp(ao, 0, 4) * 2)) : null

        /* fill + year ride the same signal, so the date arrives with the
           settle instead of popping — prototype lines 747, 754-755. This one
           is NOT gated on the lens: at rest it already collapses to exactly
           the Figma states (active = muted fill + year, everything else
           bare). */
        const fillAmt = +(1 - smoothstep(0, LENS.fillOut, ao)).toFixed(3)
        const fill = String(fillAmt)
        const yx = lit
          ? `translateX(${(sign * YEAR_DRIFT * (1 - fillAmt)).toFixed(2)}px)`
          : null

        if (cache.t !== t) {
          setStyle(r.row, "transform", t)
          cache.t = t
        }
        if (cache.o !== opacity) {
          setStyle(r.row, "opacity", opacity)
          cache.o = opacity
        }
        if (cache.b !== filter) {
          setStyle(r.row, "filter", filter)
          cache.b = filter
        }
        if (cache.z !== z) {
          setStyle(r.row, "zIndex", z)
          cache.z = z
        }
        if (cache.p !== pe) {
          setStyle(r.row, "pointerEvents", pe)
          cache.p = pe
        }
        /* At rest the fill and the year hand back to their classes, which
           carry the same values — so nothing moves at the handover. */
        const held = lit ? fill : null
        if (cache.f !== held) {
          setStyle(r.fill, "opacity", held)
          cache.f = held
        }
        if (cache.y !== held) {
          setStyle(r.year, "opacity", held)
          cache.y = held
        }
        if (cache.yx !== yx) {
          setStyle(r.year, "transform", yx)
          cache.yx = yx
        }

        /* will-change is applied for the duration of the motion only. Left on
           permanently it promotes every row to its own compositing layer,
           which changes text antialiasing at rest. It rides the cache like
           every other property here: written blind it re-set the hint on all
           five rows on every frame of every turn, and re-setting a
           compositor hint is the one write the compositor takes literally. */
        const wc = lit ? "transform, opacity" : null
        if (cache.wc !== wc) {
          setStyle(r.row, "willChange", wc)
          cache.wc = wc
        }
      }

      return active
    }

    /* ------------------------------------------------------------------ frame */

    /* Port of the prototype's `frame` (lines 782-813). The lerp is converted
       to be framerate-independent exactly as the prototype does it. One scroll
       read per frame, before any style write. */
    const frame = (now: number) => {
      s.raf = 0

      const dt = s.lastTime ? clamp(now - s.lastTime, 1, 50) : FRAME_MS
      s.lastTime = now

      const target = targetFrom(window.scrollY)
      let moving: boolean

      if (s.reduce) {
        s.f = target
        s.lens = 0
        moving = false
      } else {
        const alpha = 1 - Math.pow(1 - LERP, dt / FRAME_MS)
        const diff = target - s.f
        moving = Math.abs(diff) > SETTLE_EPS
        if (moving) s.f += diff * alpha
        else s.f = target

        /* The lens rides up on the same lerp as the position — it belongs to
           the motion — and lets go on its own 150ms clock. */
        if (moving) {
          s.lens += (1 - s.lens) * alpha
          if (s.lens > 1 - LENS_EPS) s.lens = 1
        } else {
          s.lens -= dt / LENS_FADE_MS
          if (s.lens < LENS_EPS) s.lens = 0
        }
      }

      const active = write(s.f, s.lens)
      if (active !== s.published) {
        s.published = active
        setActiveIndexRef.current(active)
      }

      if (moving || s.lens !== 0) {
        s.raf = requestAnimationFrame(frame)
      } else {
        /* Settled. The loop stops rather than idling forever (the prototype
           keeps a permanent rAF; on a landing page that is battery for
           nothing). The next scroll or resize restarts it. */
        s.lastTime = 0
      }
    }

    const start = () => {
      if (s.raf) return
      s.lastTime = 0
      s.raf = requestAnimationFrame(frame)
    }

    startRef.current = start

    /* ------------------------------------------------------- click to jump */

    /* Prototype lines 817-823. The click does not "select" anything: it moves
       the document, and the wheel reads the document. */
    jumpRef.current = (index: number) => {
      const k = clamp(Math.round(index), 0, boundaries.length - 1)
      const top = Math.max(0, boundaries[k] - SCROLL.jumpOffset)
      window.scrollTo({ top, behavior: s.reduce ? "auto" : "smooth" })
      start()
    }

    /* ------------------------------------------------------------------ input */

    const onScroll = () => start()
    const onResize = () => {
      measure()
      start()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)

    /* ------------------------------------------------------------------- boot */

    /* Prototype lines 899-910. A reload can restore a scroll position, so the
       first paint has to answer the scroll it actually starts at. */
    measure()
    s.f = targetFrom(window.scrollY)
    s.lens = 0
    s.published = Math.round(s.f)
    write(s.f, 0)
    if (s.published !== 0) setActiveIndexRef.current(s.published)

    let cancelled = false
    document.fonts?.ready.then(() => {
      if (cancelled) return
      measure()
      start()
    })

    return () => {
      cancelled = true
      query.removeEventListener("change", onQuery)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      if (s.raf) cancelAnimationFrame(s.raf)
      s.raf = 0
    }
  }, [anchorsRef, rowsRef, desktop])

  /**
   * Move the selection — a row click, or an arrow key. It scrolls the document
   * to that project's panels, which is the prototype's click-to-jump: the
   * click drives the same signal the scroll does, so there is one channel and
   * nothing to arbitrate.
   */
  const goTo = React.useCallback((index: number) => {
    jumpRef.current(index)
  }, [])

  /* Anything else that moves the selection (the command palette) is followed
     rather than fought: it becomes a jump, and the wheel reads it back off the
     document like every other move. */
  React.useEffect(() => {
    if (activeIndex !== state.current.published) jumpRef.current(activeIndex)
  }, [activeIndex])

  return { goTo }
}
