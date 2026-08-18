import type { Metadata } from "next"

import { LetterRail } from "@/components/letter/letter-rail"
import {
  Footnote,
  Section,
  Signature,
  TitleBlock,
} from "@/components/letter/prose"
import { letterMeta, letterNav, letterSections } from "@/content/letter"

export const metadata: Metadata = {
  title: "A letter — Ion Mesca",
  description:
    "Who I am, how I got here, and what I think an AI-native interface owes the person using it.",
}

/**
 * /letter — the letter page.
 *
 * Route ruled by the implementation spec: the letter lives at /letter, and the
 * collection of articles will live at /articles later.
 *
 * ── The layout, and why it is a symmetric grid ─────────────────────────────
 *
 * In Figma "Letter — light" (13:2941, 1512 wide) the 640 content column is
 * centred on the page — 436 to 1076, dead centre — and the rail hangs to its
 * left at x=164. Those two facts fix everything else: 436 − 164 = 272, so a
 * 272 / 640 / 272 grid, 1184 wide and centred, puts the rail's left edge at
 * exactly 164 and the column exactly where the frame has it. The empty third
 * column is what keeps the reading column centred rather than pushed right;
 * nothing renders into it.
 *
 * (The rail FRAME is 263 wide in Figma while its contents are 200. 263 is the
 * hand-drawn box, not a measurement anything depends on — the numbers that
 * matter are the rail's left edge and the column's centre.)
 *
 * Below `xl` the grid collapses to one centred 640 column, the wheel hides, and
 * "Home" stays. Mobile letter design does not exist in Figma yet, so this is
 * deliberately the plainest thing that keeps the page readable and navigable —
 * not a proposal. Flagged in the report.
 *
 * Vertical: the frame's page padding is 136px top and bottom (`py-34`). It is
 * off the spacing convention in token-contract.md 3.8, which stops at 96 —
 * flagged in the report; the frame wins as visual law.
 *
 * The page is flat `bg-background`, with no white shell. That is the frame: the
 * landing's gray-behind-white relationship does not carry over here.
 */
export default function LetterPage() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto grid max-w-[1184px] grid-cols-1 gap-10 px-6 py-16 xl:grid-cols-[272px_640px_272px] xl:gap-0 xl:px-0 xl:py-34">
        <LetterRail sections={letterNav} />

        <article className="flex min-w-0 flex-col gap-12">
          <TitleBlock title={letterMeta.title} date={letterMeta.date} />

          {letterSections.map((section) => (
            <Section key={section.id} section={section} />
          ))}

          <Footnote>{letterMeta.footnote}</Footnote>
          <Signature name={letterMeta.signature} />
        </article>
      </div>
    </main>
  )
}
