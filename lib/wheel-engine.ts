/* ============================================================================
   The scroll-wheel engine — one set of physics for every wheel on the site.

   COPIED, NOT MOVED. Every constant and every line of the loop below is a
   transcription of `components/landing/use-wheel.ts`, which is itself a port of
   `docs/design/wheel-prototype.html` (variant `calm`, window `lens`). The
   landing wheel still runs its own copy and is untouched by this file; this
   exists so the SECTION rail can have the landing's feel today, and so
   use-wheel.ts CAN adopt it later without a single number changing.

   Ion's ruling, 2026-08-18: "why are these wheels not acting the same as the
   one on the home page?" — the section wheel is now continuously scroll-driven
   off the same fractional position, with the same lerp and the same lens,
   instead of swapping a discrete active row.

   ── Copied verbatim from use-wheel.ts ──────────────────────────────────────
   LERP 0.12 · SETTLE_EPS 0.0004 · FRAME_MS 16.667 · refLine 0.40 ·
   handoff 400 · jumpOffset 136 · LENS_EPS 0.002 · LENS_FADE_MS 150 · the lens
   ladder (opacityMin 0.47, opacityEnd 4.0, opacityPow 2.2, spread 6,
   spreadEnd 2.5, scaleEnd 0.95, scaleRef 2, blurStart 1.6, blurEnd 2.2,
   blurMax 0.4, fillOut 0.35) · clamp() · smoothstep() · documentTop() · the
   framerate-independent lerp · the lens's own 150ms release clock · the
   settle-and-stop rAF · the boot sequence (measure, f = target, paint at
   lens 0, re-measure on fonts.ready).

   ── What is NEW here, and why ──────────────────────────────────────────────
   The landing's anchors are a pair of 16:10 panels apart. A letter's sections
   and a collection's groups are not, so three options exist that the landing
   does not need. All three default to the landing's behaviour, so adopting this
   engine there would change nothing.

     handoffShare  the 400px glide window is capped at a share of the distance
                   to the PREVIOUS anchor, so a 200px section is not handed a
                   400px window that opens before the section itself does. At
                   the landing's spacing the cap never binds.
     (top clamp)   no step may begin above the reference line's own resting
                   position. The window ENDS at the boundary, so it opens 400px
                   of scroll early — and a page whose first section is shorter
                   than 40% of the viewport is already inside that window at
                   scroll 0, which would open the page with the SECOND row lit.
                   Figma "Letter — light" 13:2941 lights the first. Clamping the
                   window's start to the line's rest position fixes that without
                   touching the completion point, and the 0.12 lerp still glides
                   the render across whatever the target does. On the landing
                   every window opens far below the line, so this never fires.
     endPull       a short LAST section can never cross the 40% line, so its
                   row would be unreachable. Within `endPull` px of the
                   document bottom the target is pulled smoothly to the last
                   index. The landing's column ends in a 55vh spacer and needs
                   none of it; the default 0 disables it.
     override      a click is a statement about where the reader is, and it
                   outranks the line until they move the page themselves
                   (collection-lab rulebook: "A wheel click outranks the
                   line"). The engine still LERPS to it, so a click glides like
                   a scroll rather than slamming. The landing needs no such
                   channel — its rows are one panel-pair apart, so the line
                   agrees with the click by construction.
   ========================================================================= */

/** use-wheel.ts lines 64-76 — the position physics and the scroll mapping. */
export const WHEEL = {
  /** per-frame approach rate, converted to be framerate-independent */
  lerp: 0.12,
  /** below this the position is snapped and the loop is allowed to stop */
  settleEps: 0.0004,
  /** one frame at 60Hz; the unit the lerp is expressed in */
  frameMs: 16.667,
  /** reference line, as a fraction of viewport height */
  refLine: 0.4,
  /** px window, ending at an anchor, over which the position advances by 1 */
  handoff: 400,
  /** px from the viewport top where an anchor lands on click-to-jump */
  jumpOffset: 136,
} as const

/** use-wheel.ts lines 81-106 — the lens, and its release clock. */
export const LENS = {
  spread: 6,
  spreadEnd: 2.5,
  scaleEnd: 0.95,
  scaleRef: 2,
  opacityMin: 0.47,
  opacityEnd: 4.0,
  opacityPow: 2.2,
  cullAt: 99,
  cullFade: 0.35,
  blurStart: 1.6,
  blurEnd: 2.2,
  blurMax: 0.4,
  fillOut: 0.35,
  /** below this the lens is snapped to 0 and the rows are returned to rest */
  eps: 0.002,
  /** ms the lens takes to let go once the list has settled */
  fadeMs: 150,
} as const

/** The narrowest glide window `handoffShare` may produce. Under this a turn
 *  reads as a cut rather than a movement, which is the very thing the ruling
 *  is against. NEW — see the header. */
