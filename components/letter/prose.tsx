import { CoverFlow } from "@/components/letter/cover-flow"
import { SettleImage } from "@/components/ui/settle-in"
import type { LetterBlock, LetterSection, LetterSpan } from "@/content/letter"

/**
 * Letter prose — the reading column's renderers.
 *
 * Geometry is measured off Figma "Letter — light" (13:2941). Server Components:
 * nothing here is interactive.
 *
 * The type steps map straight onto the contract (token-contract.md 3.6), which
 * is why there is not a single arbitrary font size in this file:
 *
 *   Title    → `text-2xl`   24 / Medium / 125% / −1%
 *   Heading  → `text-lg`    18 / Medium / 130% / −1%
 *   Prose    → `text-base`  16 / Regular / 170%   ← the letter's body
 *   Caption  → `text-xs`    12 / Regular / 140%   ← dates, photo captions, footnote
 *
 * The frame's vertical rhythm, in Figma pixels → Tailwind step:
 *   48 between sections (`gap-12`), 16 heading→body (`gap-4`),
 *   24 or 8 between blocks (`gap-6` / `gap-2`), 8 title→date (`gap-2`),
 *   16 between photos (`gap-4`), 12 photo→caption (`gap-3`).
 */

/* ---------------------------------------------------------------------------
   Inline runs
   ------------------------------------------------------------------------- */

/**
 * The frame carries "Ledgy" as an UNDERLINE text run with no link attached — it
 * reads as emphasis, not navigation. `components/landing/intro.tsx` renders the
 * same word the same way (a bare underlined <span>), so the letter matches it
 * rather than inventing a destination. Flagged in the report: if these should
 * become real links, both files change together.
 */
function Span({ span }: { span: LetterSpan }) {
  if (span.strong) {
    return <strong className="font-medium">{span.text}</strong>
  }
  if (span.underline) {
    return <span className="underline">{span.text}</span>
  }
  // A plain run gets no element of its own — the key rides on <Span> itself.
  return <>{span.text}</>
}

function Spans({ spans }: { spans: LetterSpan[] }) {
  return (
    <>
      {spans.map((span, i) => (
        <Span key={i} span={span} />
      ))}
    </>
  )
}

/* ---------------------------------------------------------------------------
   Blocks
   ------------------------------------------------------------------------- */

/**
 * A media slot: the muted rounded rect the frame draws — 220px tall,
 * `rounded-xl` (the 21px step, bound to radius/xl in Figma), `bg-muted` — with
 * a picture in it once there is one.
 *
 * THE RECT IS NOT A LOADING STATE, IT IS THE SLOT. It reserves the exact box
 * whether art has landed or not, which is what lets the picture arrive with no
 * layout shift at all: nothing below it can move, because nothing above it
 * ever changes size. When `src` is given the picture rises out of the rect on
 * the spring shelf — `components/ui/settle-in.tsx` — and when it is not, the
 * rect is the whole slot and the caption carries the meaning, exactly as
 * before.
 *
 * `SettleImage` is a Client Component inside this Server Component, which is
 * ordinary: what crosses the boundary is a reference the bundler resolves, and
 * the prose stays on the server. It is the same crossing `CoverFlow` makes.
 */
export function Photo({
  caption,
  src,
  alt,
}: {
  caption: string
  /** Path under /public. Omitted, the slot is the muted rectangle alone. */
  src?: string
  /** The picture's own description, for anyone who cannot see it. Leave it
   *  empty only when the caption below genuinely says everything the picture
   *  does. */
  alt?: string
}) {
  return (
    <figure className="flex flex-1 flex-col gap-3">
      <div
        className="relative h-55 w-full overflow-hidden rounded-xl bg-muted"
        // Decorative while it is an empty rectangle; once it holds a picture
        // the picture's own `alt` is what should be read.
        aria-hidden={src ? undefined : true}
      >
        {src ? (
          <SettleImage
            src={src}
            alt={alt ?? ""}
            fill
            // Next's optimiser refuses SVG unless `dangerouslyAllowSVG` is set
            // globally, and that is not a switch a placeholder gets to throw.
            // Derived rather than hard-coded so a real JPEG dropped into the
            // same slot is optimised without anyone remembering to say so.
            unoptimized={src.endsWith(".svg")}
            className="object-cover"
            // The reading column is 640 wide; a `PhotoRow` halves that, and
            // asking for the larger of the two is the safe way round.
            sizes="(max-width: 768px) 100vw, 640px"
          />
        ) : null}
      </div>
      <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  )
}

