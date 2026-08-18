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
}: {
  listRef: React.RefObject<HTMLElement | null>
  meterRef: React.RefObject<HTMLElement | null>
  count: number
}): MobileScroll {
  const [state, setState] = React.useState<MobileScroll>({
    index: 0,
    revealed: false,
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
    let lastScroll = -1
    let attached = false

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
      if (!el) return
      el.style.transform = `scaleX(${progress})`
      el.dataset.progress = progress.toFixed(3)
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
      requestAnimationFrame(() => {
        ticking = false
        step()
      })
    }

    const onResize = () => {
      measure()
      step()
    }

    // The card stack's own size changes (webfont settling, an art asset
    // landing) move every top under it, so watch the list itself as well as
    // the window.
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize)

    const attach = () => {
      if (attached) return
      attached = true
      measure()
      step()
      window.addEventListener("scroll", onScroll, { passive: true })
      window.addEventListener("resize", onResize)
      if (listRef.current) observer?.observe(listRef.current)
    }

    const detach = () => {
      if (!attached) return
      attached = false
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      observer?.disconnect()
      setState((prev) => (prev.revealed ? { ...prev, revealed: false } : prev))
    }

    const sync = () => {
      if (!mq || mq.matches) attach()
      else detach()
    }

    sync()
    mq?.addEventListener("change", sync)

    return () => {
      mq?.removeEventListener("change", sync)
      detach()
    }
  }, [count, listRef, meterRef])

  return state
}
