/**
 * The three collection pages — content.
 *
 * Stack copy (Ion, 2026-08-19):
 * Audience is the same as PRODUCT.md: recruiters, design and product leads,
 * founders, technical collaborators. They already know what Linear is.
 * Row one-liner: first person, a fact only Ion could write. If the name of
 * the tool can be swapped and the line still works, it is a tagline. Kill it.
 * Hover blurb: how it sits next to the other tools, two or three lines, no
 * product pitch.
 *
 * Shape: dumb serialisable data, like content/letter.ts. The pages are Server
 * Components that hand this straight to the client list, so nothing here may
 * hold a function or a React node. The `tool()` helper below runs at module
 * load and returns plain objects.
 */

/* ----------------------------------------------------------------------------
   Types
   ------------------------------------------------------------------------- */

/**
 * What the hover preview shows. One card family, two faces.
 *
 *   tool     Stack and Agents & skills: browser chrome, a real screenshot,
 *            a three-line blurb, domain. No "How I use it" heading.
 *   excerpt  Writing: title, clamped excerpt, reading time. No chrome.
 */
export type CollectionPreview =
  | { kind: "tool"; domain: string; blurb: string; image: string }
  | { kind: "excerpt"; excerpt: string; readTime: string }

/** A row on Stack or Agents & skills. */
export type CollectionEntry = {
  id: string
  name: string
  oneLiner: string
  /** 20×20 brand mark. Absent rows keep the muted stand-in. */
  mark?: string
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

/** A row on Writing — no icon, no one-liner. */
export type ArticleEntry = {
  id: string
  title: string
  /** "Mar 12" — the far-right caption. Year lives on the wheel. */
  date: string
  /**
   * `/writing/<slug>`. REQUIRED, and internal by construction — an article row
   * that cannot navigate is a dead row, and Ion ruled those out on 2026-08-18.
   * The list is built from the files in `content/articles/` by
   * `lib/articles.ts`, so a row exists only when the page it points at does.
   */
  href: string
  preview: Extract<CollectionPreview, { kind: "excerpt" }>
}

export type CollectionGroup<T> = {
  /** Anchor id, wheel target and scroll-spy target. */
  id: string
  /** Group header AND wheel label — the frames use one word for both. */
  label: string
  /**
   * Hide the visible group header while keeping the section id so the wheel
   * still jumps. Unused now that Writing shows its years like the other lists.
   */
  hideLabel?: boolean
  /** The one quiet link a group header may carry (Agents & skills → "Mine"). */
  link?: { label: string; href: string }
  items: T[]
}

export type CollectionPage<T> = {
  title: string
  intro: string
  /** Absent or empty: the column draws no footnote. */
  footnote?: string
  groups: CollectionGroup<T>[]
}

/** The wheel's rows, derived so the rail can never drift from the content. */
export function navFor<T>(page: CollectionPage<T>) {
  return page.groups.map((group) => ({ id: group.id, nav: group.label }))
}

/* ----------------------------------------------------------------------------
   Entry helper — returns plain data, runs at import time
   ------------------------------------------------------------------------- */

/** App-extracted or favicon PNGs. Everything else uses a Simple Icons SVG. */
const PNG_MARKS = new Set([
  "paper",
  "eagle",
  "docker",
  "dia",
  "1password",
  "loom",
  "superwhisper",
  "telegram",
  "raycast",
  "xcode",
  "dial-kit",
  "grok",
  "hermes",
  "openclaw",
  "paperclip",
  "shiori",
  "toolcraft",
  "ultramock",
  "transitions-dev",
])

function tool(entry: {
  id: string
  name: string
  oneLiner: string
  domain: string
  blurb: string
  href?: string
  mark?: string
  credit?: string
  install?: string
}): CollectionEntry {
  const mark =
    entry.mark ??
    (PNG_MARKS.has(entry.id)
      ? `/stack/marks/${entry.id}.png`
      : `/stack/marks/${entry.id}.svg`)
  return {
    id: entry.id,
    name: entry.name,
    oneLiner: entry.oneLiner,
    href: entry.href,
    credit: entry.credit,
    install: entry.install,
    mark,
    preview: {
      kind: "tool",
      domain: entry.domain,
      blurb: entry.blurb,
      image: `/stack/previews/${entry.id}.webp`,
    },
  }
}

const EXISTING = {
  figma: "/projects/tools/figma.svg",
  linear: "/projects/tools/linear.svg",
  slack: "/projects/tools/slack.svg",
  notion: "/projects/tools/notion.svg",
  github: "/projects/tools/github.svg",
  cursor: "/projects/tools/cursor.svg",
  vercel: "/projects/tools/vercel.svg",
  tailwind: "/projects/tools/tailwindcss.svg",
  nextjs: "/projects/tools/nextdotjs.svg",
  anthropic: "/projects/tools/anthropic.svg",
  openai: "/projects/tools/openai.svg",
  buna: "/projects/buna-mark.png",
} as const

/* ----------------------------------------------------------------------------
   /stack
   ------------------------------------------------------------------------- */

export const stackPage: CollectionPage<CollectionEntry> = {
  title: "Stack",
  intro: "What I still open after the job is done.",
  groups: [
    {
      id: "design",
      label: "Design",
      items: [
        tool({
          id: "figma",
          name: "Figma",
          oneLiner: "Where I still draw by hand",
          href: "https://figma.com",
          domain: "figma.com",
          mark: EXISTING.figma,
          blurb:
            "I still draw here. FigJam if a flow has to leave my machine. Plugins and shaders when I want something generated and I do not want to wait.",
        }),
        tool({
          id: "paper",
          name: "Paper",
          oneLiner: "I let agents try the UI first",
          href: "https://paper.design",
          domain: "paper.design",
          blurb:
            "I point an agent at a screen first. If the idea holds, it becomes a Figma file. If it does not, I just saved an evening.",
        }),
        tool({
          id: "dial-kit",
          name: "Dial Kit",
          oneLiner: "Josh's kit, for graphics not screens",
          href: "https://joshpuckett.me/dialkit",
          domain: "joshpuckett.me",
          blurb:
            "Graphics and lockups. The visual tools I used to fake in Figma. Josh built the kit. I keep adding to it.",
        }),
        tool({
          id: "toolcraft",
          name: "Toolcraft",
          oneLiner: "Branding tools I would not put in Figma",
          href: "https://toolcraft.sh",
          domain: "toolcraft.sh",
          blurb:
            "Closer to branding than Dial Kit. I build small tools here so the work lives in something I made.",
        }),
        tool({
          id: "ultramock",
          name: "Ultramock",
          oneLiner: "Mocks that have to look shipped",
          href: "https://www.ultramock.io",
          domain: "ultramock.io",
          blurb:
            "Product videos and stills. If it still looks like a mock, I did it wrong. Portfolio and client work both go through here.",
        }),
        tool({
          id: "eagle",
          name: "Eagle",
          oneLiner: "The library I actually browse",
          href: "https://eagle.cool",
          domain: "eagle.cool",
          blurb:
            "Stills and references I will need again in six months. I look here. I stopped digging through folders.",
        }),
      ],
    },
    {
      id: "development",
      label: "Development",
      items: [
        tool({
          id: "ghostty",
          name: "Ghostty",
          oneLiner: "The terminal I actually type in",
          href: "https://ghostty.org",
          domain: "ghostty.org",
          blurb:
            "It stays out of the way. Claude Code, Codex, the CLIs, they all run in here.",
        }),
        tool({
          id: "tailwind",
          name: "Tailwind CSS",
          oneLiner: "The CSS I already think in",
          href: "https://tailwindcss.com",
          domain: "tailwindcss.com",
          mark: EXISTING.tailwind,
          blurb:
            "Ledgy is on it. The personal work is on it. I know it well enough that I do not try the new thing.",
        }),
        tool({
          id: "nextjs",
          name: "Next.js",
          oneLiner: "How I ship personal sites now",
          href: "https://nextjs.org",
          domain: "nextjs.org",
          mark: EXISTING.nextjs,
          blurb:
            "App router, the whole way. I used to reach for Webflow for this kind of site. Personal work lives here now.",
        }),
        tool({
          id: "docker",
          name: "Docker",
          oneLiner: "Local servers that have to stay up",
          href: "https://www.docker.com",
          domain: "docker.com",
          blurb:
            "Paperclip, local APIs, anything that has to keep running while I work on something else. I host those here.",
        }),
        tool({
          id: "vercel",
          name: "Vercel",
          oneLiner: "Where the personal work goes live",
          href: "https://vercel.com",
          domain: "vercel.com",
          mark: EXISTING.vercel,
          blurb:
            "This site, and the other personal Next.js work. The CLI too. Ledgy's marketing site is still Webflow, on purpose.",
        }),
        tool({
          id: "webflow",
          name: "Webflow",
          oneLiner: "Still hosting Ledgy's marketing site",
          href: "https://webflow.com",
          domain: "webflow.com",
          blurb:
            "Ledgy's marketing site still lives here, so I still open it. New personal sites go to Next.js.",
        }),
        tool({
          id: "xcode",
          name: "Xcode",
          oneLiner: "When it has to be a real iPhone app",
          href: "https://developer.apple.com/xcode",
          domain: "developer.apple.com",
          blurb:
            "Buna has an iOS app. I open this when the work has to live on a phone.",
        }),
      ],
    },
    {
      id: "agents",
      label: "Agents",
      items: [
        tool({
          id: "claude-code",
          name: "Claude Code",
          oneLiner: "The pair that has the whole repo",
          href: "https://claude.com/claude-code",
          domain: "claude.com",
          mark: EXISTING.anthropic,
          blurb:
            "Tickets, implementation, design, digging. Anthropic models, the long jobs. Cursor is for edits I want to watch. This is everything else.",
        }),
        tool({
          id: "codex",
          name: "Codex",
          oneLiner: "When I need the idea as HTML, not a paragraph",
          href: "https://openai.com/codex",
          domain: "openai.com",
          mark: EXISTING.openai,
          blurb:
            "Different model. I grab it when I need to see the answer. Images, HTML, a first pass I can click.",
        }),
        tool({
          id: "cursor",
          name: "Cursor",
          oneLiner: "For the edits I want to watch land",
          href: "https://cursor.com",
          domain: "cursor.com",
          mark: EXISTING.cursor,
          blurb:
            "I stay in the file. Claude Code can take the long jobs. I open this when I want to watch the edit land.",
        }),
        tool({
          id: "hermes",
          name: "Hermes",
          oneLiner: "Bedtime stories, taxes, the house",
          href: "https://hermes-agent.io",
          domain: "hermes-agent.io",
          blurb:
            "Personal only. It can see the notes on this machine, so it writes stories for Sophie, does the admin, runs the house. Work stays out.",
        }),
        tool({
          id: "openclaw",
          name: "OpenClaw",
          oneLiner: "The other household agent",
          href: "https://openclaw.ai",
          domain: "openclaw.ai",
          blurb:
            "Same household jobs as Hermes, different agent. I run both. Neither of them sees the Ledgy board.",
        }),
        tool({
          id: "buzz",
          name: "Buzz",
          oneLiner: "People and agents on the same thread",
          href: "https://buzz.xyz",
          domain: "buzz.xyz",
          blurb:
            "Humans and agents in one thread. Slack is still where people talk. This is where both show up.",
        }),
        tool({
          id: "dia",
          name: "Dia",
          oneLiner: "I ask the page, not another tab",
          href: "https://www.diabrowser.com",
          domain: "diabrowser.com",
          blurb:
            "The browser. If the page is already open, I ask it here. I am done opening Claude to ask what a sentence means.",
        }),
        tool({
          id: "ollama",
          name: "Ollama",
          oneLiner: "Small models that never leave this machine",
          href: "https://ollama.com",
          domain: "ollama.com",
          blurb:
            "Small models, this machine only. I use it when the job is small and I do not want the text on someone else's server.",
        }),
        tool({
          id: "grok",
          name: "Grok",
          oneLiner: "Images, video, and the model Hermes runs",
          href: "https://grok.x.ai",
          domain: "grok.x.ai",
          blurb:
            "When I need a picture or a clip. Also the model under Hermes for the household work.",
        }),
      ],
    },
    {
      id: "work",
      label: "Work",
      items: [
        tool({
          id: "linear",
          name: "Linear",
          oneLiner: "The board I share at work",
          href: "https://linear.app",
          domain: "linear.app",
          mark: EXISTING.linear,
          blurb:
            "Ledgy tickets, the collaborative kind. Paperclip is mine and the agents'. I do not mix the two.",
        }),
        tool({
          id: "paperclip",
          name: "Paperclip",
          oneLiner: "My board, and the agents' board",
          href: "https://paperclip.ing",
          domain: "paperclip.ing",
          blurb:
            "Personal tickets, and the queue I let agents write into. Linear stays at Ledgy.",
        }),
        tool({
          id: "github",
          name: "GitHub",
          oneLiner: "Where the work becomes a PR",
          href: "https://github.com",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "Code and reviews. Not a tracker. A change is not done until it is a PR here.",
        }),
        tool({
          id: "slack",
          name: "Slack",
          oneLiner: "Work chat, plus the artifacts we actually look at",
          href: "https://slack.com",
          domain: "slack.com",
          mark: EXISTING.slack,
          blurb:
            "Ledgy lives here. I drop screens and snippets in when a ticket would be slower than showing the thing.",
        }),
        tool({
          id: "notion",
          name: "Notion",
          oneLiner: "The wiki I also teach agents to write",
          href: "https://notion.so",
          domain: "notion.so",
          mark: EXISTING.notion,
          blurb:
            "The wiki at work. I build Notion agents, and agents that build Notion agents, so product feedback does not die in someone's notes.",
        }),
        tool({
          id: "telegram",
          name: "Telegram",
          oneLiner: "Family, and the household agents",
          href: "https://telegram.org",
          domain: "telegram.org",
          blurb:
            "Not work. This is how I talk to people at home, and how Hermes and OpenClaw reach me.",
        }),
      ],
    },
    {
      id: "everyday",
      label: "Everyday",
      items: [
        tool({
          id: "raycast",
          name: "Raycast",
          oneLiner: "Launcher, clipboard, the super keys I actually use",
          href: "https://raycast.com",
          domain: "raycast.com",
          blurb:
            "The AI bits less so. I refuse to open a chat window to paste something.",
        }),
        tool({
          id: "shiori",
          name: "Shiori",
          oneLiner: "Every link I want to keep. Brian's app",
          href: "https://www.shiori.sh",
          domain: "shiori.sh",
          blurb:
            "Bookmarks I can find again. Brian made it. I have abandoned enough reading lists.",
        }),
        tool({
          id: "1password",
          name: "1Password",
          oneLiner: "Passwords, and a way in for the agents",
          href: "https://1password.com",
          domain: "1password.com",
          blurb:
            "Mine first. An agent can get in now without me pasting a key into a prompt. I turned that on.",
        }),
        tool({
          id: "loom",
          name: "Loom",
          oneLiner: "A video when writing the thing would take longer",
          href: "https://loom.com",
          domain: "loom.com",
          blurb:
            "I record when the other person was not in the room. Design feedback, a walkthrough, anything that dies in a paragraph.",
        }),
        tool({
          id: "superwhisper",
          name: "Superwhisper",
          oneLiner: "I talk, it types, the agent gets the rest",
          href: "https://superwhisper.com",
          domain: "superwhisper.com",
          blurb:
            "I talk. It types into Claude Code or Cursor. Faster than typing the brief.",
        }),
        tool({
          id: "buna",
          name: "Buna",
          oneLiner: "Meals for the house, planned with an agent",
          href: "https://github.com/ionmesca",
          domain: "github.com",
          mark: EXISTING.buna,
          blurb:
            "Mine. Recipes, shopping lists, dinner for more than one person. ChatGPT and the household agents keep context here. There is an iOS app.",
        }),
      ],
    },
  ],
}

/* ----------------------------------------------------------------------------
   /agents — Figma 20:1293 (skill list still the frame's; preview is the
   shared tool face)
   ------------------------------------------------------------------------- */

export const agentsPage: CollectionPage<CollectionEntry> = {
  title: "Agents & skills",
  intro: "What I installed, and what I wrote.",
  footnote: "Skills I use is still a sketch. The chips on Mine copy the install command.",
  groups: [
    {
      id: "skills-i-use",
      label: "Skills I use",
      items: [
        tool({
          id: "transitions-dev",
          name: "transitions.dev",
          oneLiner: "where this site's motion comes from",
          credit: "by Jakub Antalík",
          href: "https://transitions.dev",
          domain: "transitions.dev",
          blurb:
            "Every hover and open on this site starts here. It argues for the cheaper transition. It is usually right.",
        }),
        tool({
          id: "design-critique",
          name: "design-critique",
          oneLiner: "reviews the screen before I do",
          credit: "by Anthropic",
          href: "https://github.com/anthropics/skills",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "It reviews every screen before I do. Verdicts become tickets.",
        }),
        tool({
          id: "wayfinder",
          name: "wayfinder",
          oneLiner: "writes the map before I start",
          credit: "by Matt Pocock",
          href: "https://github.com/mattpocock",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "Anything longer than an afternoon gets a map first. The map is a file. Tomorrow's session reads it.",
        }),
        tool({
          id: "better-typography",
          name: "better-typography",
          oneLiner: "nags me about widows",
          credit: "by Anthropic",
          href: "https://github.com/anthropics/skills",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "Measure, leading, wrap. It has opinions about widows. So do I.",
        }),
      ],
    },
    {
      id: "mine",
      label: "Mine",
      link: { label: "ionmesca/skills", href: "https://github.com/ionmesca" },
      items: [
        tool({
          id: "issue-triage",
          name: "issue-triage",
          oneLiner: "ranks the week's issues once",
          install: "issue-triage",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "Reads the week's issues and ranks them once. What it cannot rank, it asks about.",
        }),
        tool({
          id: "design-tokens",
          name: "design-tokens",
          oneLiner: "fails the build when a token drifts",
          install: "design-tokens",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "Diffs the variables against the stylesheet. A drifted token fails the check.",
        }),
        tool({
          id: "closeout",
          name: "closeout",
          oneLiner: "commits, pushes, writes what is left",
          install: "closeout",
          domain: "github.com",
          mark: EXISTING.github,
          blurb:
            "Commits, pushes, writes down what is left. Tomorrow I read the note. I do not reconstruct the night.",
        }),
      ],
    },
  ],
}

/* ----------------------------------------------------------------------------
   /writing — Figma "Articles" 20:1363 (the frame keeps its old name; the
   route and the label are Writing since Ion's 2026-08-19 ruling)

   THE LIST IS NOT HERE ANY MORE. It used to be a hand-written array
   of nine titles copied off the frame, every one of them pointing at
   `href="#"`, because there were no article pages to point at. Ion, 2026-08-18:
   "the navigation is not really clear" — a row that does nothing is the worst
   case of that.

   The list is now DERIVED from `content/articles/*.mdx` by
   `lib/articles.ts` (`getArticlesPage()`): one file, one row, one page it
   navigates to, and the year groups fall out of the dates. A row cannot exist
   without its article, and an article cannot exist without appearing here.

   Three of the frame's titles survive as the placeholder articles, including
   "Sound in interfaces, quietly" — the one whose excerpt the frame draws open
   (20:1584), kept verbatim. The other six went with the dead rows; they come
   back as files when Ion writes them.
   ------------------------------------------------------------------------- */
