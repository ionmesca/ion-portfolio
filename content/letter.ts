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

/**
 * One photograph in the letter's deck.
 *
 * PLACEHOLDER ART. `public/placeholder/photo-0*.svg` are five hand-drawn stone
 * plates — no stock, no downloads — that exist so the deck can be judged before
 * Ion's real photographs arrive. Swapping in a real file is a change to `src`
 * and `alt` and nothing else.
 */
export type LetterPhoto = {
  src: string
  /** The photograph's own description, for anyone who cannot see it. */
  alt: string
  /** The line under the deck. */
  caption: string
}

export type LetterBlock =
  | { type: "paragraph"; spans: LetterSpan[] }
  /** The photo deck — `components/letter/cover-flow.tsx`. It replaced the
   *  frame's static two-up row on POR-31. */
  | { type: "photos"; photos: LetterPhoto[] }

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
      /**
       * The deck. The frame drew TWO photo slots; a cover flow wants four or
       * five to read as a deck at all, so three captions here are INVENTED
       * placeholder copy and the first two are Figma's own. Flagged in the
       * POR-31 report — when Ion writes the real letter, all five are his.
       */
      {
        type: "photos",
        photos: [
          {
            src: "/placeholder/photo-01.svg",
            alt: "A low sun over layered ridgelines, in flat grey light.",
            caption: "The first computer",
          },
          {
            src: "/placeholder/photo-02.svg",
            alt: "Two panels of window light thrown across a dark wall.",
            caption: "The dog, supervising",
          },
          {
            src: "/placeholder/photo-03.svg",
            alt: "A wide concrete curve sweeping out of the bottom corner.",
            caption: "Barcelona, most mornings",
          },
          {
            src: "/placeholder/photo-04.svg",
            alt: "Vertical bands of shade, like light through a half-shut blind.",
            caption: "The desk, on a good day",
          },
          {
            src: "/placeholder/photo-05.svg",
            alt: "A pale sphere lit from the left, resting on a grey plane.",
            caption: "A long walk, thinking",
          },
        ],
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
