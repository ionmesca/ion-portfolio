import type { SVGProps } from "react"

// Product-content exception to the portfolio's Lucide contract. These are the
// exact Font Awesome Pro Regular paths used by Ledgy, so the recreated product
// UI keeps its source silhouettes without importing Ledgy's private packages.
type IconDefinition = {
  height: number
  path: string
  width: number
}

const ICONS = {
  search: {
    width: 512,
    height: 512,
    path: "M368 208a160 160 0 1 0 -320 0 160 160 0 1 0 320 0zM337.1 371.1C301.7 399.2 256.8 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208c0 48.8-16.8 93.7-44.9 129.1L505 471c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L337.1 371.1z",
  },
  fileLines: {
    width: 384,
    height: 512,
    path: "M64 48l112 0 0 88c0 39.8 32.2 72 72 72l88 0 0 240c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16zM224 67.9l92.1 92.1-68.1 0c-13.3 0-24-10.7-24-24l0-68.1zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-261.5c0-17-6.7-33.3-18.7-45.3L242.7 18.7C230.7 6.7 214.5 0 197.5 0L64 0zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z",
  },
  chevronDown: {
    width: 448,
    height: 512,
    path: "M207.5 409c9.4 9.4 24.6 9.4 33.9 0l200-200c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-183 183-183-183c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l200 200z",
  },
  chevronUp: {
    width: 448,
    height: 512,
    path: "M207.5 103c9.4-9.4 24.6-9.4 33.9 0l200 200c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-183-183-183 183c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l200-200z",
  },
} satisfies Record<string, IconDefinition>

function AgentIcon({
  definition,
  ...props
}: SVGProps<SVGSVGElement> & { definition: IconDefinition }) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      viewBox={`0 0 ${definition.width} ${definition.height}`}
      {...props}
    >
      <path d={definition.path} />
    </svg>
  )
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return <AgentIcon definition={ICONS.search} {...props} />
}

export function FileLinesIcon(props: SVGProps<SVGSVGElement>) {
  return <AgentIcon definition={ICONS.fileLines} {...props} />
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return <AgentIcon definition={ICONS.chevronDown} {...props} />
}

export function ChevronUpIcon(props: SVGProps<SVGSVGElement>) {
  return <AgentIcon definition={ICONS.chevronUp} {...props} />
}
