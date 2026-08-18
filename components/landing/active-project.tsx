"use client"

import * as React from "react"

/**
 * Active-project state — one index, shared by the rail's project list and the
 * right column's media panels.
 *
 * It lives in a provider rather than inside the list on purpose. The list and
 * the panels sit in different columns of the page, and the NEXT phase adds a
 * scroll-wheel controller that drives the same index without going through a
 * click. Anything that can move the selection — click today, wheel physics
 * tomorrow, ⌘K later — calls `setActiveIndex` and every consumer follows.
 *
 * The index is clamped here so callers (a wheel controller especially) can
 * hand over an out-of-range value without guarding first.
 */

type ActiveProjectValue = {
  activeIndex: number
  setActiveIndex: (index: number) => void
  count: number
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

  const setActiveIndex = React.useCallback(
    (index: number) => setIndex(Math.min(Math.max(index, 0), count - 1)),
    [count]
  )

  const value = React.useMemo(
    () => ({ activeIndex, setActiveIndex, count }),
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
