"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import {
  placePreview,
  useFaceMeasure,
  useMorphPreview,
  usePreviewMedia,
} from "@/lib/morph-preview"

import { GitHubCard, LinkedInCard, XCard } from "./social-cards"
import { SOCIALS } from "./socials"

/* ============================================================================
   SOCIAL HOVER PREVIEWS — Demo 2 of docs/design/popover-lab.html, "the Colin
   morph". POR-24, innards raised to Colin's fidelity in POR-36.

   THREE ICONS, ONE CONTAINER. First hover grows the container out of that
   icon (the CSS entrance: scale .98 → 1, fade, rise 4px, glide 200ms). Slide
   to the next icon and the container MORPHS — position and size tween over
   200ms on the same glide — while the card content crossfades through 2px of
   blur. It never closes and reopens. Leaving the cluster collapses it at the
   last anchor in 150ms; the container does not travel on the way out, it goes
   away where it stood.

   The engine is `lib/morph-preview.ts`, shared with the collection row
   previews and the Ledgy card. The three faces are `social-cards.tsx`, which
   is where every anatomical and colour decision is written down. What is
   here is this cluster's own GEOMETRY and nothing else.

   ── WIDTHS ────────────────────────────────────────────────────────────────
   264 / 244 / 244, verbatim from the lab's CARDS table, and unchanged by
   POR-36. They are deliberately not all the same: the lab made the cards
   three different sizes "so the morph is visible rather than theoretical",
   and that is the whole point of the demo. Heights are MEASURED off the
   mounted faces, not tabled — which is what let the cards get three times
   richer without a single number moving in this file.

   ── PLACEMENT ─────────────────────────────────────────────────────────────
   BELOW the icon, centred on it. This is the lab's ruling and its reason is
   literally our landing: "the row sits high in this hero, and a card above it
   lands on the identity chip — the anchor for demo 1 — which reads as a
   replacement rather than a preview."

   The container is portalled to the body and positioned in VIEWPORT space
   (`data-fixed`). Two reasons. The anchors live in the landing's STICKY rail,
   which is pinned for almost all of the page's scroll, so viewport
   coordinates are the ones that hold still. And a portal puts the card
   outside every ancestor stacking context on the way down — including the
   entrance wrappers in intro-reveal.tsx, whose transform animation would
   otherwise become the containing block for a fixed child.

   Vertical bounds come from the rail, horizontal bounds from the viewport.
   That split is deliberate: a 264-wide card centred on a 20px icon inside a
   263-wide rail is MEANT to overhang the rail, but it is never meant to
   float over the identity chip. Bounding Y by the rail is the lab's
   stage-relative fit test written in viewport space.

   ── WHAT IS NOT HERE ──────────────────────────────────────────────────────
   The lab's click handler. It calls `preventDefault()` and toggles the card
   on a non-hover device, because in the lab the icons are `<button>`s that go
   nowhere. Ours are real links to real destinations, and previews are gated
   off on touch entirely, so a tap must simply follow the link. Rejecting that
   handler is what keeps them working links.
   ========================================================================= */

/** Lab CARDS table, verbatim. */
const CARD_W = { GitHub: 264, X: 244, LinkedIn: 244 } as const

type Network = keyof typeof CARD_W

/** One source for a destination: the icon and its card's pill share an href. */
const HREF = Object.fromEntries(SOCIALS.map((s) => [s.label, s.href])) as Record<
  Network,
  string
>

export function SocialPreviews({ className }: { className?: string }) {
  const { enabled, reducedRef } = usePreviewMedia()

  const anchors = React.useRef(new Map<string, HTMLElement>())
  const { registerFace, heights } = useFaceMeasure(enabled, [])

  const place = React.useCallback(
    (key: string) => {
      const el = anchors.current.get(key)
      if (!el) return null

      // The rail is the region a rail preview belongs to. Falling back to the
      // viewport keeps this honest if the cluster is ever mounted outside one.
      const rail = el.closest("[data-rail]")
      const rr = rail?.getBoundingClientRect()

      return placePreview({
        anchor: el.getBoundingClientRect(),
        w: CARD_W[key as Network],
        h: heights.current.get(key) ?? 150,
        prefer: "below",
        bounds: {
          top: rr ? rr.top : 0,
          bottom: Math.min(rr ? rr.bottom : window.innerHeight, window.innerHeight),
          left: 0,
          right: window.innerWidth,
        },
        align: { kind: "center" },
      })
    },
    [heights]
  )

  const preview = useMorphPreview<string>({ enabled, place, reducedRef })
  const { attachPop, attachInner, enter, leave, hold, focus, shown, active } = preview

  return (
    <>
      <div className={className}>
        {SOCIALS.map(({ label, href, Glyph, size }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            data-active={active === label}
            ref={
              enabled
                ? (el) => {
                    if (el) anchors.current.set(label, el)
                    else anchors.current.delete(label)
                  }
                : undefined
            }
            {...(enabled
              ? {
                  onMouseEnter: () => enter(label),
                  onMouseLeave: leave,
                  onFocus: () => focus(label),
                  onBlur: leave,
                }
              : null)}
            // UNCHANGED at rest. Figma's Social link components are bare
            // glyphs — no button chrome, no padding. Their only state change
            // is the fill: muted-foreground → foreground. Hover snaps in and
            // eases out over 150ms, the same rule the Button follows. The
            // preview adds one thing: while a card is open its icon holds the
            // lit state, so the cluster says which card you are looking at.
            className="flex size-5 items-center justify-center text-muted-foreground [transition:color_var(--duration-fast)_var(--motion-glide)] hover:text-foreground hover:[transition-duration:0ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground data-[active=true]:text-foreground data-[active=true]:[transition-duration:0ms]"
          >
            <Glyph className={size} />
          </a>
        ))}
      </div>

      {enabled &&
        createPortal(
          <div
            ref={attachPop}
            className="hover-pop"
            // A stable handle for the headless probes, which have to prove
            // that this exact node survives an anchor-to-anchor morph.
            data-pop="socials"
            data-fixed="true"
            data-open="false"
            // `inert`, not `aria-hidden`, since POR-36 made the cards' pills
            // real links. The two say different things and only one of them is
            // safe here: `aria-hidden` hides a subtree from assistive tech
            // while leaving it tabbable, which is how you build a dead end —
            // a keyboard user lands on a "Follow" button their screen reader
            // has been told does not exist. `inert` removes it from BOTH, and
            // does it only while the card is closed, which is the honest
            // statement: there is nothing there to reach until it opens. The
            // Ledgy card took this exact route for the same reason.
            //
            // `active` is the engine's own open flag, already state because
            // the icons read it for their lit state — so this costs no extra
            // render.
            inert={active === null}
            style={{ "--pop-z": 50 } as React.CSSProperties}
            onMouseEnter={hold}
            onMouseLeave={leave}
          >
            <div ref={attachInner} className="hover-pop-inner">
              {(Object.keys(CARD_W) as Network[]).map((network) => (
                <div
                  key={network}
                  ref={registerFace(network)}
                  className="hover-pop-face"
                  data-on={shown === network}
                  style={{ width: CARD_W[network] }}
                >
                  <SocialCard network={network} />
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

function SocialCard({ network }: { network: Network }) {
  if (network === "GitHub") return <GitHubCard />
  if (network === "X") return <XCard href={HREF.X} />
  return <LinkedInCard href={HREF.LinkedIn} />
}
