import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:scale-95 active:duration-75 transition-all duration-[150ms]",
  {
    variants: {
      variant: {
        primary:
          "bg-white text-black hover:bg-white/90 shadow-[0_0_24px_rgba(255,255,255,0.15)]",
        secondary:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
        glass:
          "bg-white/5 backdrop-blur-xl text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
      },
      size: {
        sm: "h-8 px-4 text-sm",
        default: "h-10 px-6 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillButtonVariants> {
  asChild?: boolean;
}

const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        className={cn(pillButtonVariants({ variant, size, className }))}
        ref={ref}
        style={{ transitionTimingFunction: "var(--ease-spring)" }}
        data-testid={`pill-button-${variant}`}
        {...props}
      />
    );
  }
);
PillButton.displayName = "PillButton";

export { PillButton, pillButtonVariants };
