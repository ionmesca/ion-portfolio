import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The contract's custom type steps (globals.css @theme: --text-small 13,
// --text-subhead 15) are unknown to tailwind-merge, which mis-groups the
// bare classes as text COLOURS and silently drops them (or the real colour)
// when merged. Registering them in the font-size group fixes every cn()
// call site at the root.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-small", "text-subhead"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
