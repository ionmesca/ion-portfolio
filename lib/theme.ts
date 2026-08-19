/**
 * Theme — light / dark, hand-rolled.
 *
 * No `next-themes`. The whole mechanism is: a class on <html>, a string in
 * localStorage, and one blocking script in <head> so the first paint is already
 * correct (ratified in the ⌘K morph brief — the palette's Preferences group is
 * the only UI that writes it).
 *
 * Light is the default. A leftover `system` value from an earlier build
 * resolves to light.
 */

export const THEME_STORAGE_KEY = "ion-theme"

export const THEMES = ["light", "dark"] as const
export type Theme = (typeof THEMES)[number]

/**
 * The no-FOUC script, inlined into <head> by app/layout.tsx.
 *
 * It runs BEFORE the body renders, so the `.dark` class is on <html> for the
 * very first paint and there is no white flash on a dark-themed reload. Every
 * access is wrapped: Safari in private mode throws on localStorage, and a
 * thrown error here would abort the rest of the document's head.
 *
 * Kept as a string rather than a component so the key and the class name have
 * exactly one definition each.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});document.documentElement.classList.toggle("dark",s==="dark");}catch(e){}})();`

/** The stored preference, or light when nothing is stored or storage throws. */
export function readTheme(): Theme {
  if (typeof window === "undefined") return "light"
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

/** Paint a theme and remember it. Storage failure must not stop the repaint. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* a session-only theme is better than a thrown error */
  }
}
