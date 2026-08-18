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
 * PLACEHOLDER hrefs — bare profile roots until the real handles land.
 */
export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/", Glyph: GitHubGlyph, size: "size-5" },
  { label: "X", href: "https://x.com/", Glyph: XGlyph, size: "size-4" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", Glyph: LinkedInGlyph, size: "size-5" },
] as const
