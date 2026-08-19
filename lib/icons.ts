/**
 * Icons — the site's icon convention, plus a barrel for the set actually in use.
 *
 * The rules (token-contract.md 3.9). These are the whole system; there is no
 * wrapper component, because a wrapper would cost a render layer and break the
 * direct-import tree shaking Next.js does for `lucide-react`.
 *
 *   Library      lucide-react only.
 *   Stroke       1.5 everywhere. Pass `strokeWidth={ICON_STROKE}`, or drop the
 *                icon inside a `<Button>` / any container that sets
 *                `[&_svg]:[stroke-width:1.5]` and it is handled for you.
 *   Sizes        16px (`size-4`) and 20px (`size-5`). Nothing else.
 *   Colour       `muted-foreground` by default;
 *                `primary-foreground-muted` inside a solid dark button.
 *   Brand marks  GitHub, X and LinkedIn are FILLED brand glyphs, not lucide
 *                strokes. They do not belong in this file.
 *
 * Import from here rather than from `lucide-react` directly, so the set stays
 * countable and an icon that is not in the system is visible as a diff.
 */

export const ICON_STROKE = 1.5

export {
  // navigation
  Home,
  PenLine,
  FileText,
  Layers,
  Package,
  // The ⌘K palette's "Agents & Skills" row (Figma 13:2926 draws lucide's bot).
  Bot,
  ChevronRight,
  // The letter's "← Home" button (Figma 13:2943 draws lucide's arrow-left).
  ArrowLeft,
  // The mobile top bar's trigger. Ion's call (pass 11 §B): the mobile trigger
  // is for NAVIGATION, not search — lucide `menu`, never `search`. Search still
  // exists, but only inside the sheet the menu opens.
  Menu,
  // actions
  Search,
  /**
   * THE TWO ARROWS ARE A CONTRACT (Ion, 2026-08-18: "the navigation is not
   * really clear"). Every row that leads somewhere ends in one of them, and
   * which one it is tells the reader where they are about to land BEFORE they
   * click:
   *
   *   ArrowRight    →   stays on this site. Article rows, and any internal
   *                     row added later.
   *   ArrowUpRight  ↗   leaves for another site, in a new tab. Stack rows,
   *                     the "Skills I use" rows, the quiet GitHub link in a
   *                     group header.
   *
   * A row with neither has a different, visible affordance instead — the
   * install chip, which copies rather than navigates. There is no third case:
   * a row with no affordance at all is a dead row, and there are none.
   */
  ArrowRight,
  ArrowUpRight,
  Copy,
  Check,
  Plus,
  // lucide's `X` is the dismiss cross. It is re-exported as `Close` because
  // this site also has a brand X (the social network) — `XGlyph` in
  // components/landing/brand-glyphs.tsx. Two things called `X` in one import
  // list is a bug waiting to happen, so the generic one takes the plain name.
  X as Close,
  // command palette affordances
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  // theme: the Preferences row's glyph and its three segment options
  // (Figma 13:2866 / 13:2877 — sun, moon, monitor).
  Sun,
  Moon,
  Monitor,
  // sound: the Preferences row's glyph and its two segment options. There is
  // no Figma frame for this row — the Sound preference was ratified after the
  // palette was drawn — so the pair is chosen to match the theme row's
  // language exactly: one glyph that means the thing, and its negation.
  Volume2,
  VolumeOff,
  // socials: the Preferences block's third row. The three cells beside it are
  // FILLED BRAND MARKS and stay out of this file (see `Brand marks` above);
  // this is only the line's own label glyph, and it follows the same rule the
  // theme and sound glyphs do — one lucide mark that means the thing itself.
  // `at-sign` is a handle, which is exactly what those three cells lead to.
  AtSign,
} from "lucide-react"

export type { LucideIcon } from "lucide-react"
