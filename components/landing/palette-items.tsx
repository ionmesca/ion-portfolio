import {
  ArrowUpRight,
  Bot,
  Copy,
  FileText,
  Home,
  Layers,
  PenLine,
} from "@/lib/icons"

import { SOCIALS } from "./socials"

/**
 * The ⌘K palette's rows, in Figma order (13:2673).
 *
 * Two groups of options — Navigate (5) and Actions (5). Preferences is NOT
 * here: its Theme and Sound rows are controls, not commands, so they live
 * outside the listbox and outside the ↑/↓ ring. See command-palette.tsx.
 *
 * SHORTCUTS: only `⌘⇧C` is ever shown. Ion's edit hid every navigation
 * shortcut in the Figma component (the `Shortcut` frames are all `visible:
 * false`), because five two-key mnemonics is a keyboard-shortcut cheatsheet,
 * not a menu. Do not re-add them.
 */

export type PaletteItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Internal route — rendered as a next/link and client-navigated. */
  href?: string
  /** External destination — rendered as a plain anchor. */
  external?: string
  /** Right-aligned hint. Plain text at the Small step, not a Kbd chip. */
  shortcut?: string
  /** A commit action, run in place instead of navigating. */
  action?: "copy-email"
}

export type PaletteGroup = {
  id: string
  label: string
  items: PaletteItem[]
  /**
   * Ids from `items` that the DESKTOP palette does NOT draw as full-width rows.
   *
   * It has meant one thing throughout — "the desktop lays these out
   * differently" — and only the other layout has changed. Round 3 collapsed the
   * three socials into one compact row of icon targets at the end of the group
   * (three full-width rows for three social links was three quarters of a row
   * of empty space, three times over). Round 4 took them out of the listbox
   * altogether: they are a Socials control row below the rule now, in the same
   * language as Theme and Sound (Ion, 2026-08-19).
   *
   * THE MOBILE SHEET IGNORES THIS and still renders all ten as full-width rows.
   * A 44px touch target is not negotiable, and the sheet has the height to
   * spend that the 382px panel does not — so the two surfaces disagree about
   * LAYOUT while agreeing about DESTINATIONS, which is exactly the split this
   * field exists to express. The alternative — moving the socials into a
   * separate array — would have made the sheet enumerate two lists to render
   * one menu, and would have let the two drift.
   */
  compact?: string[]
}

/** The one address the Copy email action puts on the clipboard. */
export const CONTACT_EMAIL = "ion.mesca@gmail.com"

/**
 * The one PLACEHOLDER destination left in this file.
 *
 * Every Navigate row has a real route: `/`, `/about`, `/writing`, `/stack`
 * and `/agents` all exist. The three socials read their real profiles off
 * `socials.ts` below. Book a call is the last `#` — a dead anchor is a smaller
 * lie than a 404, and it waits on a real booking URL.
 */
const PLACEHOLDER = "#"

/**
 * The three social rows, built from `socials.ts` so there is exactly one list
 * of destinations on this site. The ids are the labels lowercased, which is
 * what `compact` below names and what the desktop palette matches on.
 *
 * They exist here FOR THE MOBILE SHEET, which renders every item in every
 * group as a touch row. The desktop palette skips them and draws
 * `socials-segment.tsx` instead.
 */
const SOCIAL_ITEMS: PaletteItem[] = SOCIALS.map(({ label, href, Glyph }) => ({
  id: label.toLowerCase(),
  label,
  icon: Glyph,
  external: href,
}))

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
    // Derived, not retyped: whatever `socials.ts` holds is what the desktop
    // palette leaves out of its listbox and the mobile sheet draws as rows.
    compact: SOCIAL_ITEMS.map((item) => item.id),
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
        shortcut: "⌘⇧C",
        action: "copy-email",
      },
      ...SOCIAL_ITEMS,
    ],
  },
]
