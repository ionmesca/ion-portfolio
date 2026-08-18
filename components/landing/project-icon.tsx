import Image from "next/image"

import type { ProjectMark } from "@/lib/projects"

/**
 * ProjectIcon — the mark on a project row (24px) or in the mobile indicator
 * bar (20px).
 *
 * Both radii are raw values, not token steps, and both are concentric:
 *   24 — "Icon (r8 raw — concentric 12 outer − 4 inset)". The desktop row's
 *        radius is `md` (12) and the icon is inset by the row's 4px padding.
 *   20 — "Thumb (r6 raw — concentric, documented allowance)", Figma 20:901.
 * Writing either as a token would break the concentric relationship.
 *
 * #4920F5 is the Ledgy brand purple. Like the GitHub / X / LinkedIn glyphs it
 * is asset colour, not a system role, so it is not expected in globals.css.
 */

type MarkSize = 20 | 24

const MARK = {
  // `art` is the wordmark's own box: the Figma vector is 24 x 17, and the 20px
  // thumbnail scales it to Figma's own 20 x 14.17 (20:902). Written as explicit
  // pixel dimensions rather than 100%, so the 24px mark rasterises exactly as
  // it always has — a percentage changed its antialiasing by a few pixels.
  24: { box: "size-6", radius: "rounded-[8px]", art: { w: 24, h: 17 } },
  20: { box: "size-5", radius: "rounded-[6px]", art: { w: 20, h: 14.17 } },
} as const satisfies Record<
  MarkSize,
  { box: string; radius: string; art: { w: number; h: number } }
>

function LedgyMark({ size }: { size: MarkSize }) {
  return (
    <div
      className={`flex items-center justify-center bg-[#4920F5] ${MARK[size].box} ${MARK[size].radius}`}
    >
      <svg
        width={MARK[size].art.w}
        height={MARK[size].art.h}
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

export function ProjectIcon({
  mark,
  size = 24,
}: {
  mark: ProjectMark
  size?: MarkSize
}) {
  if (mark === "ledgy") return <LedgyMark size={size} />

  return (
    <Image
      src={IMAGE_MARKS[mark]}
      alt=""
      width={24}
      height={24}
      className={`object-cover ${MARK[size].box} ${MARK[size].radius}`}
    />
  )
}
