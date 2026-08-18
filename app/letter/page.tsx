import type { Metadata } from "next"

import { RailShell } from "@/components/nav/rail-shell"
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
  alternates: { canonical: "/letter" },
}

/**
 * /letter — the letter page.
 *
 * Route ruled by the implementation spec: the letter lives at /letter, and the
 * collection of articles will live at /articles later.
 *
 * The layout is `RailShell` — the 272/640/272 grid from Figma "Letter — light"
 * (13:2941), which the three collection frames clone. It used to be drawn here
 * and again in collection-shell.tsx; it is one component now, and that file
 * carries the geometry, the breakpoints and the reasoning behind both.
 *
 * Below `lg` the grid collapses to one centred 640 column, the wheel hides, and
 * "Home" stays. Mobile letter design does not exist in Figma yet, so this is
 * deliberately the plainest thing that keeps the page readable and navigable —
 * not a proposal. Flagged in the report.
 */
export default function LetterPage() {
  return (
    <RailShell nav={letterNav} label="Letter sections" gutter="prose">
      <article className="flex min-w-0 flex-col gap-12">
        <TitleBlock title={letterMeta.title} date={letterMeta.date} />

        {letterSections.map((section) => (
          <Section key={section.id} section={section} />
        ))}

        <Footnote>{letterMeta.footnote}</Footnote>
        <Signature name={letterMeta.signature} />
      </article>
    </RailShell>
  )
}
