/**
 * The three collection pages — content.
 *
 * PLACEHOLDER CONTENT. Every name, one-liner, credit, chip name, article title
 * and date below is copied VERBATIM from the Figma frames on page "Collection
 * pages" (20:1032):
 *
 *   Stack             20:1033
 *   Agents & skills   20:1293
 *   Articles          20:1363
 *
 * Do not "improve" the copy here — Ion curates the real lists post-build, and
 * the footer caption on every page says so out loud.
 *
 * WHAT THE FRAMES DO NOT GIVE, and is therefore authored placeholder (flagged
 * in the report, not silently decided):
 *
 *   · Preview bodies for every row but one per page. Each frame draws exactly
 *     one open popover — Next.js (Stack), design-critique (Agents & skills),
 *     "Sound in interfaces, quietly" (Articles). Those three are verbatim; the
 *     rest are written in the same register so the pattern can be judged with
 *     the pointer, which is the whole point of the preview.
 *   · Outbound links. The frames have no hrefs. Real destinations are used
 *     where a tool has an obvious one (nextjs.org, linear.app …) so the rows
 *     are not decorative, and each row's `domain` is that host — the frame's
 *     one domain caption, "nextjs.org", agrees with this rule.
 *   · Read times. Only "4 min read" is drawn.
 *
 * Shape: dumb serialisable data, like content/letter.ts. The pages are Server
 * Components that hand this straight to the client list, so nothing here may
 * hold a function or a React node.
 */

/* ----------------------------------------------------------------------------
   Types
   ------------------------------------------------------------------------- */

/**
 * What the hover preview shows. One card family, three faces — the ratified
 * flavours in docs/design/collection-lab.html's rulebook.
 */
export type CollectionPreview =
  /** Stack: browser chrome + wireframe site mock + domain caption. */
  | { kind: "site"; domain: string }
  /** Agents & skills: chrome + README mock + "How I use it" + domain. */
  | { kind: "repo"; domain: string; usage: [string, string] }
  /** Articles: no chrome, no mock — title, excerpt, reading time. */
  | { kind: "excerpt"; excerpt: string; readTime: string }

/** A row on Stack or Agents & skills. */
export type CollectionEntry = {
  id: string
  name: string
  oneLiner: string
  /** "by <author>" — the Agents & skills credit line. */
  credit?: string
  /**
   * The skill's name inside `npx skills add ionmesca/<install>`. Present ONLY
   * on Ion's own skills, and it replaces the ↗: the chip is then the row's one
   * click target, and it copies rather than navigates.
   */
  install?: string
  /** External destination. Absent on install-chip rows, which never navigate. */
  href?: string
  preview: CollectionPreview
}

/** A row on Articles — no icon, no one-liner, no ↗. */
export type ArticleEntry = {
  id: string
  title: string
  /** "Mar 2026" — the far-right caption, in the palette's shortcut position. */
  date: string
  preview: Extract<CollectionPreview, { kind: "excerpt" }>
}

export type CollectionGroup<T> = {
  /** Anchor id, wheel target and scroll-spy target. */
  id: string
  /** Group header AND wheel label — the frames use one word for both. */
  label: string
  /** The one quiet link a group header may carry (Agents & skills → "Mine"). */
  link?: { label: string; href: string }
  items: T[]
}

export type CollectionPage<T> = {
  title: string
  intro: string
  footnote: string
  groups: CollectionGroup<T>[]
}

/** The wheel's rows, derived so the rail can never drift from the content. */
export function navFor<T>(page: CollectionPage<T>) {
  return page.groups.map((group) => ({ id: group.id, nav: group.label }))
}

/* ----------------------------------------------------------------------------
   Shared strings
   ------------------------------------------------------------------------- */

const FOOTNOTE = "Placeholder content — Ion curates the real list post-build."

/* ----------------------------------------------------------------------------
   /stack — Figma 20:1033
   ------------------------------------------------------------------------- */

