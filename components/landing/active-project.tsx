"use client"

import * as React from "react"

/**
 * Active-project state — one index, shared by the rail's project list and the
 * right column's media panels, plus the anchors that tie the two together.
 *
 * It lives in a provider rather than inside the list on purpose. The list and
 * the panels sit in different columns of the page. Anything that can move the
 * selection — a row click, an arrow key, ⌘K — ends up calling `setActiveIndex`
 * and every consumer follows.
 *
 * The index is clamped here so callers (the wheel controller especially) can
 * hand over an out-of-range value without guarding first.
 *
 * ANCHORS. The desktop landing derives the selection from the DOCUMENT SCROLL:
 * the wheel needs the document Y of each project's FIRST media panel, and
 * those panels are rendered by the other column. `anchorsRef` is where the
 * media column deposits them and where the wheel reads them from — a ref, not
 * state, so registering an element never re-renders anything. Index k is
 * project k, in `lib/projects` order.
 */

type ActiveProjectValue = {
  activeIndex: number
  setActiveIndex: (index: number) => void
  count: number
  anchorsRef: React.RefObject<(HTMLElement | null)[]>
}

const ActiveProjectContext = React.createContext<ActiveProjectValue | null>(null)

export function ActiveProjectProvider({
  count,
  children,
}: {
  count: number
  children: React.ReactNode
}) {
  const [activeIndex, setIndex] = React.useState(0)
  const anchorsRef = React.useRef<(HTMLElement | null)[]>([])

  const setActiveIndex = React.useCallback(
    (index: number) => setIndex(Math.min(Math.max(index, 0), count - 1)),
    [count]
  )

  const value = React.useMemo(
    () => ({ activeIndex, setActiveIndex, count, anchorsRef }),
    [activeIndex, setActiveIndex, count]
  )

  return (
    <ActiveProjectContext.Provider value={value}>
      {children}
    </ActiveProjectContext.Provider>
  )
}

export function useActiveProject() {
  const value = React.useContext(ActiveProjectContext)
  if (!value) {
    throw new Error("useActiveProject must be used inside <ActiveProjectProvider>")
  }
  return value
}
