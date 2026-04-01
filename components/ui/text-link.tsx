import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "relative inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors duration-200",
          "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out",
          "hover:after:origin-left hover:after:scale-x-100",
          "[&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
TextLink.displayName = "TextLink";

export { TextLink };
