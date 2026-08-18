import type { MetadataRoute } from "next"

import { getArticles } from "@/lib/articles"

import { SITE_URL } from "./layout"

/**
 * sitemap.xml.
 *
 * Static, like every route on this site: `getArticles()` reads `content/
 * articles/*.mdx` off disk at BUILD time (lib/articles.ts is server-only and
 * says so), so this file is evaluated once during `next build` and served as a
 * flat XML document. Nothing here runs in a request.
 *
 * THE ARTICLE ROWS ARE DERIVED, not listed. A new `.mdx` file appears in the
 * sitemap the moment it appears on /articles, for the same reason and through
 * the same function — there is no second list to forget to update.
 *
 * `lastModified` IS ONLY SET WHERE IT IS KNOWN. An article carries a real
 * `date` in its frontmatter, so it gets one. The static pages do not have a
 * meaningful modification date in the repo, and stamping them with
 * `new Date()` would tell crawlers that every page changed on every deploy —
 * which is both untrue and the sort of noise that gets a small site's sitemap
 * discounted. The field is optional; an absent one is honest.
 *
 * `/dev` IS DELIBERATELY ABSENT. It is the specimen route, unlinked and marked
 * `noindex` in its own metadata, and it is deleted before cutover.
 * `app/robots.ts` disallows it as well.
 */

/** Every route that is not derived from content. */
const STATIC_ROUTES = ["/", "/letter", "/articles", "/agents", "/stack"]

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = STATIC_ROUTES.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
  }))

  const articles = getArticles().map((article) => ({
    url: new URL(article.href, SITE_URL).toString(),
    lastModified: article.date,
  }))

  return [...statics, ...articles]
}