const MIN_HANDOFF = 120

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v

/** prototype line 592 */
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Document Y of an element's top, immune to transforms — `offsetTop` is
 *  layout-based, while `getBoundingClientRect()` would bake a first-load
 *  entrance translate into every boundary. use-wheel.ts lines 116-125. */
export const documentTop = (el: HTMLElement) => {
  let y = 0
  let node: HTMLElement | null = el
  while (node) {
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return y
}

/* ---------------------------------------------------------------- lens math */
/* Each helper is one clause of use-wheel.ts's `write` (lines 289-406), pulled
   out so a consumer can take the parts its frame actually draws. The landing
   gates ALL of them on `lens` because its resting rows are flat. The section
   rail does not gate the opacity: the dimmed ladder IS its resting Figma state
   (rows at 1 / .75 / .59 / .47), so there the opacity is permanent and only
   the push, the scale and the blur are motion. */

/** Distance falloff, `d` = |index − position|. At whole distances this is the
 *  frame's own ladder: 1 / .756 / .585 / .495. */
export function lensOpacity(d: number, lens = 1) {
  const cull = 1 - smoothstep(LENS.cullAt - LENS.cullFade, LENS.cullAt, d)
  const falloff = Math.pow(1 - clamp(d / LENS.opacityEnd, 0, 1), LENS.opacityPow)
  const base = (LENS.opacityMin + (1 - LENS.opacityMin) * falloff) * cull
  return +(1 - (1 - base) * lens).toFixed(3)
}

/** The lean-and-shrink. `offset` = index − position, signed. */
export function lensTransform(offset: number, lens: number) {
  const d = Math.abs(offset)
  const sign = offset < 0 ? -1 : 1
  const bump = d <= 1 ? smoothstep(0, 1, d) : 1 - smoothstep(1, LENS.spreadEnd, d)
  const push = sign * LENS.spread * bump * lens
  const base = 1 - (1 - LENS.scaleEnd) * smoothstep(0, LENS.scaleRef, d)
  const scale = 1 - (1 - base) * lens
  return `translateY(${push.toFixed(2)}px) scale(${scale.toFixed(4)})`
}

/** Garnish while moving only — blur is never a resting style
 *  (motion-system-spec principle 4). */
export function lensBlur(d: number, lens: number) {
  const blur = +(
    LENS.blurMax *
    clamp((d - LENS.blurStart) / (LENS.blurEnd - LENS.blurStart), 0, 1) *
    lens
  ).toFixed(2)
  return blur > 0.01 ? `blur(${blur}px)` : "none"
}

/** The active fill, which rides the fraction so the highlight crossfades from
 *  row to row instead of jumping. NOT gated on the lens in either consumer:
 *  at rest it already collapses to the frame (active filled, everything
 *  else bare). */
export function lensFill(d: number) {
  return +(1 - smoothstep(0, LENS.fillOut, d)).toFixed(3)
}

/* ------------------------------------------------------------------ engine */

export type WheelEngineOptions = {
  /** The elements the position is measured against, in row order. Re-read on
   *  every `measure()`, so a page may fill the array after mount. */
  anchors: () => (HTMLElement | null)[]
  /** Paint one frame. `f` is the continuous position (0..count-1), `lens` is
   *  0 at rest and 1 mid-turn, `reduced` mirrors prefers-reduced-motion. */
  render: (f: number, lens: number, reduced: boolean) => void
  /** Called when `Math.round(f)` changes — the published selection. */
  onIndex?: (index: number) => void
  /** See the header. 0.5 keeps the landing bit-identical. */
  handoffShare?: number
  /** See the header. 0 (default) disables the bottom-of-document pull. */
  endPull?: number
  /** See the header. Return an index to hold the wheel there, or null. */
  override?: () => number | null
}

export type WheelEngine = {
  /** Wake the loop. Cheap and idempotent — it returns if a frame is queued. */
  start: () => void
  /** Re-read the anchors' document positions (layout changed). */
  measure: () => void
  /** Document Y of each anchor, as last measured. */
  boundaries: () => number[]
  /** Scroll the document so anchor `index` lands `jumpOffset` from the top. */
  jumpTo: (index: number) => void
  /** Drop every listener and stop the loop. */
  destroy: () => void
}

/**
 * Build a wheel. Browser only — call it inside an effect.
 *
 * The loop reads the document scroll once per frame, lerps the rendered
 * position toward it, and stops itself when both the position and the lens
 * have settled. Nothing is hijacked: no wheel listener, no preventDefault.
 */
export function createWheelEngine(options: WheelEngineOptions): WheelEngine {
  const {
    anchors,
    render,
    onIndex,
    handoffShare = 0.5,
    endPull = 0,
    override,
  } = options

  let boundaries: number[] = []
  /** windows[k] = px over which the step ending at boundaries[k] completes. */
  let windows: number[] = []
  /** The reference line's document Y at scroll 0 — no step may start above it. */
  let restRef = 0
  let viewportH = window.innerHeight

  let f = 0
  let lens = 0
  let lastTime = 0
  let raf = 0
  let published = 0
  let cancelled = false

  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  let reduce = query.matches

  const measure = () => {
    viewportH = window.innerHeight
    restRef = WHEEL.refLine * viewportH
    boundaries = anchors().map((el) => (el ? documentTop(el) : 0))
    windows = boundaries.map((b, k) => {
      if (k === 0) return WHEEL.handoff
      const gap = b - boundaries[k - 1]
      return clamp(
        Math.min(WHEEL.handoff, gap * handoffShare),
        MIN_HANDOFF,
        WHEEL.handoff
      )
    })
  }

  /* use-wheel.ts lines 261-269. Each anchor contributes one smooth 0->1 step,
     completing exactly as that anchor's top crosses the reference line. */
  const targetFrom = (scrollY: number) => {
    const ref = scrollY + WHEEL.refLine * viewportH
    let t = 0
    for (let k = 1; k < boundaries.length; k++) {
      const b = boundaries[k]
      /* The window ends at the boundary and opens `windows[k]` px earlier —
         but never above the line's own rest position, or a page would load
         with its second row already lit. `b - 1` keeps the step a step when
         the clamp swallows the whole window. */
      const lo = Math.min(Math.max(b - windows[k], restRef), b - 1)
      t += smoothstep(lo, b, ref)
    }

    if (endPull > 0 && boundaries.length > 1) {
      const doc = document.documentElement
      /* Guarded on the page actually scrolling: on a viewport tall enough to
         show everything, "you are at the bottom" is true from the first frame
         and the wheel would open on the last row instead of the first. */
      if (doc.scrollHeight > viewportH + 2) {
        const remaining = doc.scrollHeight - (scrollY + viewportH)
        const pull = smoothstep(endPull, 0, remaining)
        t += (boundaries.length - 1 - t) * pull
      }
    }
    return t
  }

  /* use-wheel.ts lines 413-458. */
  const frame = (now: number) => {
    raf = 0

    const dt = lastTime ? clamp(now - lastTime, 1, 50) : WHEEL.frameMs
    lastTime = now

    const held = override?.()
    const target = held ?? targetFrom(window.scrollY)
    let moving: boolean

    if (reduce) {
      f = target
      lens = 0
      moving = false
    } else {
      const alpha = 1 - Math.pow(1 - WHEEL.lerp, dt / WHEEL.frameMs)
      const diff = target - f
      moving = Math.abs(diff) > WHEEL.settleEps
      if (moving) f += diff * alpha
      else f = target

      /* The lens rides up on the same lerp as the position — it belongs to the
         motion — and lets go on its own 150ms clock. */
      if (moving) {
        lens += (1 - lens) * alpha
        if (lens > 1 - LENS.eps) lens = 1
      } else {
        lens -= dt / LENS.fadeMs
        if (lens < LENS.eps) lens = 0
      }
    }

    render(f, lens, reduce)

    const active = Math.round(f)
    if (active !== published) {
      published = active
      onIndex?.(active)
    }

    if (moving || lens !== 0) {
      raf = requestAnimationFrame(frame)
    } else {
      /* Settled. The loop stops rather than idling forever; the next scroll,
         resize or click restarts it. */
      lastTime = 0
    }
  }

  const start = () => {
    if (raf || cancelled) return
    lastTime = 0
    raf = requestAnimationFrame(frame)
  }

  const jumpTo = (index: number) => {
    const k = clamp(Math.round(index), 0, boundaries.length - 1)
    const top = Math.max(0, boundaries[k] - WHEEL.jumpOffset)
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
    start()
  }

  const onQuery = () => {
    reduce = query.matches
    start()
  }
  const onScroll = () => start()
  const onResize = () => {
    measure()
    start()
  }

  query.addEventListener("change", onQuery)
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onResize)

  /* Boot — use-wheel.ts lines 494-506. A reload can restore a scroll position,
     so the first paint has to answer the scroll it actually starts at. */
  measure()
  f = targetFrom(window.scrollY)
  lens = 0
  published = Math.round(f)
  render(f, 0, reduce)
  if (published !== 0) onIndex?.(published)

  document.fonts?.ready.then(() => {
    if (cancelled) return
    measure()
    start()
  })

  return {
    start,
    measure,
    boundaries: () => boundaries.slice(),
    jumpTo,
    destroy: () => {
      cancelled = true
      query.removeEventListener("change", onQuery)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
  }
}
