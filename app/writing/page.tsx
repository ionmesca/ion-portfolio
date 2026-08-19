import type { Metadata } from "next"

import { ArticleList } from "@/components/collections/collection-list"
import { CollectionShell } from "@/components/collections/collection-shell"
import { navFor } from "@/content/collections"
import { getArticlesPage } from "@/lib/articles"

export const metadata: Metadata = {
  title: "Writing — Ion Mesca",
  description: "Notes from building things that ship.",
  alternates: { canonical: "/writing" },
}

/**
 * /writing — flavour 3 of the collection pattern.
 *
 * Figma "Articles — desktop light" 20:1363. The iconless row (title + date),
 * an excerpt-card preview, and a wheel of years instead of categories.
 *
 * IT IS CALLED WRITING (Ion, 2026-08-19). The route and the label were both
 * "articles"; the site is pre-launch, so the URL moved with the word rather
 * than leaving an address that says one thing while the page says another.
 * The FILES keep their name — `content/articles/*.mdx`, `lib/articles.ts` —
 * because those are code names and nobody reads them out loud.
 *
 * THE ROWS NAVIGATE. The list is read off `content/articles/*.mdx` at build
 * time (`lib/articles.ts`), so every row points at a page that exists and the
 * year groups are a fact about the dates rather than a second list to keep in
 * step. The old hand-written nine rows, all pointing at `href="#"`, are gone —
 * see the note at the foot of `content/collections.ts`.
 *
 * A Server Component reading the filesystem, handing plain data to the client
 * list: the same contract `/stack` and `/agents` have, with a different source.
 */
export default function WritingPage() {
  const page = getArticlesPage()

  return (
    <CollectionShell nav={navFor(page)} label="Writing years">
      <ArticleList page={page} />
    </CollectionShell>
  )
}
