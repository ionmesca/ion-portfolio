import type { Metadata } from "next"

import { ArticleList } from "@/components/collections/collection-list"
import { CollectionShell } from "@/components/collections/collection-shell"
import { articlesPage, navFor } from "@/content/collections"

export const metadata: Metadata = {
  title: "Articles — Ion Mesca",
  description: "Notes from building things that ship.",
}

/**
 * /articles — flavour 3 of the collection pattern.
 *
 * Figma "Articles — desktop light" 20:1363. The iconless row (title + date),
 * an excerpt-card preview, and a wheel of years instead of categories.
 *
 * The rows link nowhere yet: the article detail template and the MDX pipeline
 * are a later phase.
 */
export default function ArticlesPage() {
  return (
    <CollectionShell nav={navFor(articlesPage)} label="Article years">
      <ArticleList page={articlesPage} />
    </CollectionShell>
  )
}
