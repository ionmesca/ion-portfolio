import type { CSSProperties, ReactNode } from "react"

const SHIMMER_STYLE = {
  "--shimmer-period": "2.4044s",
  "--shimmer-phase": "0.48",
} as CSSProperties

export function ShimmerText({ children }: { children: ReactNode }) {
  return (
    <span className="ledgy-shimmer-text" style={SHIMMER_STYLE}>
      {children}
    </span>
  )
}
