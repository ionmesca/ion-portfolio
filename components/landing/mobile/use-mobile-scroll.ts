"use client"

import * as React from "react"

/* ============================================================================
   Mobile landing — the scroll controller.

   OPTION B, "scroll as control" (POR-22, ratified). The cards ARE the page:
   there is no wheel, no drum, no gesture layer. Native scroll is the input and
   this hook is the only thing reading it.

   BEHAVIOUR LAW: docs/design/mobile-lab.html, Option B (`stepB`). Ported
   faithfully — the two constants below are its constants, and the reveal rule
   is its flagged deviation, ratified with the option:

     ACTIVE_LINE  0.40  the card crossing 40% of the viewport is the active one
                        (the same boundary the desktop wheel uses)
     reveal       the indicator arrives when card 1 reaches the bar's own
                  bottom edge — top bar 56 + bar 40 = 96px — i.e. exactly as
                  the first card starts sliding under it. At rest the bar is
                  ABSENT, which is the design, not a missing state.

   ONE ADDITION the lab does not have: the meter. Figma pass 11 §D made the
   bar's bottom edge a 2px progress meter whose fill is "progress through the
   CURRENT project's media, resetting per project". A project's media span is
   defined here as the scroll distance between its own activation and the next
   project's activation; for the last project it is the distance to the end of
   the page, so the meter completes exactly when the page does. When a project
   owns several media panels later, the same rule holds with no change.

   The meter is written straight to the DOM, not to React state. It changes
   every frame you scroll, and a re-render per frame to move 2px of fill is a
   bill nobody should pay.

   SINCE THE MOTION ADOPTION (2026-08-18) this hook no longer paints the meter's
   transform. It publishes the raw number twice — to `data-progress` on the
   meter element, which is the honest scroll readout the POR-22 probes assert
   against, and to `onProgress`, which the indicator feeds into a Motion spring.
   The fill you see is the spring; the number you can measure is this one. The
   two must not both write `transform`, so this hook stopped.
   ========================================================================== */

export const ACTIVE_LINE = 0.4

/** Top bar 56 + indicator 40 (Figma 20:599 / 20:605). */
export const TOPBAR_H = 56
export const INDICATOR_H = 40
const REVEAL_PX = TOPBAR_H + INDICATOR_H

/** Below `lg` the desktop rail is display:none and this controller is the page.
 *  Above it, the mobile tree is hidden and nothing here should run. */
const MOBILE_QUERY = "(max-width: 1023.98px)"

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export type MobileScroll = {
  /** Index of the project on the activation line. 0 before anything crosses. */
  index: number
  /** Is the indicator bar on screen? False at rest — by design. */
  revealed: boolean
}

export function useMobileScroll({
  listRef,
  meterRef,
  count,
  onProgress,
}: {
  listRef: React.RefObject<HTMLElement | null>
  meterRef: React.RefObject<HTMLElement | null>
  count: number
  /** Called with the raw 0..1 progress on every frame the scroll moves. */
  onProgress?: (progress: number) => void
}): MobileScroll {
  const [state, setState] = React.useState<MobileScroll>({
    index: 0,
    revealed: false,
  })

  // Held in a ref so a new closure from the caller never re-runs the effect —
  // re-attaching the scroll listener mid-scroll drops a frame and re-measures
  // for no reason. Synced in an effect, not during render: a ref written during
  // render is the `react-hooks/refs` error, and this one has no reason to be.
  const publish = React.useRef(onProgress)
  React.useEffect(() => {
    publish.current = onProgress
  })

  React.useEffect(() => {
    if (count === 0) return

    let mq: MediaQueryList | null = null
    try {
      mq = window.matchMedia(MOBILE_QUERY)
    } catch {
      mq = null
    }

    /** Document-space top of every card, remeasured on layout changes. */
    let tops: number[] = []
    let maxScroll = 0
    let ticking = false
    let raf = 0
    let lastScroll = -1
    let attached = false
    let cancelled = false

    const cards = () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLElement>(
          '[data-slot="mobile-card"]'
        ) ?? []
      )

    const measure = () => {
      const st = window.scrollY
      tops = cards().map((c) => c.getBoundingClientRect().top + st)
      maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      )
      lastScroll = -1 // force the next step to recompute
    }

    const paintMeter = (progress: number) => {
      const el = meterRef.current
      if (el) el.dataset.progress = progress.toFixed(3)
      publish.current?.(progress)
    }

    const step = () => {
      if (tops.length === 0) return
      const st = window.scrollY
      if (st === lastScroll) return
      lastScroll = st

      const line = window.innerHeight * ACTIVE_LINE

      let idx = -1
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] - st <= line) idx = i
        else break
      }

      const revealed = idx >= 0 && tops[0] - st <= REVEAL_PX

      if (idx >= 0) {
        const start = tops[idx] - line
        const end = idx + 1 < tops.length ? tops[idx + 1] - line : maxScroll
        paintMeter(clamp01((st - start) / Math.max(end - start, 1)))
      } else {
        paintMeter(0)
      }

      const index = idx < 0 ? 0 : idx
      setState((prev) =>
        prev.index === index && prev.revealed === revealed
          ? prev
          : { index, revealed }
      )
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        ticking = false
        raf = 0
        step()
      })
    }

    const onResize = () => {
      measure()
      step()
    }

    // The card stack's own size changes (webfont settling, an art asset
    // landing) move every top under it — but so does anything ABOVE it, and
    // the hero above it is the part that reflows when Aeonik lands. Watching
    // the list alone measured a 2.3% meter drift and a stuck "1 / 5" that only
    // a resize event healed, so the observed element is `document.body`: the
    // one box whose height covers the hero, the list, and the footer at once.
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize)

    const attach = () => {
      if (attached) return
      attached = true
      measure()
      step()
      window.addEventListener("scroll", onScroll, { passive: true })
      window.addEventListener("resize", onResize)
      observer?.observe(document.body)

      // `display: swap` paints the fallback first. Its metrics are close, not
      // equal, so every card top measured before Aeonik lands is a card top
      // measured in the wrong font — the same re-measure the palette
      // (command-palette.tsx) and the preview engine (preview-popover.tsx)
      // already take.
      document.fonts?.ready.then(() => {
        if (cancelled || !attached) return
        measure()
        step()
      })
    }

    const detach = () => {
      if (!attached) return
      attached = false
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      observer?.disconnect()
      // A frame is already booked when the last scroll event and the detach
      // land together. Left alone it runs against a torn-down controller and
      // leaves `ticking` true, which deafens the hook on the next attach.
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      ticking = false
      setState((prev) => (prev.revealed ? { ...prev, revealed: false } : prev))
    }

    const sync = () => {
      if (!mq || mq.matches) attach()
      else detach()
    }

    sync()
    mq?.addEventListener("change", sync)

    return () => {
      cancelled = true
      mq?.removeEventListener("change", sync)
      detach()
    }
  }, [count, listRef, meterRef])

  return state
}
