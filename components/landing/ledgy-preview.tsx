"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { ArrowUpRight } from "@/lib/icons"
import {
  placePreview,
  useFaceMeasure,
  useMorphPreview,
  usePreviewMedia,
} from "@/lib/morph-preview"

/* ============================================================================
   LEDGY — THE EXTERNAL-SITE PREVIEW. Demo 3 of docs/design/popover-lab.html.
   POR-24, scope comment: "Ledgy in the intro → website preview popover,
   CLICKABLE THROUGH to the site".

   Hover the underlined Ledgy for 150ms and a 280-wide preview grows from the
   link: a browser-chrome mock with traffic dots, a wireframe hero, and a
   `ledgy.com ↗` caption. Same entrance family as the social cluster — scale
   .98 → 1, fade, rise 4px, glide 200ms — because it is the same container and
   the same engine (`lib/morph-preview.ts`). It is a LONE anchor, so there is
   no cross-anchor morph here: just open and close.

   This is the pattern for every external site we name, and later for article
   hover-cards.

   ── PLACEMENT ─────────────────────────────────────────────────────────────
   Prefers ABOVE the link — the site preview belongs over the sentence that
   named the site — and flips below when there is no room. On the landing it
   always flips: the link sits in the intro's third line, and 218px above that
   is the identity chip. Bounding Y by the rail is what makes that flip
   happen, and it is the lab's own stage-relative fit test in viewport space.
   (In the lab's mock hero it flips for exactly the same reason.)

   `getClientRects()[0]` and not `getBoundingClientRect()`, verbatim from the
   lab: an inline link that wraps across two lines has a bounding box spanning
   both, and a card centred on that box is centred on nothing. The first
   fragment is the one the pointer is on.

   ── THE CARD IS A LINK ────────────────────────────────────────────────────
   The lab lays a transparent `.press` anchor over inert content. We wrap
   instead: same single link, same inert content (`aria-hidden` +
   `pointer-events: none`), but the 0.985 spring press is actually VISIBLE.
   In the lab it could not be — `.press` is an empty, transparent overlay, so
   scaling it scaled nothing. Adopted with that correction; flagged.

   Because the card holds a real link it must not be a tab stop while closed,
   and it must not be `aria-hidden` while open (a focusable node inside an
   `aria-hidden` subtree is an assistive-tech dead end). `inert` answers both:
   closed, the whole subtree is out of the tab order and out of the
   accessibility tree; open, it is a normal link.

   ALL CONTENT IS PLACEHOLDER — a muted wireframe stand-in, never a screenshot
   and never a claim. The href is the real destination.
   ========================================================================= */

const LEDGY_HREF = "https://ledgy.com"
const LEDGY_HOST = "ledgy.com"

/** Lab constants, verbatim: `var W = 280, MOCK_H = 180, CAP_H = 32, PAD = 6`. */
const CARD_W = 280
const MOCK_H = 180
const PAD = 6
/** 180 + 32 + 6 = 218. The measured height wins; this is the seed. */
const CARD_H = MOCK_H + 32 + PAD

const KEY = "ledgy"

