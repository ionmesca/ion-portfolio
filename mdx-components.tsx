import type { MDXComponents } from "mdx/types"
import Link from "next/link"

import { Footnote, Photo, PhotoRow } from "@/components/letter/prose"
import { headingSlug } from "@/lib/article-slug"

/**
 * The MDX element map — how an article's markdown becomes the letter's prose.
 *
 * THE ARTICLE TEMPLATE INHERITS THE LETTER (POR-27: "Article pages inherit this
 * template with back button reading Articles"). Every step below is the one
 * `components/letter/prose.tsx` already ratified off Figma "Letter — light"
 * (13:2941), restated here as an element map because MDX hands us tag names
 * instead of a typed block union:
 *
 *   h1   text-2xl   — never used in a body; the title block owns it
 *   h2   text-lg    — the section heading, and the wheel's row
 *   h3   text-subhead
 *   p    text-base  — Prose, 16 / 170
 *   li   text-base
 *   hr / small print → the Caption step, muted
 *
 * Nothing here invents a size. If a step is missing from this map it is missing
 * from the contract, and the answer is a ruling, not an arbitrary value.
 *
 * ── WHY h2 CARRIES AN id ───────────────────────────────────────────────────
 *
 * The rail's wheel lists the article's own h2s, so the row's `href="#…"` and
 * the heading's `id` have to be the same string. Both sides call
 * `headingSlug()` in `lib/articles.ts` — the rail off the raw MDX source, the
 * heading off its rendered children. One function, so they cannot drift.
 * `scroll-mt-24` restates the 96px clearance `globals.css` gives every `[id]`,
 * for the same reason `prose.tsx`'s `Section` does.
 *
 * `Photo` / `PhotoRow` / `Footnote` are in the map so an article can write
 * `<Photo caption="…" />` with no import — the media slots are the letter's
 * muted rects until real art lands.
 */

/** Flatten whatever MDX put inside a heading down to its text. */
function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ""
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-2xl text-foreground">{children}</h1>
    ),

    h2: ({ children }) => (
      <h2
        id={headingSlug(textOf(children))}
        className="scroll-mt-24 text-lg text-foreground"
      >
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-subhead scroll-mt-24 text-foreground">{children}</h3>
    ),

    p: ({ children }) => <p className="text-base text-foreground">{children}</p>,

    strong: ({ children }) => (
      <strong className="font-medium">{children}</strong>
    ),

    em: ({ children }) => <em className="italic">{children}</em>,

    /* `list-outside` with the marker hung in the left padding: a 640 column
       reads worse when the text block is indented away from the paragraphs
       above it, and the letter has no indented prose anywhere. */
    ul: ({ children }) => (
      <ul className="flex list-disc flex-col gap-2 pl-5 text-base text-foreground marker:text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-base text-foreground marker:text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="text-base">{children}</li>,

    /* A quote is the Caption-weight aside the frame draws beside prose: a 1px
       rule on the left (the base `* { border-color }` rule paints it) and the
       muted foreground. No italic — the letter's only italic is the signature. */
    blockquote: ({ children }) => (
      <blockquote className="flex flex-col gap-2 border-l pl-4 text-base text-muted-foreground">
        {children}
      </blockquote>
    ),

    hr: () => <hr className="border-t" />,

    /* Internal links use `next/link` so an in-article cross-reference
       prefetches like the rest of the site; anything with a scheme is external
       and opens in a new tab. Underline is the site's link signature — see
       components/ui/text-link.tsx. */
    a: ({ href, children }) => {
      const target = String(href ?? "")
      const external = /^[a-z]+:/i.test(target)
      if (external) {
        return (
          <a
            href={target}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-muted-foreground"
          >
            {children}
          </a>
        )
      }
      return (
        <Link
          href={target}
          className="underline underline-offset-2 hover:text-muted-foreground"
        >
          {children}
        </Link>
      )
    },

    /* Inline code only. A fenced block would land here too, unhighlighted —
       acceptable, and flagged: syntax highlighting is a later ticket. */
    code: ({ children }) => (
      <code className="rounded-sm bg-muted px-1 py-0.5 text-sm">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-sm">
        {children}
      </pre>
    ),

    Photo,
    PhotoRow,
    Footnote,

    ...components,
  }
}
