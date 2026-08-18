"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { ENTRANCE_TEARDOWN } from "@/lib/motion"

/* ============================================================================
   The page entrance, and the reason this file is a TEMPLATE and not a LAYOUT.

   Ion ratified the benji recipe: every page plays a staggered entrance on
   EVERY navigation, not once per session. A layout persists across
   navigations — its DOM is reused, its state is kept, its effects are not
   re-run — so an entrance written in a layout plays once and never again.
   A template is re-created on every navigation: new DOM, fresh state,
   effects re-synchronised. That re-creation IS the replay mechanism. There is
   no "have I played?" flag anywhere in this system, and no session storage;
   arriving at a page is the whole trigger.

   WHAT THIS FILE ACTUALLY DOES is add one class and then take it away again.
   The choreography itself is CSS (`.page-enter`, app/globals.css section 6),
   which is what keeps rule 2 of intro-reveal.tsx true here: `usePathname` is
   resolved on the server too, so the class is in the server's HTML and the
   entrance plays whether or not React ever hydrates.

   THE LANDING IS EXCLUDED, DELIBERATELY. `/` has a richer named-group
   choreography of its own — chip, hero, actions, rows, media, each with its
   own delay and the hero resolving per-character out of blur
   (components/landing/intro-reveal.tsx, components/ui/text-effect.tsx).
   Adding the generic per-child stagger on top would be two entrances fading
   the same pixels. The landing gets its replay from this file all the same:
   its `Reveal` wrappers are inside the subtree this template re-creates, so
   they re-mount and re-play on every navigation back to `/`.

   `played`, THE MODULE FLAG, IS GONE. intro-reveal.tsx used to hold a
   client-bundle-level boolean so the landing choreography ran exactly once per
   page load. Under the ratified recipe a return to the landing is a real
   arrival and SHOULD replay, and the flag actively prevented it — a module
   variable outlives every re-mount. Deleting it is what makes the template's
   re-creation reach the landing. Recorded here because "the flag was removed
   on purpose" is not something a future reader can infer from its absence.

   THE CLASS IS DROPPED WHEN THE SHOW ENDS — rule 4, the fill-mode trap. The
   entrance uses `both` fill so late blocks stay hidden through their delay,
   and a filling animation keeps its element a stacking context for as long as
   it is applied. A stacked reading column paints over anything meant to float
   across it (the collections' hover previews, the rail's wheel). The final
   frame is the settled page, so removing the class is invisible.

   Under reduced motion the CSS emits no animation at all, so the class is
   inert and the page is settled instantly. The teardown timer still runs and
   still removes it; a no-op teardown is cheaper than a second code path.
   ========================================================================== */

/** The one route with its own choreography. See the block comment. */
const LANDING = "/"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const generic = pathname !== LANDING

  // True on the server and from the client's first paint until the teardown.
  const [playing, setPlaying] = React.useState(true)

  React.useEffect(() => {
    if (!generic) return
    const t = window.setTimeout(() => setPlaying(false), ENTRANCE_TEARDOWN)
    return () => window.clearTimeout(t)
  }, [generic])

  // No wrapper on the landing: the desktop rail is `position: sticky` and the
  // media column is measured by the wheel, and neither should have to reason
  // about an element that exists only to carry a class it never uses. The
  // landing's markup stays exactly what it was.
  if (!generic) return <>{children}</>

  return <div className={playing ? "page-enter" : undefined}>{children}</div>
}