export function LedgyMention() {
  const { enabled, reducedRef } = usePreviewMedia()

  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const { registerFace, heights } = useFaceMeasure(enabled, [])
  const [open, setOpen] = React.useState(false)

  const place = React.useCallback(() => {
    const el = linkRef.current
    if (!el) return null

    // An inline link can be two rects. Take the first fragment.
    const rects = el.getClientRects()
    const lr = rects.length ? rects[0] : el.getBoundingClientRect()

    const rail = el.closest("[data-rail]")
    const rr = rail?.getBoundingClientRect()

    return placePreview({
      anchor: lr as DOMRect,
      w: CARD_W,
      h: heights.current.get(KEY) ?? CARD_H,
      prefer: "above",
      bounds: {
        top: rr ? rr.top : 0,
        bottom: Math.min(rr ? rr.bottom : window.innerHeight, window.innerHeight),
        left: 0,
        right: window.innerWidth,
      },
      align: { kind: "center" },
    })
  }, [heights])

  const preview = useMorphPreview<string>({ enabled, place, reducedRef })
  const { attachPop, attachInner, enter, leave, hold, focus, active } = preview

  // `active` is the engine's open flag. Mirrored into state only because the
  // card's `inert` has to change with it, and `inert` is a rendered attribute.
  React.useEffect(() => setOpen(active === KEY), [active])

  return (
    <>
      <a
        ref={linkRef}
        href={LEDGY_HREF}
        target="_blank"
        rel="noreferrer noopener"
        {...(enabled
          ? {
              onMouseEnter: () => enter(KEY),
              onMouseLeave: leave,
              onFocus: () => focus(KEY),
              onBlur: leave,
            }
          : null)}
        // At rest this is the ratified underline and nothing else — same
        // inherited colour, same weight, same decoration the plain span had.
        className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Ledgy
      </a>

      {enabled &&
        createPortal(
          <div
            ref={attachPop}
            className="hover-pop"
            // A stable handle for the headless probes, which have to prove
            // that this exact node survives an anchor-to-anchor morph.
            data-pop="ledgy"
            data-fixed="true"
            data-open="false"
            inert={!open}
            style={{ "--pop-z": 50 } as React.CSSProperties}
            onMouseEnter={hold}
            onMouseLeave={leave}
          >
            <div ref={attachInner} className="hover-pop-inner">
              <div
                ref={registerFace(KEY)}
                className="hover-pop-face"
                data-on="true"
                style={{ width: CARD_W }}
              >
                <LedgyCard />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

function LedgyCard() {
  return (
    <a
      href={LEDGY_HREF}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={LEDGY_HOST}
      // `scale`, not `transform`: Tailwind 4 compiles `scale-*` to the
      // standalone `scale` property, so a `transition-transform` here would
      // animate nothing.
      className="block [transition:scale_var(--duration-fast)_var(--motion-spring)] active:scale-[0.985]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none flex flex-col"
        style={{ width: CARD_W }}
      >
        {/* the browser mock */}
        <div
          className="m-1.5 mb-0 flex flex-col overflow-hidden rounded-md border border-border bg-background"
          style={{ height: MOCK_H }}
        >
          <div className="flex h-[22px] shrink-0 items-center gap-1 border-b border-border bg-muted px-2">
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            {/* 9px is raw art inside a mock, not a step on the type scale —
                the same precedent the collection card's raw radius set. */}
            <span className="ml-1.5 font-mono text-[9px] text-muted-foreground">
              {LEDGY_HOST}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-[7px] px-3.5 pt-3.5">
            <Wire w="62%" h={11} />
            <Wire w="44%" h={11} />
            <Wire w="88%" h={6} />
            <Wire w="70%" h={6} />
            <span
              className="mt-1 block shrink-0 rounded-[5px] bg-ring"
              style={{ width: 74, height: 16 }}
            />
            {/* Bleeds to the mock's edges and is cut off by its bottom, the
                lab's `margin:8px -14px 0` + `radius 8px 8px 0 0`: the page
                continues past the frame, which is what makes it read as a
                screenshot rather than a card. */}
            <span className="mt-1 -mx-3.5 block flex-1 rounded-t-lg bg-muted" />
          </div>
        </div>

        {/* the caption */}
        <div className="flex h-8 items-center gap-1.5 px-3 text-xs text-foreground">
          <span className="font-medium">{LEDGY_HOST}</span>
          <ArrowUpRight className="ml-auto size-3 text-muted-foreground" />
        </div>
      </div>
    </a>
  )
}

/** One wireframe bar. Radius 4 is raw in the mock and stays raw — it is art
 *  inside a stand-in, not a surface on the radius ladder. */
function Wire({ w, h }: { w: string; h: number }) {
  return (
    <span
      className="block shrink-0 rounded-[4px] bg-muted"
      style={{ width: w, height: h }}
    />
  )
}
