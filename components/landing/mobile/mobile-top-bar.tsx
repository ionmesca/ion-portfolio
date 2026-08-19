import { MobileMenu } from "./mobile-menu"
import { MOBILE_TOPBAR_H } from "./mobile-metrics"

/**
 * The 56px sticky chrome that sits at the top of every mobile page.
 *
 * Landing: avatar + name on the left. Inner pages: the destination-labelled
 * back button. The menu is always on the right, so leaving the page and
 * jumping elsewhere are both reachable without scrolling.
 *
 * It is a sibling of the page body, not a child of the rail grid — sticky
 * inside the rail's one-column cell has nothing to stick against. `lg:hidden`
 * because desktop keeps the rail.
 */
export function MobileTopBar({ children }: { children: React.ReactNode }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background px-4 lg:hidden"
      style={{ height: MOBILE_TOPBAR_H }}
    >
      <div className="min-w-0">{children}</div>
      <MobileMenu />
    </header>
  )
}
