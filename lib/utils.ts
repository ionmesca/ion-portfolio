import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Custom theme tokens have to be TAUGHT to tailwind-merge.
 *
 * It classifies a bare class by name. Anything it does not recognise it
 * guesses at, and its guess for `x-word` is usually "that is a colour" — which
 * puts the class in a different conflict group from the one it belongs to, so
 * merging silently keeps both. Two of these have now been paid for:
 *
 *   TYPE  (742eda7) `--text-small` 13 and `--text-subhead` 15 were read as
 *         text COLOURS, so `cn("text-small", "text-kbd-foreground")` dropped
 *         the colour.
 *   SHADOW (2026-08-18) the four elevation steps were read as shadow COLOURS,
 *         which meant `shadow-none` — a shadow SIZE — did not override them.
 *         The ⌘K palette hands its identity chip `bg-transparent shadow-none`
 *         so the morph surface underneath owns the fill and the elevation;
 *         `bg-transparent` won and `shadow-none` did not, so the chip row kept
 *         painting `shadow-subtle`, hairline ring and all. And because
 *         `measure()` freezes the avatar, name and keycap out of flow, that
 *         row collapses to its own padding — 16 x 42 — so what actually
 *         painted was a 16px-wide rounded-lg sliver with a 1px ring, standing
 *         behind the avatar. That is the arc Ion kept reporting.
 *
 * Registering the names is the fix at the root: every `cn()` call site in the
 * app gets it, and neither trap can be re-sprung by a new component.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-small", "text-subhead"],
      shadow: [
        { shadow: ["subtle", "raised", "overlay", "modal"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
