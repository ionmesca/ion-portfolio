/**
 * Morph — the container FLIP engine, ported from `docs/design/popover-lab.html`.
 *
 * ONE element is tweened between two rects on a single rAF clock. The element
 * is absolutely positioned and therefore out of flow, so tweening its width and
 * height relayouts only its own subtree and never the page; its position rides
 * on a transform, so it stays composited. This is the sanctioned morph from the
 * motion system (POR-32 implementation contract, clause 4) and the mechanic
 * decoded from Colin Lienard's Contacts.svelte.
 *
 * Two things make it worth a hand-written rAF loop instead of a CSS transition:
 *
 *   1. The `p` channel. It is a free 0→1 lane on the SAME clock as the box, so
 *      per-element travel (the ⌘K keycap sliding to the panel's right edge) is
 *      literally the same interpolation as the container's growth — including
 *      when a close interrupts an open half way through.
 *   2. Retargeting. `move()` restarts from the current interpolated rect, so a
 *      new target mid-flight reads as one continuous movement rather than a cut.
 *
 * No animation library, per the contract. The easing is solved in JS because a
 * CSS timing function cannot be sampled from script.
 */

export type MorphRect = {
  x: number
  y: number
  w: number
  h: number
  /** Corner radius. STATIC in the palette (chip and panel are both 15). */
  r?: number
  /** Free 0→1 channel for per-element travel on the container's clock. */
  p?: number
}

type MorphState = Required<MorphRect>

/**
 * Newton-Raphson cubic-bezier solver, verbatim from the lab (line 1021).
 * Eight iterations is what the lab shipped and what its 100/100 verification
 * run measured; it is well inside float precision for a 200ms tween.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (x: number) => number {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a
  const B = (a: number, b: number) => 3 * b - 6 * a
  const C = (a: number) => 3 * a
  const calc = (t: number, a: number, b: number) =>
    ((A(a, b) * t + B(a, b)) * t + C(a)) * t
  const slope = (t: number, a: number, b: number) =>
    3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a)

  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2)
      if (s === 0) break
      t -= (calc(t, x1, x2) - x) / s
    }
    if (t < 0) t = 0
    if (t > 1) t = 1
    return calc(t, y1, y2)
  }
}

/** `--motion-glide` — the self-moving-surface easing. Must stay in step with
 *  the token in globals.css; it is duplicated here only because JS cannot read
 *  a CSS timing function. */
export const GLIDE = cubicBezier(0.16, 1, 0.3, 1)

export type Morph = {
  /** Jump with no animation — first placement, resize, reduced motion. */
  snap: (rect: MorphRect) => void
  /** Tween to `rect` over `ms`. Retargetable mid-flight. `ms <= 0` snaps. */
  move: (rect: MorphRect, ms: number, done?: () => void) => void
  /** The current interpolated rect. */
  rect: () => MorphState
  busy: () => boolean
  cancel: () => void
}

export function createMorph(
  el: HTMLElement,
  onPaint?: (cur: MorphState) => void
): Morph {
  let cur: MorphState = { x: 0, y: 0, w: 0, h: 0, r: 15, p: 0 }
  let from: MorphState = cur
  let to: MorphState = cur
  let t0 = 0
  let ms = 0
  let raf = 0
  let done: (() => void) | null = null

  const paint = () => {
    el.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`
    el.style.width = `${cur.w}px`
    el.style.height = `${cur.h}px`
    el.style.borderRadius = `${cur.r}px`
    onPaint?.(cur)
  }

  const lerp = (a: number, b: number, p: number) => a + (b - a) * p

  const resolve = (r: MorphRect): MorphState => ({
    x: r.x,
    y: r.y,
    w: r.w,
    h: r.h,
    r: r.r === undefined ? cur.r : r.r,
    p: r.p === undefined ? cur.p : r.p,
  })

  const frame = (now: number) => {
    let p = ms <= 0 ? 1 : (now - t0) / ms
    if (p > 1) p = 1
    const e = GLIDE(p)
    cur = {
      x: lerp(from.x, to.x, e),
      y: lerp(from.y, to.y, e),
      w: lerp(from.w, to.w, e),
      h: lerp(from.h, to.h, e),
      r: lerp(from.r, to.r, e),
      p: lerp(from.p, to.p, e),
    }
    paint()
    if (p < 1) {
      raf = requestAnimationFrame(frame)
      return
    }
    raf = 0
    el.setAttribute("data-morphing", "false")
    const d = done
    done = null
    d?.()
  }

  /**
   * Abandon the tween where it stands.
   *
   * CANCEL MEANS ABANDONED. The `done` callback is dropped, never fired: it is
   * the "we arrived" callback, and a cancelled tween did not arrive. Firing it
   * would tell the caller a rect was reached that never was. `snap()` and
   * `move()` both cancel first and then take responsibility for the new
   * target, so nothing is lost by dropping it here.
   *
   * `data-morphing` is cleared too, and unconditionally: the attribute is what
   * the stylesheet reads to hold `will-change` on for the duration of the
   * motion, so a cancel that left it saying "true" would pin a compositing
   * layer forever.
   */
  const cancel = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    done = null
    el.setAttribute("data-morphing", "false")
  }

  return {
    snap(rect) {
      cancel()
      cur = resolve(rect)
      el.setAttribute("data-morphing", "false")
      paint()
    },
    move(rect, duration, cb) {
      const target = resolve(rect)
      cancel()
      if (duration <= 0) {
        cur = target
        paint()
        el.setAttribute("data-morphing", "false")
        cb?.()
        return
      }
      from = cur
      to = target
      ms = duration
      done = cb ?? null
      t0 = performance.now()
      el.setAttribute("data-morphing", "true")
      raf = requestAnimationFrame(frame)
    },
    rect: () => ({ ...cur }),
    busy: () => !!raf,
    cancel,
  }
}