export const stackPage: CollectionPage<CollectionEntry> = {
  title: "Stack",
  intro: "Tools that survive contact with real work.",
  footnote: FOOTNOTE,
  groups: [
    {
      id: "design",
      label: "Design",
      items: [
        {
          id: "figma",
          name: "Figma",
          oneLiner: "where everything starts",
          href: "https://figma.com",
          preview: { kind: "site", domain: "figma.com" },
        },
        {
          id: "play",
          name: "Play",
          oneLiner: "motion sketches before code",
          href: "https://createwithplay.com",
          preview: { kind: "site", domain: "createwithplay.com" },
        },
        {
          id: "shots",
          name: "Shots",
          oneLiner: "screenshots that survive a portfolio",
          href: "https://shots.so",
          preview: { kind: "site", domain: "shots.so" },
        },
      ],
    },
    {
      id: "development",
      label: "Development",
      items: [
        {
          id: "ghostty",
          name: "Ghostty",
          oneLiner: "terminal, quiet and fast",
          href: "https://ghostty.org",
          preview: { kind: "site", domain: "ghostty.org" },
        },
        {
          id: "nextjs",
          name: "Next.js",
          oneLiner: "the app router, all the way down",
          href: "https://nextjs.org",
          // The one preview the frame draws open (20:1173).
          preview: { kind: "site", domain: "nextjs.org" },
        },
        {
          id: "claude-code",
          name: "Claude Code",
          oneLiner: "the pair that reads the whole repo",
          href: "https://claude.com/claude-code",
          preview: { kind: "site", domain: "claude.com" },
        },
        {
          id: "cursor",
          name: "Cursor",
          oneLiner: "for the edits I want to watch",
          href: "https://cursor.com",
          preview: { kind: "site", domain: "cursor.com" },
        },
      ],
    },
    {
      id: "ai",
      label: "AI",
      items: [
        {
          id: "claude",
          name: "Claude",
          oneLiner: "thinking partner, most days",
          href: "https://claude.ai",
          preview: { kind: "site", domain: "claude.ai" },
        },
        {
          id: "raycast-ai",
          name: "Raycast AI",
          oneLiner: "answers without opening a tab",
          href: "https://raycast.com/ai",
          preview: { kind: "site", domain: "raycast.com" },
        },
        {
          id: "v0",
          name: "v0",
          oneLiner: "first drafts of a layout",
          href: "https://v0.app",
          preview: { kind: "site", domain: "v0.app" },
        },
      ],
    },
    {
      id: "everyday",
      label: "Everyday",
      items: [
        {
          id: "arc",
          name: "Arc",
          oneLiner: "browser as a workspace",
          href: "https://arc.net",
          preview: { kind: "site", domain: "arc.net" },
        },
        {
          id: "linear",
          name: "Linear",
          oneLiner: "the only tracker that stays quiet",
          href: "https://linear.app",
          preview: { kind: "site", domain: "linear.app" },
        },
        {
          id: "raycast",
          name: "Raycast",
          oneLiner: "launcher, clipboard, everything",
          href: "https://raycast.com",
          preview: { kind: "site", domain: "raycast.com" },
        },
        {
          id: "things",
          name: "Things",
          oneLiner: "the list outside my head",
          href: "https://culturedcode.com/things",
          preview: { kind: "site", domain: "culturedcode.com" },
        },
      ],
    },
  ],
}

/* ----------------------------------------------------------------------------
   /agents — Figma 20:1293
   ------------------------------------------------------------------------- */

