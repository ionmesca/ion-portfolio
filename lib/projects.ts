/**
 * Projects — the landing rail's list.
 *
 * PLACEHOLDER CONTENT. Every name, year and mark below is copied verbatim from
 * the Figma frame "Landing v3 — desktop light" (node 11:1665). None of it is
 * final copy; do not "improve" it here. When the real case studies land this
 * array is what they replace.
 *
 * `mark` selects the 24px project glyph:
 *   "ledgy"       — the flat Ledgy wordmark on solid #4920F5, drawn inline
 *                   (components/landing/project-icon.tsx).
 *   "ledgy-agent" — the gradient composition variant, exported from Figma.
 *   "buna"        — the green Buna mark, exported from Figma.
 *
 * `year` is rendered only on the active row — see project-list.tsx.
 */

export type ProjectMark = "ledgy" | "ledgy-agent" | "buna"

export type Project = {
  /** Stable key. Also the value written to the media panel's data-project. */
  id: string
  name: string
  year: string
  mark: ProjectMark
}

export const projects: Project[] = [
  { id: "ledgy-agent", name: "Ledgy Agent", year: "2026", mark: "ledgy-agent" },
  { id: "hey-buna-app", name: "Hey Buna App", year: "2025", mark: "buna" },
  { id: "equity-dashboard", name: "Equity Dashboard", year: "2025", mark: "ledgy" },
  { id: "ripple-agent", name: "Ripple Agent", year: "2024", mark: "ledgy" },
  { id: "vesting-builder", name: "Vesting builder", year: "2024", mark: "ledgy" },
]
