import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import type { ArticleEntry, CollectionPage } from "@/content/collections"
import { headingSlug } from "@/lib/article-slug"

export { headingSlug }

/**
 * Articles — the file-based content index.
 *
 * SERVER ONLY. Everything here touches `node:fs` at module scope, and it is
 * only ever called from Server Components (`generateStaticParams`,
 * `generateMetadata`, and the two page bodies). The route is fully prerendered,
 * so this runs at BUILD time and never in a request.
 *
 * ── The shape of an article ────────────────────────────────────────────────
 *
 * One file, `content/articles/<slug>.mdx`. The filename IS the slug — there is
 * no `slug:` field to get out of step with it. The frontmatter is three fields,
 * exactly as ruled:
 *
 *   title     the h1 of the detail page and the row on /writing
 *   date      "YYYY-MM-DD", QUOTED. Unquoted, YAML parses it into a JS Date in
 *             the build machine's timezone, which can move a 1st-of-the-month
 *             article into the previous month. A string cannot do that.
 *   summary   one sentence. It is the row's hover excerpt, the page's
 *             `<meta name="description">` and the OG description.
 *
 * Read time is NOT a field. It is counted off the body at 200 words per minute,
 * because a hand-maintained "6 min read" is wrong the moment anyone edits a
 * paragraph.
 *
 * ── Why gray-matter AND the MDX loader ─────────────────────────────────────
 *
 * `@next/mdx` compiles the body into a React component, which cannot be asked
 * what its title is without rendering it — too late for `generateStaticParams`
 * and `generateMetadata`. So the metadata is read off disk as text here, and
 * the body is imported as a component in the page. `remark-frontmatter`
 * (next.config.ts) is what stops the YAML block being rendered as prose.
 */

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles")

export type Article = {
  /** The filename without `.mdx`, and the URL segment. */
  slug: string
  /** `/writing/<slug>` — every consumer takes it from here. */
  href: string
  title: string
  /** "2026-03-12". Sorts lexicographically, which is why it is a string. */
  date: string
  /** "Mar 12" — the collection row's far-right caption. Year lives on the wheel. */
  displayDate: string
  /** "2026" — the group id and the wheel's row label on /writing. */
  year: string
  summary: string
  /** "6 min read", counted off the body. */
  readTime: string
  /** The article's own h2s, in document order — the rail's wheel. */
  sections: { id: string; nav: string }[]
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/** "2026-03-12" → "Mar 12". No Date object: see the `date` note above. */
function displayDate(date: string): string {
  const [, month, day] = date.split("-")
  const label = MONTHS[Number(month) - 1]
  const n = Number(day)
  return label && n ? `${label} ${n}` : date
}

/**
 * The wheel's rows: every `## ` heading, in order.
 *
 * A line-anchored regex over the raw source rather than a parse of the compiled
 * tree. It is exact for the headings this template allows (plain text, no
 * inline JSX in an h2) and it costs nothing at build time. A heading whose text
 * is not plain — `## The <Thing /> problem` — would slug differently here than
 * in `mdx-components.tsx`, so the template does not allow one; flagged.
 *
 * ``` fences are skipped, or a shell comment inside a code block would grow a
 * phantom row on the wheel.
 */
function readSections(source: string) {
  const out: { id: string; nav: string }[] = []
  let inFence = false
  for (const line of source.split("\n")) {
    if (line.startsWith("```")) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^##\s+(.+?)\s*$/.exec(line)
    if (match) out.push({ id: headingSlug(match[1]), nav: match[1] })
  }
  return out
}

/** 200 wpm, rounded up, floor of 1. The number people expect from a blog. */
function readTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

function parse(file: string): Article {
  const slug = file.replace(/\.mdx$/, "")
  const raw = readFileSync(path.join(ARTICLES_DIR, file), "utf8")
  const { data, content } = matter(raw)

  const title = String(data.title ?? "")
  const date = String(data.date ?? "")
  const summary = String(data.summary ?? "")

  /* Loud, at build time, rather than a blank row in production. A missing
     field here is a typo in a file nobody rendered yet. */
  if (!title || !date || !summary) {
    throw new Error(
      `content/articles/${file}: frontmatter needs title, date and summary`
    )
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `content/articles/${file}: date must be a quoted "YYYY-MM-DD" string, got ${JSON.stringify(data.date)}`
    )
  }

  return {
    slug,
    href: `/writing/${slug}`,
    title,
    date,
    displayDate: displayDate(date),
    year: date.slice(0, 4),
    summary,
    readTime: readTime(content),
    sections: readSections(content),
  }
}

/** Every article, newest first. */
export function getArticles(): Article[] {
  return readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(parse)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug)
}

/**
 * /writing, built from the files.
 *
 * THE INDEX IS DERIVED, NOT AUTHORED (Ion, 2026-08-18: no dead rows). It used
 * to be a hand-written list in `content/collections.ts` whose rows pointed at
 * `href="#"`, because there was nothing to point at. Now every row is an
 * article that exists, and a row can only appear by a file appearing.
 *
 * The year groups come out of the dates, so the wheel's rows are a fact about
 * the content rather than a second list to maintain.
 */
export function getArticlesPage(): CollectionPage<ArticleEntry> {
  const articles = getArticles()
  const years: string[] = []
  for (const article of articles) {
    if (!years.includes(article.year)) years.push(article.year)
  }

  return {
    title: "Writing",
    intro: "Things I learned by shipping them.",
    footnote: "These three are layout tests. The essays are not written yet.",
    groups: years.map((year) => ({
      id: year,
      label: year,
      items: articles
        .filter((article) => article.year === year)
        .map(
          (article): ArticleEntry => ({
            id: article.slug,
            title: article.title,
            date: article.displayDate,
            href: article.href,
            preview: {
              kind: "excerpt",
              excerpt: article.summary,
              readTime: article.readTime,
            },
          })
        ),
    })),
  }
}
