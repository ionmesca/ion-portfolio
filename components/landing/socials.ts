import { GitHubGlyph, LinkedInGlyph, XGlyph } from "./brand-glyphs"

/**
 * The three social destinations, in Figma order.
 *
 * Lifted out of `intro.tsx` so the desktop rail and the mobile hero read the
 * same list. The per-glyph size is part of the data because the three marks are
 * not optically equal: GitHub and LinkedIn are drawn at 20, X at 16 — the same
 * pairing Figma uses in BOTH the desktop `Social link` components and the
 * mobile 40x40 icon buttons (20:490 / 20:494 / 20:498).
 *
 * ONE SOURCE FOR THE THREE DESTINATIONS. The rail's icon cluster, the mobile
 * hero, the ⌘K palette's Socials row and the hover cards' Follow / Connect
 * links all read this list, so a handle is written once.
 *
 * X and LinkedIn are Ion's real profiles (given 2026-08-19). GitHub is still a
 * bare profile root — see the PLACEHOLDER note on its line.
 */
export const SOCIALS = [
  {
    label: "GitHub",
    // PLACEHOLDER — the handle has not been given yet, so this is the site
    // root. It is the last unreal destination in this file; replace the path
    // and nothing else changes.
    href: "https://github.com/",
    Glyph: GitHubGlyph,
    size: "size-5",
  },
  { label: "X", href: "https://x.com/ionmesca", Glyph: XGlyph, size: "size-4" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ion-mesca/",
    Glyph: LinkedInGlyph,
    size: "size-5",
  },
] as const
