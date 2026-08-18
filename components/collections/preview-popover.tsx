"use client"

import * as React from "react"

import type { CollectionPreview } from "@/content/collections"
import { createMorph, type Morph } from "@/lib/morph"

/* ----------------------------------------------------------------------------
   THE PREVIEW ENGINE

   Ported from `docs/design/collection-lab.html` (its "THE PREVIEW POPOVER"
   block), which lifted the mechanics from `docs/design/popover-lab.html`
   unchanged. Every constant below is one of those labs' constants; none of
   them was re-derived here.

     INTENT 150   Hover intent. Nothing appears before the pointer has been on
                  a row for 150ms, so crossing a list never flashes cards.
     GRACE  140   Leave grace. The card is enterable: the pointer can cross the
                  8px gap into it and the card cancels its own close. The
                  popover family's grace band is 140–300ms; the preview sits at
                  the bottom of it because the list is dense and a slow close
                  reads as a card that will not go away.
     GAP      8   Row → card. Also the corridor the pointer walks through.
     CARD_W 280   Card width. Fixed; height follows the content.
     CARD_R  15   radius/lg.
     INSET   24   The card's left edge sits 24px inside the row's left edge.
                  This is load-bearing, not styling: a 280 card centred on a
                  640 row would cover the rows underneath, and a covered row
                  cannot be hovered — which kills the row-to-row morph exactly
                  when it matters. Left-anchored, the right half of every row
                  stays live and the pointer can walk the list.
     MORPH  200   duration-base. Row → adjacent row tweens the ONE container's
                  rect; it never closes and reopens.

   DESKTOP ONLY. `(hover: hover) and (pointer: fine) and (min-width: 1024px)`.
   A touch device gets no previews at all — there is no hover to intend with,
   and the ruled mobile collection page is a plain readable stack. The 1024
   clause is the spec's "<lg gets no popovers" written literally; the hover
   clause alone would still fire on a narrow desktop window.
   ------------------------------------------------------------------------- */

const INTENT = 150
const GRACE = 140
const GAP = 8
const EDGE = 8
const INSET = 24
const MORPH_MS = 200

export const CARD_W = 280
export const CARD_R = 15

const DESKTOP_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 1024px)"

/** One row's card: its key, its heading, and what to draw inside. */
export type PreviewAnchor = {
  key: string
  /** The excerpt card's own title. Ignored by the site and repo faces. */
  title: string
  preview: CollectionPreview
}

type PreviewApi = {
  /** True when previews are live at all — false on touch and below lg. */
  enabled: boolean
  register: (key: string, el: HTMLElement | null) => void
  enter: (key: string) => void
  leave: () => void
  focus: (key: string) => void
  dismiss: () => void
}

const PreviewContext = React.createContext<PreviewApi | null>(null)

/**
 * The open row's key, on its OWN context.
 *
 * It used to sit on `PreviewApi`, which meant the api object was a new object
 * on every hover — and `attach` below is a `useCallback` keyed on that object.
 * Walking a list therefore handed every row a new callback ref on every move,
 * so React detached and re-attached the ref of every row in the list, several
 * times a second, to answer a question about one of them. Split out, the api
 * is built once and the churn is gone; what remains is a single boolean per
 * row, which is the fact that actually changed.
 */
const PreviewActiveContext = React.createContext<string | null>(null)

/**
 * What a row needs to become a preview anchor. Safe to spread onto any element;
 * with previews disabled every handler is a no-op and `ref` is unused.
 */
export function usePreviewAnchor(key: string) {
  const api = React.useContext(PreviewContext)
  const activeKey = React.useContext(PreviewActiveContext)

  const attach = React.useCallback(
    (el: HTMLElement | null) => api?.register(key, el),
    [api, key]
  )

  if (!api?.enabled) {
    return { attach: undefined, active: false, handlers: {} as const }
  }

  return {
    /** Callback ref. Named `attach`, not `ref`: a property called `ref` on a
     *  hook's return value trips react-hooks/refs, which cannot tell a
     *  callback ref from a ref object read during render. */
    attach,
    active: activeKey === key,
    handlers: {
      onMouseEnter: () => api.enter(key),
      onMouseLeave: () => api.leave(),
      onFocus: () => api.focus(key),
      onBlur: () => api.leave(),
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Escape") api.dismiss()
      },
    },
  }
}

