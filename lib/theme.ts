/**
 * Theme — light / dark / system, hand-rolled.
 *
 * No `next-themes`. The whole mechanism is: a class on <html>, a string in
 * localStorage, and one blocking script in <head> so the first paint is already
 * correct (ratified in the ⌘K morph brief — the palette's Preferences group is
 * the only UI that writes it).
 *
 * `system` is the default and is not a third class: it resolves to light or
 * dark from `prefers-color-scheme` and keeps resolving as the OS flips.
 */

export const THEME_STORAGE_KEY = "ion-theme"

export const THEMES = ["light", "dark", "system"] as const
export type Theme = (typeof THEMES)[number]

const DARK_QUERY = "(prefers-color-scheme: dark)"

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
)});var d=s==="dark"||((s===null||s==="system")&&window.matchMedia(${JSON.stringify(
  DARK_QUERY
)}).matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`

function prefersDark(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.matchMedia(DARK_QUERY).matches
  } catch {
    return false
  }
}

/** The stored preference, or `system` when nothing is stored or storage throws. */
export function readTheme(): Theme {
  if (typeof window === "undefined") return "system"
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return (THEMES as readonly string[]).includes(stored ?? "")
      ? (stored as Theme)
      : "system"
  } catch {
    return "system"
  }
}

/** Paint a theme and remember it. Storage failure must not stop the repaint. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return
  const dark = theme === "dark" || (theme === "system" && prefersDark())
  document.documentElement.classList.toggle("dark", dark)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* a session-only theme is better than a thrown error */
  }
}

/**
 * Re-resolve `system` when the OS flips. Returns an unsubscribe function.
 * A no-op (still unsubscribable) where matchMedia is missing.
 */
export function subscribeSystemTheme(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  try {
    const mq = window.matchMedia(DARK_QUERY)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  } catch {
    return () => {}
  }
}
