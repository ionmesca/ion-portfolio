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
  /**
   * The panel artwork, one entry per panel, in panel order.
   *
   * OPTIONAL, AND EMPTY ON EVERY PROJECT BELOW. Figma's Panel component
   * (11:1662) is an empty muted rectangle, and the blank tiles in the reference
   * export are the ratified design until the artwork ticket lands — see the
   * note at the top of `components/landing/media-column.tsx`. This field is the
   * SOCKET that ticket plugs into, and `components/ui/settle-in.tsx` is what
   * makes a picture arrive quietly rather than pop into the column while
   * someone is scrolling past it.
   */
  media?: { src: string; alt: string }[]
}

export const projects: Project[] = [
  { id: "ledgy-agent", name: "Ledgy Agent", year: "2026", mark: "ledgy-agent" },
  { id: "hey-buna-app", name: "Hey Buna App", year: "2025", mark: "buna" },
  { id: "equity-dashboard", name: "Equity Dashboard", year: "2025", mark: "ledgy" },
  { id: "ripple-agent", name: "Ripple Agent", year: "2024", mark: "ledgy" },
  { id: "vesting-builder", name: "Vesting builder", year: "2024", mark: "ledgy" },
]
