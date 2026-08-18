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
