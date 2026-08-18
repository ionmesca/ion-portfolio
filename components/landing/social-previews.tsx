"use client"

import Image from "next/image"
import * as React from "react"
import { createPortal } from "react-dom"

import {
  placePreview,
  useFaceMeasure,
  useMorphPreview,
  usePreviewMedia,
} from "@/lib/morph-preview"

import { SOCIALS } from "./socials"

/* ============================================================================
   SOCIAL HOVER PREVIEWS — Demo 2 of docs/design/popover-lab.html, "the Colin
   morph". POR-24.

   THREE ICONS, ONE CONTAINER. First hover grows the container out of that
   icon (the CSS entrance: scale .98 → 1, fade, rise 4px, glide 200ms). Slide
   to the next icon and the container MORPHS — position and size tween over
   200ms on the same glide — while the card content crossfades through 2px of
   blur. It never closes and reopens. Leaving the cluster collapses it at the
   last anchor in 150ms; the container does not travel on the way out, it goes
   away where it stood.

   The engine is `lib/morph-preview.ts`, shared with the collection row
   previews and the Ledgy card. What is here is this cluster's own geometry
   and its four faces.

   ── WIDTHS ────────────────────────────────────────────────────────────────
   264 / 244 / 244, verbatim from the lab's CARDS table. They are deliberately
   not all the same: the lab made the cards three different sizes "so the
   morph is visible rather than theoretical", and that is the whole point of
   the demo. Heights are MEASURED off the mounted faces, not tabled — every
   word in these cards is placeholder and will change length.

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

   ALL CONTENT IS PLACEHOLDER — muted stand-ins for art, per POR-24. No number
   in these cards is real, and none of them is a control: the family's rule is
   that a hover-opened surface never holds an action you must not misfire, so
   the Follow and Connect pills are decorative `<span>`s, not buttons.
   ========================================================================= */

/** Lab CARDS table, verbatim. */
const CARD_W = { GitHub: 264, X: 244, LinkedIn: 244 } as const

type Network = keyof typeof CARD_W

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
            // Supplementary: everything in these cards is decoration or a
            // restatement of the link's own label, and none of it is
            // reachable by keyboard. The screen reader gets the link.
            aria-hidden="true"
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

/* ----------------------------------------------------------------------------
   THE THREE FACES

   One grammar, from the lab's `.card-pad` / `.card-head-row` block: 12px pad,
   a 22px round avatar, a 13px medium name, and an 12px muted domain pushed to
   the right. What differs is what POR-24 asks each network to show.
   ------------------------------------------------------------------------- */

function SocialCard({ network }: { network: Network }) {
  if (network === "GitHub") return <GitHubCard />
  if (network === "X") return <XCard />
  return <LinkedInCard />
}

/** POR-24: avatar + contributions count + green graph. */
function GitHubCard() {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <Avatar size={22} />
        <span className="text-small font-medium text-foreground">ionmesca</span>
        <span className="ml-auto text-xs text-muted-foreground">github.com</span>
      </div>
      <p className="text-xs text-muted-foreground">
        1,204 contributions in the last year
      </p>
      <ContributionGraph />
    </div>
  )
}

/** POR-24: banner + handle + follow. */
function XCard() {
  return (
    <div className="flex flex-col">
      <Banner />
      <div className="flex flex-col gap-2 p-3">
        <div className="-mt-6 flex items-end gap-2">
          <Avatar size={32} ring />
          <span className="ml-auto rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
            Follow
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-small font-medium text-foreground">Ion Mesca</span>
          <span className="text-xs text-muted-foreground">@ionmesca · x.com</span>
        </div>
      </div>
    </div>
  )
}

/** POR-24: banner + profile card + CTA. */
function LinkedInCard() {
  return (
    <div className="flex flex-col">
      <Banner />
      <div className="flex flex-col gap-2 p-3">
        <Avatar size={32} ring className="-mt-6" />
        <div className="flex flex-col">
          <span className="text-small font-medium text-foreground">Ion Mesca</span>
          <span className="text-xs text-muted-foreground">
            Software Designer at Ledgy
          </span>
          <span className="text-xs text-muted-foreground">
            Zurich · 500+ connections
          </span>
        </div>
        <span className="mt-1 rounded-full bg-foreground px-3 py-1 text-center text-xs font-medium text-background">
          Connect
        </span>
      </div>
    </div>
  )
}

/* --- the placeholder art --------------------------------------------------- */

/** The banner strip. A muted stand-in, not an image: nothing here is real. */
function Banner() {
  return <div className="h-14 w-full shrink-0 bg-muted" aria-hidden="true" />
}

function Avatar({
  size,
  ring,
  className,
}: {
  size: number
  ring?: boolean
  className?: string
}) {
  return (
    <Image
      src="/ion-avatar.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={[
        "shrink-0 rounded-full object-cover",
        ring ? "ring-2 ring-popover" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * The contribution graph — 24 weeks x 7 days of 8px cells.
 *
 * GREEN, and specifically `--status-available`. POR-24 asks for "the green
 * graph"; the system is pure stone by decision and carries exactly ONE
 * non-stone hue, the availability dot. Reusing it is the only way to draw a
 * green graph without inventing a token, and inventing one is a ratification
 * call for Ion, not a decision this component gets to make. FLAGGED.
 *
 * The levels come from an INTEGER hash, not `Math.random` and not
 * `Math.sin`: this renders on the server and again on the client, and the two
 * have to agree exactly or React reports a hydration mismatch.
 */
const GRAPH_COLS = 24
const GRAPH_ROWS = 7

function level(col: number, row: number) {
  let h = (col * 73856093) ^ (row * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  const v = h % 100
  if (v < 46) return 0
  if (v < 68) return 1
  if (v < 84) return 2
  if (v < 95) return 3
  return 4
}

/** Ramp for levels 1–4. Level 0 is `bg-muted`, the empty day. */
const LEVEL_OPACITY = [0, 0.3, 0.5, 0.75, 1]

function ContributionGraph() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${GRAPH_COLS}, 8px)`,
        gridTemplateRows: `repeat(${GRAPH_ROWS}, 8px)`,
        gridAutoFlow: "column",
      }}
    >
      {Array.from({ length: GRAPH_COLS * GRAPH_ROWS }, (_, i) => {
        const col = Math.floor(i / GRAPH_ROWS)
        const row = i % GRAPH_ROWS
        const l = level(col, row)
        return (
          <span
            key={i}
            className="rounded-[2px] bg-muted"
            style={
              l === 0
                ? undefined
                : {
                    backgroundColor: "var(--color-status-available)",
                    opacity: LEVEL_OPACITY[l],
                  }
            }
          />
        )
      })}
    </div>
  )
}
