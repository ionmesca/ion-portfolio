import {
  ArrowUpRight,
  Bot,
  Copy,
  FileText,
  Home,
  Layers,
  PenLine,
} from "@/lib/icons"

import { GitHubGlyph, LinkedInGlyph, XGlyph } from "./brand-glyphs"

/**
 * The ⌘K palette's rows, in Figma order (13:2673).
 *
 * Two groups of options — Navigate (5) and Actions (5). Preferences is NOT
 * here: its Theme row is a control, not a command, so it lives outside the
 * listbox and outside the ↑/↓ ring. See command-palette.tsx.
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
   * Ids from `items` that the DESKTOP palette collapses into one compact row of
   * icon targets, closing the group (Ion, round 3, 2026-08-18: three full-width
   * rows for three social links was three quarters of a row of empty space,
   * three times over).
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
 * PLACEHOLDER destinations, all `#`.
 *
 * Every Navigate row now has a real route: `/`, `/letter`, `/articles`,
 * `/stack` and `/agents` all exist. What is still `#` is Book a call and the
 * three social rows, which wait on real URLs — a dead anchor is a smaller lie
 * than a 404.
 */
const PLACEHOLDER = "#"

export const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: "navigate",
    label: "Navigate",
    items: [
      { id: "home", label: "Home", icon: Home, href: "/" },
      { id: "letter", label: "Letter", icon: PenLine, href: "/letter" },
      { id: "articles", label: "Articles", icon: FileText, href: "/articles" },
      { id: "stack", label: "Stack", icon: Layers, href: "/stack" },
      { id: "agents", label: "Agents & Skills", icon: Bot, href: "/agents" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    // The three socials close the group as one icon row on desktop. Order is
    // the order they sit in, left to right.
    compact: ["github", "x", "linkedin"],
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
      { id: "github", label: "GitHub", icon: GitHubGlyph, external: PLACEHOLDER },
      { id: "x", label: "X", icon: XGlyph, external: PLACEHOLDER },
      {
        id: "linkedin",
        label: "LinkedIn",
        icon: LinkedInGlyph,
        external: PLACEHOLDER,
      },
    ],
  },
]
