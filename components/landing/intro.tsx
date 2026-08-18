import { buttonVariants } from "@/components/ui/button"
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
 * The two blocks are the second and third groups of the first-load entrance
 * (intro-reveal.tsx). `Reveal` is a client wrapper, so the copy inside stays
 * server-rendered — and stays visible — whether or not React ever hydrates.
 */

export function Intro() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal group="hero" className="flex flex-col pl-1">
        <h1 className="text-lg text-foreground">Software Designer</h1>
        {/* 255px is the measured wrap width from Figma (259 hug − 4 indent).
            It is what breaks the line after "heart," and after "and". */}
        <p className="w-[255px] text-lg text-muted-foreground">
          Curious generalist at heart, building AI native software and fintech
          systems at <LedgyMention />
        </p>
      </Reveal>

      <Reveal group="actions" className="flex items-center gap-4 pl-1">
        {/* `buttonVariants` on a plain anchor rather than `<Button asChild>`:
            Button attaches an onClick for its inert/aria-disabled guard, and a
            function prop cannot cross a Server Component boundary — asChild
            here fails the prerender. The variants carry the whole look and the
            press/hover motion, so the anchor is visually identical and this
            block stays a Server Component.

            The 70% on the glyph is Figma's, not the Button primitive's —
            measured off the reference export (#7e7976 = stone-400 at 70% over
            stone-900). Flagged in the report as a system question. */}
        <a
          href="https://cal.com/"
          target="_blank"
          rel="noreferrer noopener"
          data-slot="button"
          data-variant="primary"
          className={cn(buttonVariants(), "[&_svg]:opacity-70")}
        >
          Book a call
          <ArrowUpRight />
        </a>

        <SocialPreviews className="flex items-center gap-4" />
      </Reveal>
    </div>
  )
}
