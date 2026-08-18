/**
 * The Motion DOM feature bundle, alone in its own module.
 *
 * This file exists so the bundler has something to split. `motion-provider.tsx`
 * reaches it through a dynamic `import()`, which is the only edge in the graph
 * that pulls `domAnimation` in — so the animation engine lands in its own chunk
 * and stays OUT of the landing route's first-load JS. Import it statically from
 * anywhere and that guarantee is gone.
 */
import { domAnimation } from "motion/react"

export default domAnimation
