import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Footnote, TitleBlock } from "@/components/letter/prose"
import { RailShell } from "@/components/nav/rail-shell"
import { getArticle, getArticles } from "@/lib/articles"

/**
 * /articles/[slug] — the article detail page.
 *
 * IT IS THE LETTER, WITH ONE WORD CHANGED. POR-27 ratified a single template
 * for both ("Article pages inherit this template with back button reading
 * Articles"), so this page reuses the letter's chassis rather than describing
 * it again:
 *
 *   RailShell        the 272/640/272 grid, the fluid gutters, the breakpoints
 *   SectionRail      the back button and the section wheel — through RailShell
 *   TitleBlock       Title 24 over a Caption line, from letter/prose.tsx
 *   Footnote         the 1px rule plus a Caption note, from letter/prose.tsx
 *   mdx-components   every prose step, mapped onto markdown's tag names
 *
 * WHAT IS NEW, and only this:
 *
 *   back             "← Articles", not "← Home". The frames only ever drew
 *                    "Home"; POR-27's rule is that the label names the
 *                    DESTINATION, and an article's destination is its index.
 *   wheel rows       the article's OWN h2s, read off the `.mdx` at build time
 *                    (lib/articles.ts) instead of a hand-written nav list.
 *                    A heading is a wheel row by existing.
 *   the caption      "Mar 2026 · 6 min read". The letter's Caption line is a
 *                    date alone; an article earns the reading time, which is
 *                    counted off the body rather than authored.
 *   BODY_FLOW        the letter's vertical rhythm, restated as CSS. See below.
 *
 * FULLY STATIC. `generateStaticParams` enumerates the files and
 * `dynamicParams = false` closes the route to anything else, so every article
 * is prerendered HTML and an unknown slug is a build-time-known 404 rather
 * than a server render.
 */

/* ── The letter's rhythm, on a flat markdown stream ────────────────────────
   `letter/prose.tsx` gets its spacing from nested flex containers, because
   `content/letter.ts` hands it a typed tree of sections and blocks. MDX hands
   us a FLAT list of siblings instead, so the same three numbers are expressed
   as sibling margins:

     48   above a heading      the letter's `gap-12` between sections
     16   heading → body       the letter's `gap-4` inside a section
     24   between blocks       the letter's `gap-6` between paragraphs

   Sibling selectors rather than `gap`, because `gap` cannot say "except after
   a heading". The first child never takes a margin, so the title block above
   keeps its own 48. */
const BODY_FLOW = [
  "flex flex-col",
  "[&>*+*]:mt-6",
  "[&>h2]:mt-12",
  "[&>h2+*]:mt-4",
  "[&>h3]:mt-6",
  "[&>h3+*]:mt-4",
].join(" ")

/** The disclaimer under every article, until Ion writes real ones.
 *
 *  It lives here, not in the `.mdx`, for two reasons: it is a statement about
 *  the SITE's state rather than about any article, and `Footnote` takes a
 *  string — putting it in MDX would wrap markdown's `<p>` inside the
 *  footnote's own `<p>`, which is invalid HTML. When a real article wants its
 *  own footnote this becomes a frontmatter field. Flagged. */
const PLACEHOLDER_FOOTNOTE =
  "Placeholder article — filler text standing in for writing that does not exist yet."

export const dynamicParams = false

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  /* `metadataBase` is ionmesca.com in app/layout.tsx (confirmed by Ion,
     2026-08-18), so the relative canonical below resolves against it. */
  return {
    title: `${article.title} — Ion Mesca`,
    description: article.summary,
    alternates: { canonical: article.href },
    openGraph: {
      type: "article",
      url: article.href,
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      images: ["/opengraph-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  /* The body, compiled by @next/mdx at build time. The path's static prefix is
     what lets the bundler enumerate `content/articles/*.mdx` and include them
     all; `generateStaticParams` above guarantees the slug is one of them, and
     `dynamicParams = false` guarantees nothing else ever reaches this line. */
  const { default: Body } = await import(`../../../content/articles/${slug}.mdx`)

  return (
    <RailShell
      nav={article.sections}
      label="Article sections"
      back={{ href: "/articles", label: "Articles" }}
      gutter="prose"
    >
      <article className="flex min-w-0 flex-col gap-12">
        <TitleBlock
          title={article.title}
          date={`${article.displayDate} · ${article.readTime}`}
        />

        <div className={BODY_FLOW}>
          <Body />
        </div>

        <Footnote>{PLACEHOLDER_FOOTNOTE}</Footnote>
      </article>
    </RailShell>
  )
}
