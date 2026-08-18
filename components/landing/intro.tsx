import { buttonVariants } from "@/components/ui/button"
import { PressSpring } from "@/components/ui/press-spring"
import { TextEffect } from "@/components/ui/text-effect"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "@/lib/icons"

import { Reveal } from "./intro-reveal"
import { LedgyMention } from "./ledgy-preview"
import { SocialPreviews } from "./social-previews"

/**
 * Intro — the positioning block: headline, subline, and the actions row.
 *
 * Figma 11:1672. The 4px left indent on both the headline and the actions is
 * deliberate: it lines the copy up with the avatar's left edge inside the
 * identity chip above (chip padding-left is also 4), not with the chip's own
 * outer edge.
 *
 * PLACEHOLDER COPY — verbatim from the Figma frame.
 *
 * The socials list lives in `./socials` — the mobile hero renders the same
 * three destinations at the same glyph sizes. On a desktop pointer the three
 * anchors are rendered by `SocialPreviews`, which adds the hover previews
 * (POR-24, popover-lab Demo 2) and nothing else: at rest, and on touch, the
 * markup and every class are exactly what they were.
 *
 * The Ledgy mention is `LedgyMention` for the same reason — it gains the
 * external-site preview (Demo 3) and becomes a real link to ledgy.com, and is
 * otherwise the same underlined word.
 *
 * ── THE HERO GROUP NO LONGER RISES; IT RESOLVES ────────────────────────────
 *
 * The headline and the positioning line used to be a `<Reveal group="hero">`
 * wrapper doing a fade and a 4px rise, like every other group. Ion replaced
 * that with motion-primitives' `TextEffect` blur variant: the text arrives
 * out of `blur(10px)`, one unit at a time. So the wrapper is a plain `<div>`
 * now — one entrance per group, and the text's own is richer than a rise.
 * `TextEffect` still takes the hero GROUP, so it starts when the choreography
 * says the hero starts; see components/ui/text-effect.tsx for the clock, the
 * bundle reasoning, and why the headline splits per character while the line
 * below it splits per word.
 *
 * `Reveal` (still used by the actions row) is a client wrapper, so the copy
 * inside stays server-rendered — and stays visible — whether or not React ever
 * hydrates. The same is true of `TextEffect`: its resting style is the settled
 * text.
 */

/** The positioning line, split per word by `TextEffect`. Written out here as
 *  one string because it IS one sentence — the trailing space before the Ledgy
 *  link is part of it, and losing it would run "at" into "Ledgy". */
const POSITIONING =
  "Curious generalist at heart, building AI native software and fintech systems at "

/** The headline. A constant because the sub-line QUEUES BEHIND IT and is handed
 *  this exact string to measure — see `after` in components/ui/text-effect.tsx.
 *  Editing the copy in one place moves the hand-off with it. */
const HEADLINE = "Software Designer"

export function Intro() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col pl-1">
        {/* Per CHARACTER, and safe to be: a heading's role accepts a name, so
            `aria-label` restates the string for assistive tech and the split
            spans are hidden from it. */}
        <TextEffect
          as="h1"
          group="hero"
          text={HEADLINE}
          className="text-lg text-foreground"
        />

        {/* 255px is the measured wrap width from Figma (259 hug − 4 indent).
            It is what breaks the line after "heart," and after "and". The
            per-word split keeps that break: the spaces stay in normal flow as
            plain text nodes, so the line box is measured exactly as it was
            before the text was split at all. */}
        <TextEffect
          as="p"
          per="word"
          group="hero"
          // STACKED, not offset (Ion, round 3). It used to start 25ms behind the
          // headline — four characters on a 10ms step, which is two sweeps at
          // once. `after` queues this line behind the headline's LAST unit, so
          // the eye follows one sweep that runs to the end of the first line and
          // then starts the second. The string, not a number: see text-effect.tsx.
          after={{ text: HEADLINE }}
          text={POSITIONING}
          className="w-[255px] text-lg text-muted-foreground"
        >
          <LedgyMention />
        </TextEffect>
      </div>

      <Reveal group="actions" className="flex items-center gap-4 pl-1">
        {/* `buttonVariants` on a plain anchor rather than `<Button asChild>`:
            Button attaches an onClick for its inert/aria-disabled guard, and a
            function prop cannot cross a Server Component boundary — asChild
            here fails the prerender. The variants carry the whole look and the
            hover motion, so the anchor is visually identical and this block
            stays a Server Component.

            `PressSpring` wraps it without changing that. It renders no element
            of its own (it is a `Slot`), and what crosses the boundary is this
            element as a description, not as a rendered node. It brings the
            press and release onto the real spring; `btn-spring` is what takes
            `scale` off the primitive's transition list so the two clocks do
            not fight. `active:scale-[0.97]` stays underneath as the no-JS
            press. See components/ui/press-spring.tsx.

            `group` is for the arrow's orbit, below.

            The 70% on the glyph is Figma's, not the Button primitive's —
            measured off the reference export (#7e7976 = stone-400 at 70% over
            stone-900). Flagged in the report as a system question. */}
        <PressSpring>
          <a
            href="https://cal.com/"
            target="_blank"
            rel="noreferrer noopener"
            data-slot="button"
            data-variant="primary"
            className={cn(
              buttonVariants(),
              "group btn-spring [&_svg]:opacity-70"
            )}
          >
            Book a call
            {/* THE ORBIT (Amicro btn-32, retimed and rethemed — see
                `.btn-orbit` in globals.css section 6). Two copies of the same
                arrow in a 16px box that clips: on hover the leading one exits
                along the direction it points, up and to the right, and the
                trailing one arrives from the opposite corner. At rest the
                trailing copy sits a full box outside the clip, so it paints
                nothing and the button is pixel-identical to what it was.

                Both copies are decorative and neither is announced: lucide
                marks its icons `aria-hidden`, and the accessible name of this
                link is its text. */}
            <span className="btn-orbit size-4 shrink-0">
              <ArrowUpRight data-orbit="lead" />
              <ArrowUpRight data-orbit="trail" />
            </span>
          </a>
        </PressSpring>

        <SocialPreviews className="flex items-center gap-4" />
      </Reveal>
    </div>
  )
}
