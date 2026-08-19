"use client"

import * as React from "react"
import Image from "next/image"

import type { CollectionPreview } from "@/content/collections"
import { ArrowRight, ArrowUpRight } from "@/lib/icons"
import {
  placePreview,
  PREVIEW_RADIUS,
  useFaceMeasure,
  useMorphPreview,
  usePreviewMedia,
} from "@/lib/morph-preview"

/* ----------------------------------------------------------------------------
   THE COLLECTION ROW PREVIEW

   The engine — one container, the intent/grace corridor, the anchor-to-anchor
   morph, the desktop gate, the reduced-motion mode — now lives in
   `lib/morph-preview.ts`, shared with the landing's social cluster and its
   Ledgy site preview. Every constant it carries is one of the popover lab's;
   none of them was re-derived. What stays here is what is specific to a
   collection row:

     CARD_W 280   Card width. Fixed; height follows the content.
     CARD_R  15   radius/lg, from the shared engine.
     INSET   24   The card's left edge sits 24px inside the row's left edge.
                  This is load-bearing, not styling: a 280 card centred on a
                  640 row would cover the rows underneath, and a covered row
                  cannot be hovered — which kills the row-to-row morph exactly
                  when it matters. Left-anchored, the right half of every row
                  stays live and the pointer can walk the list.

   Placement prefers BELOW and flips above only when below would leave the
   viewport AND above actually fits — otherwise a card near the bottom of a
   short window would flip into the header instead. The container is
   positioned against the STAGE (the collection column), not the viewport, so
   it scrolls with the list for free.
   ------------------------------------------------------------------------- */

const INSET = 24

export const CARD_W = 280
export const CARD_R = PREVIEW_RADIUS

/** One row's card: its key, its heading, and what to draw inside. */
export type PreviewAnchor = {
  key: string
  /** The excerpt card's own title. Ignored by the tool face. */
  title: string
  preview: CollectionPreview
  /** Row destination. Absent on install-chip rows, which copy rather than go. */
  href?: string
  /** True when href leaves the site. Drives ↗ vs → on the card. */
  external?: boolean
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
  const { enabled, reducedRef } = usePreviewMedia()

  const stageRef = React.useRef<HTMLDivElement>(null)
  const rows = React.useRef(new Map<string, HTMLElement>())
  const { registerFace, heights } = useFaceMeasure(enabled, [anchors])

  const place = React.useCallback((key: string) => {
    const rowEl = rows.current.get(key)
    const stage = stageRef.current
    if (!rowEl || !stage) return null

    const sr = stage.getBoundingClientRect()
    return placePreview({
      anchor: rowEl.getBoundingClientRect(),
      w: CARD_W,
      h: heights.current.get(key) ?? 280,
      prefer: "below",
      // Vertical from the viewport, horizontal from the stage: the card may
      // not leave the window, and it may not leave the column.
      bounds: {
        top: 0,
        bottom: window.innerHeight,
        left: sr.left,
        right: sr.right,
      },
      align: { kind: "inset", inset: INSET },
      origin: { x: sr.left, y: sr.top },
    })
  }, [heights])

  const preview = useMorphPreview<string>({ enabled, place, reducedRef })
  const { attachPop, attachInner, enter, leave, hold, focus, dismiss, active, shown } =
    preview

  const api = React.useMemo<PreviewApi>(
    () => ({
      enabled,
      register(key, el) {
        if (el) rows.current.set(key, el)
        else rows.current.delete(key)
      },
      enter,
      leave,
      focus,
      dismiss,
    }),
    [enabled, enter, leave, focus, dismiss]
  )

  return (
    <PreviewContext.Provider value={api}>
      <PreviewActiveContext.Provider value={active}>
        <div ref={stageRef} className="relative">
          {children}

          {enabled && (
            <div
              ref={attachPop}
              className="hover-pop"
              data-open="false"
              aria-hidden="true"
              onMouseEnter={hold}
              onMouseLeave={leave}
            >
              <div ref={attachInner} className="hover-pop-inner">
                {anchors.map((anchor) => (
                  <div
                    key={anchor.key}
                    ref={registerFace(anchor.key)}
                    className="hover-pop-face"
                    data-on={anchor.key === shown}
                    style={{ width: CARD_W }}
                  >
                    <PreviewCard
                      title={anchor.title}
                      preview={anchor.preview}
                      href={anchor.href}
                      external={anchor.external}
                    />
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
   THE TWO FACES

   Same 280-wide popover-filled card at radius/lg with the Overlay elevation.
   Stack and Agents share the tool face (chrome + screenshot + three-line
   blurb). Writing keeps the excerpt face. The corner glyph is the shared
   affordance: ↗ leaves the site, → stays, and install rows omit it because
   the chip on the row is already the action.
   ------------------------------------------------------------------------- */

const GLYPH = "size-3 shrink-0 text-muted-foreground [&]:[stroke-width:1.5]"

function PreviewCard({
  title,
  preview,
  href,
  external,
}: {
  title: string
  preview: CollectionPreview
  href?: string
  external?: boolean
}) {
  if (preview.kind === "excerpt") {
    return (
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start gap-2">
          <p className="text-subhead min-w-0 flex-1 text-foreground">{title}</p>
          {href && <ArrowRight aria-hidden="true" className={GLYPH} />}
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {preview.excerpt}
        </p>
        <p className="text-xs text-muted-foreground">{preview.readTime}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <BrowserChrome href={href} external={external} />
      <PreviewShot src={preview.image} />
      <p className="line-clamp-3 px-3 pt-3 text-sm text-foreground">
        {preview.blurb}
      </p>
      <p className="p-3 text-xs text-muted-foreground">{preview.domain}</p>
    </div>
  )
}

/** 20:1174 — the 28px strip with three 6px dots, plus the shared corner glyph. */
function BrowserChrome({
  href,
  external,
}: {
  href?: string
  external?: boolean
}) {
  return (
    <div className="flex h-7 shrink-0 items-center gap-1.5 bg-muted px-3">
      <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
      <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
      <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
      {href &&
        (external ? (
          <ArrowUpRight aria-hidden="true" className={`ml-auto ${GLYPH}`} />
        ) : (
          <ArrowRight aria-hidden="true" className={`ml-auto ${GLYPH}`} />
        ))}
    </div>
  )
}

/**
 * Real screenshot inside the chrome. `fill` + a fixed 144px well so the morph
 * measures a stable height before the file decodes. A missing or broken file
 * leaves the muted well rather than a broken image.
 */
function PreviewShot({ src }: { src: string }) {
  const [failed, setFailed] = React.useState(false)

  return (
    <div className="relative h-36 w-full overflow-hidden bg-muted">
      {!failed && (
        <Image
          src={src}
          alt=""
          fill
          sizes="280px"
          loading="lazy"
          className="object-cover object-top"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
