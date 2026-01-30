import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Section({ children, className, fullWidth = false }: SectionProps) {
  return (
    <section
      className={cn(
        "py-12 md:py-16",
        !fullWidth && "max-w-4xl mx-auto px-6",
        className
      )}
    >
      {children}
    </section>
  );
}

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mb-4",
        "text-xs uppercase tracking-widest text-white/40",
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-[#ff9f6a]" />
      {children}
    </div>
  );
}

interface SectionHeadlineProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeadline({
  children,
  className,
  as: Component = "h2",
}: SectionHeadlineProps) {
  return (
    <Component
      className={cn(
        "text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white",
        "mb-6",
        className
      )}
    >
      {children}
    </Component>
  );
}

interface SectionBodyProps {
  children: ReactNode;
  className?: string;
}

export function SectionBody({ children, className }: SectionBodyProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        "text-base md:text-lg leading-relaxed text-white/60",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionActionsProps {
  children: ReactNode;
  className?: string;
}

export function SectionActions({ children, className }: SectionActionsProps) {
  return (
    <div className={cn("flex items-center gap-4 mt-8", className)}>
      {children}
    </div>
  );
}
