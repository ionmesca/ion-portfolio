import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/* ----------------------------------------------------------------------------
   Motion — the hover-snap rule.

   motion-system-spec.md principle 5: hover states SNAP in (0ms) and ease out
   (150ms). The technique is lifted from docs/design/motion-lab.html, which sets
   `transition-duration: 0ms` on `:hover` so the in-transition is skipped while
   the out-transition still reads from the base rule.

   One deliberate refinement over the lab: the lab zeroes the duration for EVERY
   animated property on hover, which also kills the press spring on release
   (the pointer is still over the button when the finger lifts). Here the
   duration is a four-value list matched 1:1 to the property list, so only the
   three colour/shadow lanes snap. `transform` keeps its 150ms spring in both
   directions — press AND release.

   Written as arbitrary properties rather than Tailwind's `transition-*`
   shorthand on purpose: `transition-[...]` also emits its own duration and
   timing-function declarations, which would fight the explicit ones below.
   ------------------------------------------------------------------------- */
const BUTTON_MOTION = [
  "[transition-property:transform,background-color,box-shadow,color]",
  "[transition-duration:var(--duration-fast)]",
  "[transition-timing-function:var(--motion-spring),var(--motion-glide),var(--motion-glide),var(--motion-glide)]",
  "hover:[transition-duration:var(--duration-fast),0ms,0ms,0ms]",
].join(" ")

const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap",
    // Radius: the 12px slot. `rounded-md` = --radius-md = --radius * 0.8 = 12px.
    // Never a pill — see token-contract.md 3.4, rule 1.
    "rounded-md",
    "text-sm font-medium",
    // Icons: 16px, stroke 1.5 (token-contract.md 3.9). Stroke width is enforced
    // here as well as in lib/icons.ts so a bare lucide import can't slip a 2px
    // stroke into a button.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:[stroke-width:1.5]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
    BUTTON_MOTION,
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-subtle hover:bg-primary-hover [&_svg]:text-primary-foreground-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-subtle hover:bg-secondary-hover [&_svg]:text-muted-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-ghost-hover [&_svg]:text-muted-foreground",
      },
      size: {
        // 32px tall, 12px horizontal padding, 6px gap. Ratified metrics.
        default: "h-8 gap-1.5 px-3",
        // 40px tall — the touch target size. Same padding and gap.
        touch: "h-10 gap-1.5 px-3",
        // Icon-only: square, no padding, icon optically centred by the flex box.
        icon: "size-8",
        "icon-touch": "size-10",
      },
    },
    compoundVariants: [
      // On an icon-only button the icon IS the label, so it takes the label
      // colour instead of the de-emphasised icon colour.
      { size: "icon", className: "[&_svg]:text-current" },
      { size: "icon-touch", className: "[&_svg]:text-current" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
