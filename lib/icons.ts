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
  ChevronRight,
  // actions
  Search,
  ArrowUpRight,
  Copy,
  Check,
  Plus,
  X,
  // command palette affordances
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  // theme
  Sun,
  Moon,
  Monitor,
} from "lucide-react"

export type { LucideIcon } from "lucide-react"