/**
 * The stage. Wraps a whole collection column, owns the one popover node, and
 * mounts one face per row inside it.
 *
 * The container is positioned against THIS element, not the viewport, so it
 * scrolls with the list for free. Only the above/below decision reads the
 * viewport, and a scroll listener re-snaps the card when that decision flips.
 */
export function PreviewProvider({
  anchors,
  children,
}: {
  anchors: PreviewAnchor[]
  children: React.ReactNode
}) {
  const [enabled, setEnabled] = React.useState(false)
  const [activeKey, setActiveKey] = React.useState<string | null>(null)
  /** The face on screen. Survives `hide` so the card fades out with content. */
  const [shownKey, setShownKey] = React.useState<string | null>(null)

  const stageRef = React.useRef<HTMLDivElement>(null)
  const popRef = React.useRef<HTMLDivElement>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)

  const rows = React.useRef(new Map<string, HTMLElement>())
  const faces = React.useRef(new Map<string, HTMLElement>())
  const heights = React.useRef(new Map<string, number>())

  const morphRef = React.useRef<Morph | null>(null)
  const openRef = React.useRef(false)
  const keyRef = React.useRef<string | null>(null)
  /** Which side of the row the open card sits on. The scroll handler's only
   *  question — see "the card stays glued" below. */
  const belowRef = React.useRef(true)
  const reducedRef = React.useRef(false)
  const tIn = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const tOut = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  /* --- is this a pointer device wide enough for previews? ------------------ */
  React.useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
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
  }, [])

  /* --- measure every card once, then keep the measurements honest ----------
     Heights are read off the mounted faces rather than computed, because the
     copy is placeholder and will change length. The faces are absolutely
     positioned, so measuring them costs no layout of the page. */
  const measure = React.useCallback(() => {
    faces.current.forEach((el, key) => {
      const h = el.offsetHeight
      heights.current.set(key, h > 0 ? h : 200)
    })
  }, [])

  React.useLayoutEffect(() => {
    if (!enabled || !popRef.current) return
    const morph = createMorph(popRef.current)
    morphRef.current = morph
    measure()

    // Aeonik is a webfont: a card measured before it loads is a card measured
    // in the fallback's metrics.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    void fonts?.ready.then(measure)

    const onResize = () => measure()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      morph.cancel()
      morphRef.current = null
    }
  }, [enabled, measure, anchors])

  /* --- geometry ------------------------------------------------------------ */
  const targetRect = React.useCallback((key: string) => {
    const rowEl = rows.current.get(key)
    const stage = stageRef.current
    if (!rowEl || !stage) return null

    const h = heights.current.get(key) ?? 200
    const ar = rowEl.getBoundingClientRect()
    const sr = stage.getBoundingClientRect()

    const maxX = sr.width - CARD_W - EDGE
    const x = Math.round(
      Math.min(Math.max(ar.left - sr.left + INSET, EDGE), Math.max(maxX, EDGE))
    )

    // Prefer below. Flip above only when below would leave the viewport AND
    // above actually fits — otherwise a card near the bottom of a short window
    // would flip into the header instead.
    const fitsBelow = ar.bottom + GAP + h + EDGE <= window.innerHeight
    const fitsAbove = ar.top - GAP - h - EDGE >= 0
    const below = fitsBelow || !fitsAbove

    const y = Math.round(
      below ? ar.bottom - sr.top + GAP : ar.top - sr.top - h - GAP
    )
    return { rect: { x, y, w: CARD_W, h, r: CARD_R }, below }
  }, [])

  /* --- open / close -------------------------------------------------------- */
  const show = React.useCallback(
    (key: string) => {
      if (tOut.current) clearTimeout(tOut.current)
      const morph = morphRef.current
      const pop = popRef.current
      if (!morph || !pop) return
      if (openRef.current && keyRef.current === key) return

      const target = targetRect(key)
      if (!target) return

      // The origin is set on every open, not only the first: it decides which
      // edge the card shrinks toward on close, and a card that flipped above
      // must shrink downward. (The lab sets it once — it only ever opens
      // below. Documented refinement, flagged in the report.)
      belowRef.current = target.below
      if (innerRef.current) {
        innerRef.current.style.transformOrigin = target.below
          ? "50% 0%"
          : "50% 100%"
      }

      if (!openRef.current) {
        // First open: placed at its FINAL rect. The entrance does the growing
        // (scale .98 → 1 + fade + 4px rise); the box itself never animates.
        morph.snap(target.rect)
        openRef.current = true
        pop.setAttribute("data-open", "true")
      } else {
        // Sibling row: the one container morphs.
        morph.move(target.rect, reducedRef.current ? 0 : MORPH_MS)
      }

      keyRef.current = key
      setShownKey(key)
      setActiveKey(key)
    },
    [targetRect]
  )

  const hide = React.useCallback(() => {
    if (tIn.current) clearTimeout(tIn.current)
    if (!openRef.current) return
    openRef.current = false
    popRef.current?.setAttribute("data-open", "false")
    setActiveKey(null)
    // `shownKey` is deliberately kept: the card fades out still showing the
    // row it belonged to.
  }, [])

  /* --- the card stays glued while the page scrolls -------------------------
     The card is positioned against the STAGE, so scrolling moves the two
     together for free and there is nothing to correct. The one thing a scroll
     can change is the above/below decision, which reads the viewport.

     So the handler does two things it did not do before. It runs at most once
     per frame, on the same rAF gate the wheel and the mobile controller use —
     unthrottled it was doing three `getBoundingClientRect()` reads and a full
     morph paint per scroll EVENT, which on a trackpad is several per frame.
     And it returns the moment it sees the side has not flipped, so the common
     case costs the reads and nothing else.

     Resize is different and stays unconditional: it moves the stage itself,
     so the card's x, its width budget and its height all have to be retaken. */
  React.useEffect(() => {
    if (!enabled) return

    let ticking = false
    let raf = 0

    const place = (force: boolean) => {
      if (!openRef.current || !keyRef.current) return
      const target = targetRect(keyRef.current)
      if (!target) return
      if (!force && target.below === belowRef.current) return
      belowRef.current = target.below
      if (innerRef.current) {
        innerRef.current.style.transformOrigin = target.below
          ? "50% 0%"
          : "50% 100%"
      }
      morphRef.current?.snap(target.rect)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        ticking = false
        raf = 0
        place(false)
      })
    }
    const onResize = () => place(true)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, targetRect])

  React.useEffect(
    () => () => {
      if (tIn.current) clearTimeout(tIn.current)
      if (tOut.current) clearTimeout(tOut.current)
    },
    []
  )

  const api = React.useMemo<PreviewApi>(
    () => ({
      enabled,
      register(key, el) {
        if (el) rows.current.set(key, el)
        else rows.current.delete(key)
      },
      enter(key) {
        if (tOut.current) clearTimeout(tOut.current)
        // Already open: an adjacent row morphs at once. Re-serving the intent
        // delay here is what would turn a morph into a close-and-reopen.
        if (openRef.current) {
          show(key)
          return
        }
        if (tIn.current) clearTimeout(tIn.current)
        tIn.current = setTimeout(() => show(key), INTENT)
      },
      leave() {
        if (tIn.current) clearTimeout(tIn.current)
        if (tOut.current) clearTimeout(tOut.current)
        tOut.current = setTimeout(hide, GRACE)
      },
      focus(key) {
        if (tOut.current) clearTimeout(tOut.current)
        show(key)
      },
      dismiss: hide,
    }),
    [enabled, hide, show]
  )

  return (
    <PreviewContext.Provider value={api}>
      <PreviewActiveContext.Provider value={activeKey}>
        <div ref={stageRef} className="relative">
          {children}

          {enabled && (
            <div
              ref={popRef}
              className="collection-pop"
              data-open="false"
              aria-hidden="true"
              onMouseEnter={() => {
                if (tOut.current) clearTimeout(tOut.current)
              }}
              onMouseLeave={api.leave}
            >
              <div ref={innerRef} className="collection-pop-inner">
                {anchors.map((anchor) => (
                  <div
                    key={anchor.key}
                    ref={(el) => {
                      if (el) faces.current.set(anchor.key, el)
                      else faces.current.delete(anchor.key)
                    }}
                    className="collection-pop-face"
                    data-on={anchor.key === shownKey}
                    style={{ width: CARD_W }}
                  >
                    <PreviewCard title={anchor.title} preview={anchor.preview} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PreviewActiveContext.Provider>
    </PreviewContext.Provider>
  )
}

/* ----------------------------------------------------------------------------
   THE THREE FACES

   Figma: Stack 20:1173, Agents & skills 20:1567, Articles 20:1584. All three
   are the same 280-wide popover-filled card at radius/lg with the Overlay
   elevation; only what is inside them differs.
   ------------------------------------------------------------------------- */

function PreviewCard({
  title,
  preview,
}: {
  title: string
  preview: CollectionPreview
}) {
  if (preview.kind === "excerpt") {
    // 20:1584 — pad 12, gap 8. No chrome, no mock: articles go inward.
    return (
      <div className="flex flex-col gap-2 p-3">
        <p className="text-subhead text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{preview.excerpt}</p>
        <p className="text-xs text-muted-foreground">{preview.readTime}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <BrowserChrome />

      {preview.kind === "site" ? (
        /* 20:1178 — the wireframe site mock. Rect widths are the frame's own,
           inside the card's 256 of content width. */
        <div className="flex flex-col gap-2 p-3">
          <Block w={120} h={10} />
          <Block w={256} h={8} />
          <Block w={210} h={8} />
          <Block w={168} h={8} />
          <Block w={256} h={48} />
        </div>
      ) : (
        /* 20:1572 — the README mock: a heading, a code block, one line. */
        <div className="flex flex-col gap-2 p-3">
          <Block w={96} h={12} />
          <Block w={256} h={28} />
          <Block w={256} h={8} />
        </div>
      )}

      {preview.kind === "repo" && (
        <>
          <div className="h-px w-full bg-border" />
          {/* 20:1578 — the ratified depth: the row stays one line, the curious
              get the paragraph on hover. */}
          <div className="flex flex-col gap-1 px-3 pt-3">
            <p className="text-xs text-muted-foreground">How I use it</p>
            {preview.usage.map((line) => (
              <p key={line} className="text-sm text-foreground">
                {line}
              </p>
            ))}
          </div>
        </>
      )}

      <p
        className={
          preview.kind === "repo"
            ? "p-3 text-xs text-muted-foreground"
            : "px-3 pb-3 text-xs text-muted-foreground"
        }
      >
        {preview.domain}
      </p>
    </div>
  )
}

/** 20:1174 — the 28px strip with three 6px dots. */
function BrowserChrome() {
  return (
    <div className="flex h-7 shrink-0 items-center gap-1.5 bg-muted px-3">
      <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
      <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
      <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
    </div>
  )
}

/** One wireframe bar. Radius 4 is raw in the frame and stays raw here — it is
 *  art inside a mock, not a surface on the radius ladder. */
function Block({ w, h }: { w: number; h: number }) {
  return (
    <span
      className="block shrink-0 rounded-[4px] bg-muted"
      style={{ width: w, height: h }}
    />
  )
}
