"use client"

import Image, { type ImageProps } from "next/image"

import {
  createSpring,
  prefersReducedMotion,
  SETTLE_SCALE,
  SPRING_SETTLE,
  type SpringDriver,
} from "@/lib/motion"

/* ============================================================================
   SettleIn — an image stops popping and starts arriving.

   Map task #20, Ion-approved: "sprung fade/scale on media load, wire with
   muted stand-ins". Every media slot on this site is a muted rectangle that
   already reserves its exact box — the letter's photo slot, the deck's cards,
   the landing column's panels. Until now the picture replaced that rectangle
   the instant its bytes landed: one frame stone, the next frame photograph.
   That is a POP, and on a slow connection it happens three or four times down
   a page you are trying to read.

   This is the whisper that replaces it. When the bytes land the picture rises
   out of the stand-in on the spring shelf: opacity 0 → 1, scale 0.98 → 1, on
   `SPRING_SETTLE` (lib/motion.ts). Nothing else moves.

   ── WHAT IT IS: A CALLBACK REF, NOT A COMPONENT ────────────────────────────

   `settleRef` is a plain function you hand to `ref`. It is deliberately NOT a
   hook, and that is a hard requirement rather than a preference:
   `components/letter/cover-flow.tsx` maps five photographs inside a render,
   and a hook cannot be called in a loop. It is also why there is no state
   anywhere below — the deck's whole architecture is "the component renders
   exactly once", because a re-render re-runs its callback refs and a spring
   rebuilt mid-flight restarts at velocity zero. A one-shot per image costs
   that architecture nothing: React never hears that an image loaded.

   `SettleImage` is the two-line convenience for everyone else — `next/image`
   with the ref already attached — so a call site reads as a picture and not as
   a piece of motion plumbing.

   ── NO LAYOUT SHIFT, BY CONSTRUCTION ───────────────────────────────────────

   `opacity` and `transform` only. Neither is a layout property, so the settle
   cannot move a single line of text below it. The box was already the right
   size before the picture existed — the stand-in is what reserves it — so
   there is nothing here that could reflow even if it wanted to.

   ── THE CACHED CASE MUST NOT FLASH ─────────────────────────────────────────

   The rule Ion set is that a picture already in the browser is simply THERE.
   Back out of a letter, come back to it, and nothing fades. There are two ways
   an image can already be here, and they need two different answers:

     1. IT BEAT HYDRATION.  The HTML carried the `<img>`, the browser fetched
        it while React was still downloading, and by the time the ref attaches
        `el.complete` is already true. This is the ordinary case on a warm
        reload. Answer: return immediately and never touch the element. Note
        that this branch also covers "JavaScript is slow today" — on a phone
        that hydrates at 900ms, every image is settled and nothing animates,
        which is the right trade. An entrance you cannot trust not to fire late
        is worse than no entrance.

     2. IT CAME FROM CACHE AFTER MOUNT.  A client-side back-navigation
        re-mounts the route, so React builds a BRAND NEW `<img>` element. Its
        `complete` is false at attach even though the bytes are sitting in the
        browser's memory cache — the fetch still has to go round the loader —
        and it turns true a handful of milliseconds later. `complete` alone
        would animate here, which is exactly the flash the rule forbids.
        Answer: `INSTANT_MS` below.

   ── SSR, NO-JS, AND WHY NOTHING IS HIDDEN ON THE SERVER ────────────────────

   The server renders an ordinary, fully visible image. Hiding it in the markup
   would mean a browser with JavaScript off — or a hydration that never
   arrives — shows a permanently invisible picture, and no entrance is worth
   that. So the hold is applied by JavaScript, in the ref callback, which runs
   during React's commit and therefore BEFORE the browser's next paint. The
   hidden state is never painted; the picture had no pixels yet anyway.

   ── REDUCED MOTION ─────────────────────────────────────────────────────────

   Instant appearance. The query is read at the two moments a decision is
   made — attach, and the load event — rather than subscribed to, because a
   per-image `matchMedia` listener on a page of a dozen pictures buys only one
   thing: flipping the OS setting DURING a settle that has at most 400ms left
   to run. The stand-in still holds the box, so the promise that matters —
   nothing jumps — is kept either way.
   ========================================================================== */