export const agentsPage: CollectionPage<CollectionEntry> = {
  title: "Agents & skills",
  intro: "The agents and skills that do the work with me.",
  footnote: FOOTNOTE,
  groups: [
    {
      id: "skills-i-use",
      label: "Skills I use",
      items: [
        {
          id: "transitions-dev",
          name: "transitions.dev",
          oneLiner: "motion recipes that feel native",
          credit: "by Jakub Antalík",
          href: "https://transitions.dev",
          preview: {
            kind: "repo",
            domain: "transitions.dev",
            usage: [
              "Every hover, open and swap on this site starts here.",
              "It argues for the cheaper transition, which is usually right.",
            ],
          },
        },
        {
          id: "design-critique",
          name: "design-critique",
          oneLiner: "a second pair of eyes",
          credit: "by Anthropic",
          href: "https://github.com/anthropics/skills",
          // The one preview the frame draws open (20:1567) — verbatim.
          preview: {
            kind: "repo",
            domain: "github.com",
            usage: [
              "Runs on every screen before Ion sees it.",
              "Its verdicts land as tickets, not vibes.",
            ],
          },
        },
        {
          id: "wayfinder",
          name: "wayfinder",
          oneLiner: "charts the way before the work",
          credit: "by Matt Pocock",
          href: "https://github.com/mattpocock",
          preview: {
            kind: "repo",
            domain: "github.com",
            usage: [
              "Draws the map for anything longer than an afternoon.",
              "The map is a file, so the next session inherits it.",
            ],
          },
        },
        {
          id: "better-typography",
          name: "better-typography",
          oneLiner: "type that reads before it looks",
          credit: "by Anthropic",
          href: "https://github.com/anthropics/skills",
          preview: {
            kind: "repo",
            domain: "github.com",
            usage: [
              "Settles the measure, the leading and the wrap.",
              "It has opinions about widows. So do I.",
            ],
          },
        },
      ],
    },
    {
      id: "mine",
      label: "Mine",
      link: { label: "ionmesca/skills", href: "https://github.com/ionmesca" },
      items: [
        {
          id: "issue-triage",
          name: "issue-triage",
          oneLiner: "turns an inbox into a queue",
          install: "issue-triage",
          preview: {
            kind: "repo",
            domain: "github.com",
            usage: [
              "Reads the week's issues and ranks them once.",
              "What it cannot rank, it asks about.",
            ],
          },
        },
        {
          id: "design-tokens",
          name: "design-tokens",
          oneLiner: "keeps code and Figma honest",
          install: "design-tokens",
          preview: {
            kind: "repo",
            domain: "github.com",
            usage: [
              "Diffs the variables against the stylesheet.",
              "A drifted token is a failing check, not a note.",
            ],
          },
        },
        {
          id: "closeout",
          name: "closeout",
          oneLiner: "ends a session with nothing loose",
          install: "closeout",
          preview: {
            kind: "repo",
            domain: "github.com",
            usage: [
              "Commits, pushes and writes down what is left.",
              "Tomorrow starts from the note, not from memory.",
            ],
          },
        },
      ],
    },
  ],
}

/* ----------------------------------------------------------------------------
   /articles — Figma 20:1363
   ------------------------------------------------------------------------- */

export const articlesPage: CollectionPage<ArticleEntry> = {
  title: "Articles",
  intro: "Notes from building things that ship.",
  footnote: FOOTNOTE,
  groups: [
    {
      id: "2026",
      label: "2026",
      items: [
        {
          id: "the-wheel-is-the-nav",
          title: "The wheel is the nav",
          date: "Mar 2026",
          preview: {
            kind: "excerpt",
            excerpt:
              "A list of links tells you where you can go. A wheel tells you where you are, which is the question people actually have.",
            readTime: "6 min read",
          },
        },
        {
          id: "sound-in-interfaces-quietly",
          title: "Sound in interfaces, quietly",
          date: "Feb 2026",
          // The one preview the frame draws open (20:1584) — verbatim.
          preview: {
            kind: "excerpt",
            excerpt:
              "A tick is not a sound effect. It is the smallest confirmation that the machine noticed you — nothing more.",
            readTime: "4 min read",
          },
        },
        {
          id: "placeholder-is-a-feature",
          title: "Placeholder is a feature",
          date: "Jan 2026",
          preview: {
            kind: "excerpt",
            excerpt:
              "Real copy arrives last. Building the shape first, and saying out loud that it is a shape, is faster than pretending otherwise.",
            readTime: "5 min read",
          },
        },
      ],
    },
    {
      id: "2025",
      label: "2025",
      items: [
        {
          id: "shipping-a-design-system-solo",
          title: "Shipping a design system solo",
          date: "Nov 2025",
          preview: {
            kind: "excerpt",
            excerpt:
              "One person cannot govern a system. One person can make every decision twice — once in Figma, once in the stylesheet — and keep the two honest.",
            readTime: "8 min read",
          },
        },
        {
          id: "what-agents-actually-automate",
          title: "What agents actually automate",
          date: "Jun 2025",
          preview: {
            kind: "excerpt",
            excerpt:
              "Not the thinking. The fetching, the checking and the writing-down — which is most of the day, and none of the fun.",
            readTime: "7 min read",
          },
        },
      ],
    },
    {
      id: "2024",
      label: "2024",
      items: [
        {
          id: "notes-on-a-first-design-system",
          title: "Notes on a first design system",
          date: "Nov 2024",
          preview: {
            kind: "excerpt",
            excerpt:
              "It was mostly wrong, and that was fine. The parts that survived were the parts somebody had to use on a deadline.",
            readTime: "6 min read",
          },
        },
      ],
    },
  ],
}
