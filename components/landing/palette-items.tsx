import {
  ArrowUpRight,
  Bot,
  Copy,
  FileText,
  Home,
  Layers,
  PenLine,
} from "@/lib/icons"

/**
 * The ⌘K palette's rows, in Figma order (13:2673).
 *
 * Two groups of options — Navigate (5) and Actions (2). Preferences and
 * Socials are NOT here: they are controls, not commands, so they live
 * outside the listbox and outside the ↑/↓ ring. See command-palette.tsx
 * and mobile-menu.tsx. The three social destinations live in `socials.ts`
 * and are drawn by `socials-segment.tsx` on both surfaces.
 *
 * SHORTCUTS: none are shown. Ion hid every navigation shortcut in the Figma
 * component (the `Shortcut` frames are all `visible: false`) — five two-key
 * mnemonics is a cheatsheet, not a menu — and on 2026-08-19 hid ⌘⇧C on Copy
 * email as well. The chord still copies with the palette closed; there is
 * just nothing in the row to advertise it.
 */

export type PaletteItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Internal route — rendered as a next/link and client-navigated. */
  href?: string
  /** External destination — rendered as a plain anchor. */
  external?: string
  /** A commit action, run in place instead of navigating. */
  action?: "copy-email"
}

export type PaletteGroup = {
  id: string
  label: string
  items: PaletteItem[]
}

/** The one address the Copy email action puts on the clipboard. */
export const CONTACT_EMAIL = "ion.mesca@gmail.com"

/**
 * The one PLACEHOLDER destination left in this file.
 *
 * Every Navigate row has a real route: `/`, `/about`, `/writing`, `/stack`
 * and `/agents` all exist. The three socials live in `socials.ts`. Book a
 * call is the last `#` — a dead anchor is a smaller lie than a 404, and it
 * waits on a real booking URL.
 */
const PLACEHOLDER = "#"

export const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: "navigate",
    label: "Navigate",
    items: [
      { id: "home", label: "Home", icon: Home, href: "/" },
      /* THE IDS ARE CODE NAMES AND DO NOT FOLLOW THE LABELS. Ion renamed
         Letter → About and Articles → Writing on 2026-08-19, label and route
         together. `letter` and `articles` stay here for the same reason
         `components/letter/`, `content/articles/` and `lib/articles.ts` keep
         theirs: an id is what the code calls a thing, not what a reader is
         told it is called. Nothing outside this file's DOM ids reads them. */
      { id: "letter", label: "About", icon: PenLine, href: "/about" },
      { id: "articles", label: "Writing", icon: FileText, href: "/writing" },
      { id: "stack", label: "Stack", icon: Layers, href: "/stack" },
      { id: "agents", label: "Agents & Skills", icon: Bot, href: "/agents" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    items: [
      {
        id: "book",
        label: "Book a call",
        icon: ArrowUpRight,
        external: PLACEHOLDER,
      },
      {
        id: "copy-email",
        label: "Copy email",
        icon: Copy,
        action: "copy-email",
      },
    ],
  },
]
