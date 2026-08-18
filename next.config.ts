import createMDX from "@next/mdx"
import type { NextConfig } from "next"

/**
 * MDX — the article pipeline.
 *
 * DELIBERATELY BORING. `@next/mdx` is the first-party plugin: it registers one
 * loader rule (Turbopack and webpack both) so `import Body from "…/x.mdx"`
 * returns a React component compiled at BUILD time. Nothing is fetched, parsed
 * or compiled at request time, so `/articles/<slug>` prerenders to static HTML
 * like every other route on this site.
 *
 * WHAT IS NOT HERE, and why:
 *
 *   pageExtensions   NOT extended with "mdx". Articles are IMPORTED by
 *                    `app/articles/[slug]/page.tsx`, they are not routes
 *                    themselves. Adding "mdx" would let a stray file in `app/`
 *                    silently become a page, and buys nothing.
 *   syntax highlight NOT wired. No placeholder article has a code block yet,
 *                    and a highlighter (rehype-pretty-code / Shiki) drags in a
 *                    theme that has to be reconciled with the token contract —
 *                    a design decision, not a plumbing one. Flagged for later.
 *   remote MDX       never. The content is in the repo.
 *
 * `remark-frontmatter` is the one plugin, and it earns its place: it teaches
 * the parser that a leading `---` block is METADATA, so the YAML is removed
 * from the rendered tree instead of being drawn as a paragraph of dashes. It
 * does not EXPORT the frontmatter — `lib/articles.ts` reads that off disk with
 * `gray-matter`, because `generateStaticParams` and `generateMetadata` need the
 * fields without compiling a React component first.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
    rehypePlugins: [],
  },
})

const nextConfig: NextConfig = {
  /* config options here */
}

export default withMDX(nextConfig)