/**
 * A row of media slots — the frame's side-by-side photo pair, and the shape an
 * MDX article reaches for. `Block`'s `photos` case renders exactly this; it is
 * named and exported so the article pipeline can use the letter's slot rather
 * than growing a second one that drifts from it.
 *
 * EXPORTED FOR ARTICLES (wave 1B). The letter's own rendering is unchanged —
 * `Photo` simply stopped being module-private.
 */
export function PhotoRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-4">{children}</div>
}

/**
 * A `photos` block is the deck — `components/letter/cover-flow.tsx`.
 *
 * POR-31 replaced the frame's static two-up row with it. `Photo` and `PhotoRow`
 * above are untouched and still exported: they are the plain slot an article
 * reaches for when a deck would be too much, and they are what the deck falls
 * back to under reduced motion in spirit if not in code.
 *
 * A "use client" import inside a Server Component is ordinary — what crosses is
 * a reference the bundler resolves, and the letter's prose stays on the server.
 */
function Block({ block }: { block: LetterBlock }) {
  if (block.type === "photos") {
    return <CoverFlow photos={block.photos} label="Photographs from the letter" />
  }
  return (
    <p className="text-base text-foreground">
      <Spans spans={block.spans} />
    </p>
  )
}

/* ---------------------------------------------------------------------------
   Sections
   ------------------------------------------------------------------------- */

/**
 * One letter section, and the scroll-spy's target.
 *
 * `scroll-mt-24` (96px) is the same clearance `globals.css` gives every `[id]`.
 * It is restated here because it is load-bearing twice over: the wheel's
 * smooth-scroll uses `scrollIntoView`, which honours scroll-margin, and a plain
 * `#hash` jump (no JS) lands in the same place.
 */
export function Section({ section }: { section: LetterSection }) {
  const body = (
    <div
      className={
        section.blockGap === 8 ? "flex flex-col gap-2" : "flex flex-col gap-6"
      }
    >
      {section.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )

  // The opening section has no heading in the frame, so it is the body alone —
  // no empty 16px gap, no heading-shaped hole.
  if (!section.heading) {
    return (
      <section id={section.id} aria-label={section.nav} className="scroll-mt-24">
        {body}
      </section>
    )
  }

  return (
    <section id={section.id} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="text-lg text-foreground">{section.heading}</h2>
      {body}
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Furniture
   ------------------------------------------------------------------------- */

export function TitleBlock({ title, date }: { title: string; date: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl text-foreground">{title}</h1>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  )
}

/**
 * The footnote: a 1px `border` rule, then the note at Caption.
 *
 * A real <hr> rather than a styled div — it is a thematic break, and the border
 * colour comes from the base `* { border-color: var(--color-border) }` rule.
 */
export function Footnote({ children }: { children: string }) {
  return (
    <div className="flex flex-col gap-2">
      <hr className="border-t" />
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  )
}

/**
 * The sign-off.
 *
 * Both the squiggle and the italic name are marked "replace with Ion's real
 * asset" / "(placeholder)" in the frame, so they are reproduced exactly and no
 * further: the two vector paths are Figma's own (13:3020, 13:3021), traced at
 * 1.5 stroke with round caps, and the 28px italic is the frame's — it is
 * deliberately off the type scale because it stands in for a scanned signature.
 * Flagged in the report.
 *
 * `overflow-visible`: the round caps bleed 0.75px past the 134x37 box, and an
 * SVG root clips by default.
 */
export function Signature({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <svg
        width="134"
        height="37"
        viewBox="0 0 134 37"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="overflow-visible text-foreground"
      >
        <path d="M 0 26 C 12 -2 28 -4 36 10 C 44 24 38 32 32 28 C 24 22 32 4 54 4 C 72 4 76 18 90 16 C 102 14 106 2 118 0" />
        <path transform="translate(14 25)" d="M 0 8 C 36 14 80 12 120 0" />
      </svg>
      <p className="text-[28px] leading-none font-normal text-foreground italic">
        {name}
      </p>
    </div>
  )
}
