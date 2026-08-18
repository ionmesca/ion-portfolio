import Image from "next/image"

import type { ProjectMark } from "@/lib/projects"

/**
 * ProjectIcon — the 24px mark on a project row.
 *
 * The 8px radius is a raw value, not a token step. Figma names the layer
 * "Icon (r8 raw — concentric 12 outer − 4 inset)": the row's radius is
 * `md` (12) and the icon is inset by the row's 4px padding, so 12 − 4 = 8.
 * Writing it as a token would break the concentric relationship.
 *
 * #4920F5 is the Ledgy brand purple. Like the GitHub / X / LinkedIn glyphs it
 * is asset colour, not a system role, so it is not expected in globals.css.
 */

const MARK_RADIUS = "rounded-[8px]"

function LedgyMark() {
  return (
    <div
      className={`flex size-6 items-center justify-center bg-[#4920F5] ${MARK_RADIUS}`}
    >
      <svg
        width="24"
        height="17"
        viewBox="0 0 24 17"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 4.63632L8 0V3.09104L0 7.72736L0 4.63632Z" fill="white" />
        <path d="M0 9.27264L16 0V3.09104L0 12.3637L0 9.27264Z" fill="white" />
        <path d="M0 17L0 13.909L24 0V3.09104L0 17Z" fill="white" />
        <path d="M24 7.7273L8 16.9999V13.9089L24 4.63626V7.7273Z" fill="white" />
        <path
          d="M16 17.0001L24 12.3638V9.27274L16 13.9091V17.0001Z"
          fill="white"
        />
      </svg>
    </div>
  )
}

const IMAGE_MARKS = {
  "ledgy-agent": "/projects/ledgy-agent-mark.png",
  buna: "/projects/buna-mark.png",
} as const

export function ProjectIcon({ mark }: { mark: ProjectMark }) {
  if (mark === "ledgy") return <LedgyMark />

  return (
    <Image
      src={IMAGE_MARKS[mark]}
      alt=""
      width={24}
      height={24}
      className={`size-6 object-cover ${MARK_RADIUS}`}
    />
  )
}
