import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContentAreaProps {
  children: ReactNode;
  className?: string;
  /** When true, content spans full width. Individual sections control their own constraints. */
  fullWidth?: boolean;
}

export function ContentArea({
  children,
  className,
  fullWidth = true,
}: ContentAreaProps) {
  return (
    <div
      className={cn(
        fullWidth ? "w-full" : "max-w-5xl mx-auto px-6 md:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
