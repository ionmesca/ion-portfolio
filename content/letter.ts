/**
 * The letter — content.
 *
 * PLACEHOLDER CONTENT. Every word below is copied verbatim from the Figma frame
 * "Letter — light" (node 13:2941), including the filler photo captions and the
 * signature placeholder. None of it is final copy; do not "improve" it here.
 * When Ion writes the real letter, this file is what it replaces.
 *
 * Why a typed TS module and not MDX: the repo has no MDX compiler wired
 * (`next.config.ts` is bare, no `@next/mdx`, no `@mdx-js/*` in package.json),
 * and the `content/work/*.mdx` files are read as raw front-matter by
 * `gray-matter`, not compiled. The articles phase builds the real pipeline; the
 * letter does not need one. The shape here is deliberately dumb data — spans
 * and blocks, no JSX — so the swap to MDX later is a renderer change, not a
 * content rewrite. It also keeps the section list serialisable, which is what
 * lets the server page hand the wheel its labels without pulling the whole
 * letter into the client bundle.
 */

/** One run of inline text. Mirrors the Figma text ranges 1:1. */
export type LetterSpan = {
  text: string
  /** Figma "Medium" (500) run inside a Regular paragraph. */
  strong?: boolean
  /** Figma UNDERLINE run. Emphasis, not a link — see the note in prose.tsx. */
  underline?: boolean
}

export type LetterBlock =
  | { type: "paragraph"; spans: LetterSpan[] }
  /** The two-up media row. Art lands post-build; these are muted rects for now. */
  | { type: "photos"; photos: { caption: string }[] }

export type LetterSection = {
  /** Anchor id. Also the scroll-spy target and the wheel row's href. */
  id: string
  /** The wheel row's label. */
  nav: string
  /** The rendered <h2>. The opening section has none in the frame. */
  heading?: string
  /** Gap between the blocks of this section, in Figma pixels. */
  blockGap: 8 | 24
  blocks: LetterBlock[]
}

export const letterMeta = {
  title: "A letter",
  date: "August 2026",
  footnote:
    "¹ Uncertainty you hide becomes a support ticket. Uncertainty you show becomes trust.",
  /** The signature block is explicitly a placeholder in the frame. */
  signature: "Ion",
} as const

export const letterSections: LetterSection[] = [
  {
    id: "hello",
    nav: "Hello",
    blockGap: 24,
    blocks: [
      {
        type: "paragraph",
        spans: [
          { text: "I am Ion, a " },
          { text: "designer and developer", strong: true },
          { text: " based in Barcelona. I work at " },
          { text: "Ledgy", underline: true },
          {
            text: ", where I build the tools people use to understand who owns what in a company.",
          },
        ],
      },
      {
        type: "paragraph",
        spans: [
          { text: "I live with my family and " },
          { text: "a dog who attends every design review", strong: true },
          {
            text: ". Most weeks are some mix of Figma, a code editor, and a long walk to sort out whatever is stuck.",
          },
        ],
      },
    ],
  },
  {
    id: "history",
    nav: "History",
    heading: "History",
    blockGap: 24,
    blocks: [
      {
        type: "paragraph",
        spans: [
          { text: "I got into this the way a lot of people did: " },
          { text: "a slow family computer", strong: true },
          {
            text: " and too much time on it. I wanted to change how something looked, found out that you could, and never really stopped. The first thing I built was ",
          },
          { text: "ugly and it worked", strong: true },
          { text: ", which is still roughly my order of priorities." },
        ],
      },
      {
        type: "paragraph",
        spans: [
          {
            text: "That turned into design school, then into product work, and eventually into ",
          },
          { text: "Ledgy", underline: true },
          {
            text: ". The questions got harder there, and more interesting. Equity is a subject people are quietly afraid of, so the interface has to do ",
          },
          {
            text: "a lot of reassuring before it does anything clever",
            strong: true,
          },
          { text: "." },
        ],
      },
      {
        type: "photos",
        photos: [{ caption: "The first computer" }, { caption: "The dog, supervising" }],
      },
    ],
  },
  {
    id: "what-i-believe",
    nav: "What I believe",
    heading: "What I believe",
    blockGap: 24,
    blocks: [
      {
        type: "paragraph",
        spans: [
          { text: "I believe the interesting part of an AI-native product " },
          { text: "is not the model", strong: true },
          {
            text: ". It is the interface around it: what a person is allowed to see, what they can undo, and how honestly you show them the machine’s uncertainty¹. A good agent feels less like a magic box and more like a colleague who ",
          },
          { text: "shows their work", strong: true },
          { text: "." },
        ],
      },
    ],
  },
  {
    id: "fun-facts",
    nav: "Fun facts",
    heading: "Fun facts",
    blockGap: 8,
    blocks: [
      {
        type: "paragraph",
        spans: [
          { text: "Coffee", strong: true },
          {
            text: " — two a day, both before noon, and I have opinions about the second one.",
          },
        ],
      },
      {
        type: "paragraph",
        spans: [
          { text: "Keyboard", strong: true },
          { text: " — quiet switches, no lights, nothing that blinks while I think." },
        ],
      },
      {
        type: "paragraph",
        spans: [
          { text: "Reading", strong: true },
          { text: " — mostly non-fiction, mostly unfinished, mostly by the bed." },
        ],
      },
    ],
  },
]

/** What the section wheel needs — id + label, nothing else crosses to the client. */
export const letterNav = letterSections.map(({ id, nav }) => ({ id, nav }))
