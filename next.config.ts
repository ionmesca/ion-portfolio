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
 *   remote MDX       never. The content is in the repo.
 *
 * `remark-frontmatter` teaches the parser that a leading `---` block is
 * METADATA, so the YAML is removed from the rendered tree instead of being
 * drawn as a paragraph of dashes. It does not EXPORT the frontmatter —
 * `lib/articles.ts` reads that off disk with `gray-matter`, because
 * `generateStaticParams` and `generateMetadata` need the fields without
 * compiling a React component first.
 *
 * EVERY PLUGIN IS NAMED AS A STRING, not imported and passed as a function.
 * Turbopack has to serialise the loader's options to hand them to a worker, and
 * a function cannot cross that boundary. It is also why the theme below is a
 * plain data object: JSON in, JSON out.
 */

/* ────────────────────────────────────────────────────────────────────────────
   THE STONE CODE THEME (POR-35)

   Shiki highlights at BUILD time and this theme is what it paints with. Every
   colour is a `var(--code-…)`, so the compiled HTML carries no literal colour
   at all — the tokens in `app/globals.css` decide what the words look like, and
   a light/dark flip is the SAME markup re-reading different variables. There is
   no second copy of the block for dark mode, no theme class on the <pre>, and
   no client JavaScript anywhere in the feature.

   Shiki does not parse these strings; it writes them straight into
   `style="color:…"`, which is exactly why a variable works where a hex would
   have had to be duplicated per theme.

   ── THE SCOPE MAP ────────────────────────────────────────────────────────────

   TextMate grammars emit dozens of scopes. They collapse onto four hues plus
   two stone roles, and the collapse is the design: four is the number of
   distinctions a reader can hold, and the site's rule is that colour carries
   MEANING rather than decoration. Selectors match on dot-boundary prefixes, so
   each line below catches its whole family.

     --code-keyword    keyword.*        import export return if from
                       storage.*        const function type class, and `=>`
                       variable.language  this, super
     --code-string     string.*         "react", templates, regex bodies
                       constant.other.symbol
     --code-function   entity.name.function  declarations AND call sites
                       support.function      built-ins
                       variable.function
                       entity.name.tag       JSX components, HTML/CSS tags
     --code-constant   constant.*       numbers, true/false/null
                       support.type     the primitives: string, number
                       entity.name.type / entity.name.class   Row, Props
                       support.class
                       entity.other.attribute-name   JSX props, CSS classes
     --code-muted      comment.*, punctuation.definition.comment
     --code-foreground everything with no rule: punctuation, braces, plain
                       identifiers, and — by the override below — operators

   TWO SCOPES ARE CONTAINERS, and they are the reason this map is not just six
   lines. A token with no rule of its own inherits from the nearest ANCESTOR
   scope that has one, which is right almost everywhere and wrong in exactly two
   places. Both were caught by looking at the rendered block, not by reading the
   grammar:

     A REGEX IS ONE LITERAL.  Inside `/^\s*(--[a-z-]+):/` the grammar scopes the
     anchor as a keyword, the character classes as constants and the quantifiers
     as operators — so the four roles turned the busiest line in the sample into
     clay, plum and stone in the space of forty characters. It is a literal, and
     it now reads as one: the `string.regexp <child>` rules below out-rank the
     general ones by naming the parent, which is how a TextMate selector says
     "only in here".

     A TEMPLATE'S ${…} IS NOT A STRING.  The interpolation holds real code, but
     it sits inside `string.template`, so it inherited moss and a template
     literal came out as one long string with a blue function call stranded in
     the middle of it. `meta.template.expression` resets the hole back to the
     foreground, and the rules below re-colour what is actually in it. This is
     the ONE `meta.*` rule in the theme, and it is here to UNDO a colour rather
     than to add one.

   TWO DELIBERATE ABSENCES.

   `keyword.operator` is pushed BACK to the foreground. It is inside the
   `keyword` family, so it would inherit clay and paint every `=`, `!` and type
   annotation `:` in the file. Operators are punctuation with opinions; colouring
   them makes a quiet block look busy, and the specific selector out-ranks the
   general one.

   There is NO rule on any `meta.*` scope. Those cover whole REGIONS — a
   `meta.function` span is the entire declaration — so one rule there would
   flood the block. Every selector above names a leaf.

   Verified against the real grammar rather than guessed: the TSX sample in
   `content/articles/shipping-a-design-system-solo.mdx` was tokenised with
   `includeExplanation` and the scopes it actually produces are the ones listed.
   ──────────────────────────────────────────────────────────────────────────── */
const STONE_CODE_THEME = {
  name: "stone",
  type: "light",
  colors: {
    "editor.foreground": "var(--code-foreground)",
    "editor.background": "var(--code-background)",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--code-muted)" },
    },
    {
      scope: ["keyword", "storage", "variable.language"],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      /* Out-ranks `keyword` above — see "TWO DELIBERATE ABSENCES". */
      scope: ["keyword.operator"],
      settings: { foreground: "var(--code-foreground)" },
    },
    {
      scope: ["string", "constant.other.symbol"],
      settings: { foreground: "var(--code-string)" },
    },
    {
      /* The ${…} hole in a template literal is code again. See "CONTAINERS". */
      scope: ["meta.template.expression"],
      settings: { foreground: "var(--code-foreground)" },
    },
    {
      /* A regex is one literal, anchors and quantifiers included. Naming the
         parent is what lets these out-rank `keyword` and `keyword.operator`. */
      scope: [
        "string.regexp",
        "string.regexp keyword",
        "string.regexp keyword.operator",
        "string.regexp constant",
        "string.regexp punctuation",
        "string.regexp variable",
      ],
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "variable.function",
        "entity.name.tag",
      ],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: [
        "constant",
        "support.type",
        "support.class",
        "entity.name.type",
        "entity.name.class",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "var(--code-constant)" },
    },
  ],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
    rehypePlugins: [
      [
        "@shikijs/rehype",
        {
          theme: STONE_CODE_THEME,
          /* Named one by one rather than taking Shiki's full bundle. The full
             set is ~200 grammars loaded on every build for the handful this
             site will ever use; adding a language here is a one-line change the
             day an article needs it. */
          langs: ["tsx", "ts", "jsx", "js", "json", "css", "html", "bash"],
          /* A fence with no language, or one nobody loaded, still gets the
             block's chrome — it just is not coloured. It must never fail the
             BUILD: an unknown language in an article is a typo, not an outage. */
          defaultLanguage: "text",
          fallbackLanguage: "text",
          /* Inline code stays stone. `\`useMemo\`` in a sentence is a NAME, not
             a program, and the rule for this site is that colour lives inside
             blocks only. */
          inline: false,
        },
      ],
    ],
  },
})

const nextConfig: NextConfig = {
  /* config options here */
}

export default withMDX(nextConfig)