/**
 * ms. A load that finishes this fast after mount counts as "already here", and
 * the picture is handed back to the stylesheet with no animation at all.
 *
 * TWO FRAMES AT 60Hz. The question this number answers is not "was it cached"
 * — that is unknowable from script, and `PerformanceResourceTiming` cannot be
 * matched reliably against an `<img>` that `next/image` gave a `srcset`. The
 * question is "did anybody SEE the stand-in", and the honest unit for that is
 * frames. If the bytes were here before the browser had painted the empty box
 * twice, there was nothing to rise out of, and a 400ms fade would be motion
 * invented out of nothing.
 *
 * Two rather than one is margin, not taste: `load` is delivered as a task, and
 * a task queued behind hydration work can miss a 16.7ms window it deserved to
 * make. Erring long costs a cached image its animation, which is the outcome
 * the rule wants anyway; erring short costs a flash, which is the outcome the
 * rule forbids.
 */
const INSTANT_MS = 33

/** Hold the picture back. `will-change` is deliberately NOT set here: a lazy
 *  image ten panels down the landing column can sit in this state for a long
 *  time, and promising the compositor a layer for each one is a real cost for
 *  no benefit. It is promised in `arrive`, one frame before it is needed. */
function hold(el: HTMLImageElement) {
  el.style.opacity = "0"
  el.style.transform = `scale(${SETTLE_SCALE})`
}

/** Hand the element back to the stylesheet. Clearing the properties rather
 *  than writing `1` and `scale(1)` matters: the resting look of a picture
 *  belongs to its own CSS, and an inline `transform: scale(1)` left behind
 *  would quietly out-rank any class that ever wanted to transform it. */
function release(el: HTMLImageElement) {
  el.style.opacity = ""
  el.style.transform = ""
  el.style.willChange = ""
}

/**
 * Settle one image in when it loads.
 *
 * `ref={settleRef}` — that is the whole API. It returns React 19's ref
 * cleanup, so a picture that unmounts mid-settle stops its spring and drops
 * its listeners.
 */
export function settleRef(el: HTMLImageElement | null): (() => void) | undefined {
  // React 19 calls the cleanup on detach, so this is only the legacy null
  // call and the "no element" case.
  if (!el) return

  // Case 1 above: it beat hydration. Also the reduced-motion exit.
  if (el.complete || prefersReducedMotion()) return

  const mountedAt = performance.now()
  hold(el)

  let driver: SpringDriver | null = null

  const done = () => {
    el.removeEventListener("load", arrive)
    el.removeEventListener("error", fail)
  }

  const arrive = () => {
    done()
    // Case 2 above, and the reduced-motion re-read.
    if (performance.now() - mountedAt < INSTANT_MS || prefersReducedMotion()) {
      release(el)
      return
    }
    el.style.willChange = "opacity, transform"
    driver = createSpring(SPRING_SETTLE, (p) => {
      // The spring is overdamped (ζ = 1.18), so it arrives at exactly 1 and
      // never passes it — the last paint is the settled picture, and clearing
      // the inline styles there is invisible.
      if (p >= 1) {
        release(el)
        return
      }
      el.style.opacity = p.toFixed(4)
      el.style.transform = `scale(${(SETTLE_SCALE + (1 - SETTLE_SCALE) * p).toFixed(5)})`
    })
    driver.set(1)
  }

  // A picture that cannot load must not stay invisible: the alt text is the
  // content at that point, and it has to be reachable.
  const fail = () => {
    done()
    release(el)
  }

  el.addEventListener("load", arrive)
  el.addEventListener("error", fail)

  return () => {
    done()
    driver?.stop()
    release(el)
  }
}

/**
 * `next/image`, settled in.
 *
 * A drop-in for `<Image>` at any media slot that sits on a muted stand-in.
 * Props are `next/image`'s own and nothing is intercepted.
 *
 * `ref` is omitted from the type ON PURPOSE rather than merged: the ref IS the
 * feature, and a call site that silently overwrote it would look like it had
 * this behaviour while having none of it. A surface that needs the node for
 * something else renders its own `<Image>` and attaches `settleRef` beside it.
 */
export function SettleImage({ alt, ...props }: Omit<ImageProps, "ref">) {
  // `alt` is pulled out and written back explicitly rather than riding the
  // spread. It is not styling: `jsx-a11y/alt-text` cannot see a prop that
  // arrives inside `{...props}`, so spreading it would silence a lint rule
  // that exists to catch a real omission at every call site below this one.
  return <Image {...props} alt={alt} ref={settleRef} />
}
