/**
 * Projects — the landing rail's list.
 *
 * This array owns the project order, labels, marks and panel sequence. Projects
 * without media render one muted placeholder panel until their case study is
 * ready.
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
   * first panel (desktop 16:10). Mobile renders every entry in the same order
   * as its own 4:5 card, cover-cropped from the top until portrait crops land.
   * A project without media renders one muted placeholder on both layouts.
   *
   * Stills settle in via `components/ui/settle-in.tsx`. A `type: "thinking"`
   * entry is the Ledgy mark, centered on the muted well.
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
      type: "thinking"
      alt: string
      theme?: ThinkingTheme
      label?: string
    }

export function projectPanelIndices(project: Project) {
  const count = Math.max(1, project.media?.length ?? 0)
  return Array.from({ length: count }, (_, mediaIndex) => mediaIndex)
}

export const projects: Project[] = [
  {
    id: "equity-admin",
    name: "Equity Admin",
    year: "2025",
    mark: "ledgy-agent",
    media: [
      {
        src: "/projects/equity-admin/equity-admin-home-q95.avif",
        alt: "Equity administration dashboard with stakeholder tasks and ownership insights",
        unoptimized: true,
      },
      {
        src: "/projects/equity-admin/equity-admin-command-bar-q95.avif",
        alt: "Equity administration command bar showing grant navigation and actions",
        unoptimized: true,
      },
    ],
  },
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
  { id: "buna-app", name: "Buna App", year: "2025", mark: "buna" },
  {
    id: "equity-dashboard",
    name: "Equity Dashboard",
    year: "2025",
    mark: "ledgy-agent",
  },
  {
    id: "vesting-builder",
    name: "Vesting Builder",
    year: "2024",
    mark: "ledgy-agent",
  },
  {
    id: "ripple-agent",
    name: "Ripple Agent",
    year: "2024",
    mark: "ledgy-agent",
  },
]
