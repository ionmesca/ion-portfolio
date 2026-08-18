/* ============================================================================
   MOTION — the spring shelf.

   Ion overturned the "no animation library" line for MICRO-INTERACTIONS on
   2026-08-18, pointing at interior.dev's snap carousel: "the animation around
   how the text appears and the bar moves". The Motion library (`motion/react`)
   is now allowed for text swaps, meters, indicators and carousels ONLY. The
   landed vanilla systems — the ⌘K zero-jump morph, the landing document-scroll
   wheel, the CSS hover lanes — are verified and STAY VANILLA.

   THE CONSTANTS ARE NOT INVENTED. They are interior.dev's own families, read
   from the shadcn registry payload https://www.interior.dev/r/snap-carousel.json
   (kept as reference only — see the report; it never entered the build path):

     CELL      stiffness 520  damping 34  mass 0.45   its pill indicator
     CROSSFADE stiffness 260  damping 34  mass 0.8    its slide scale/opacity
     WALL      stiffness 700  damping 30  mass 0.5    its rubber-band wall

   HOW THEY MAP HERE. The carousel splits its motion in two: the READOUT (the
   pill that reports which slide you are on) snaps on CELL, while the CONTENT
   (the slide itself) settles on CROSSFADE. The mobile indicator has exactly the
   same two halves, so it takes the same split:

     READOUT   the 2px progress meter and the "n / 5" counter   -> CELL
     CONTENT   the project name + year label                    -> CROSSFADE

   WALL is unused for now: nothing in this system rubber-bands. It is recorded
   so the third family does not get re-derived from scratch later.
   ========================================================================== */

export const SPRING_CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const

export const SPRING_CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const

export const SPRING_WALL = {
  type: "spring",
  stiffness: 700,
  damping: 30,
  mass: 0.5,
} as const

/**
 * The reduced-motion transition. Section 8 of globals.css collapses every CSS
 * transition on the page to 0.01ms; JS-driven motion has to make the same
 * promise itself. The ratified carve-out for a state swap is a 150ms opacity
 * crossfade in place — `--duration-fast`, no travel, no blur, no spring.
 */
export const REDUCED_CROSSFADE = { duration: 0.15, ease: "linear" } as const

/** Travel for a label swap, in px. See mobile-indicator.tsx for why it is 6. */
export const SWAP_TRAVEL = 6

/** The garnish blur, matching `--blur-garnish`. */
export const SWAP_BLUR = 2
