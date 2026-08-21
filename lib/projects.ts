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
   * The panel artwork, one entry per panel, in panel order. Index 0 is the
   * first home panel (desktop 16:10). Mobile renders every entry in the same
   * order as its own 4:5 card, cover-cropped from the top until portrait crops
   * land. A project with fewer than two entries still renders two muted wells
   * on desktop, so the wheel's "two panels per project" rhythm holds for empty
   * case studies. Extra entries lengthen that project's stretch of the column.
   *
   * Stills settle in via `components/ui/settle-in.tsx`. A `type: "video"`
   * entry is a muted loop. A `type: "thinking"` entry is the Ledgy mark,
   * centered on the muted well.
   */
  media?: ProjectMedia[]
}

export type ThinkingTheme = "neutral" | "orb"

export type ProjectMedia =
  | { type?: "image"; src: string; alt: string; unoptimized?: boolean }
  | {
      type: "ledgy-agent-screen"
      backgroundSrc: string
      captureSrc: string
      alt: string
    }
  | {
      type: "video"
      src: string
      webm?: string
      poster?: string
      alt: string
    }
  | {
      type: "thinking"
      alt: string
      theme?: ThinkingTheme
      label?: string
    }

export const projects: Project[] = [
  {
    id: "ledgy-agent",
    name: "Ledgy Agent",
    year: "2026",
    mark: "ledgy-agent",
    media: [
      {
        type: "ledgy-agent-screen",
        backgroundSrc: "/projects/ledgy-agent/glass-studio-fill-q97.webp",
        captureSrc: "/projects/ledgy-agent/agent-empty-state-capture.png",
        alt: "Ledgy Agent empty state over a purple glass background",
      },
      {
        type: "thinking",
        alt: "Ledgy Agent thinking",
        theme: "orb",
        label: "Thinking",
      },
    ],
  },
  { id: "hey-buna-app", name: "Hey Buna App", year: "2025", mark: "buna" },
  { id: "equity-dashboard", name: "Equity Dashboard", year: "2025", mark: "ledgy" },
  { id: "ripple-agent", name: "Ripple Agent", year: "2024", mark: "ledgy" },
  { id: "vesting-builder", name: "Vesting builder", year: "2024", mark: "ledgy" },
]
