"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, FlaskConical, LayoutGrid, PenLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Snappy spring easing for micro-interactions
const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const navItems = [
  { label: "Home", icon: Home, path: "/", matchType: "exact" as const },
  { label: "Work", icon: Briefcase, path: "/work", matchType: "prefix" as const },
  { label: "Lab", icon: FlaskConical, path: "/lab", matchType: "prefix" as const },
  { label: "Stack", icon: LayoutGrid, path: "/stack", matchType: "exact" as const },
  { label: "Writing", icon: PenLine, path: "/writing", matchType: "prefix" as const },
  { label: "Agent", icon: Sparkles, path: "/agent", matchType: "exact" as const },
];

function isActive(
  pathname: string,
  path: string,
  matchType: "exact" | "prefix"
) {
  if (matchType === "exact") {
    return pathname === path;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function getActiveIndex(pathname: string): number {
  return navItems.findIndex((item) => isActive(pathname, item.path, item.matchType));
}

export function FloatingDock() {
  const pathname = usePathname();
  const activeIndex = getActiveIndex(pathname);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+32px)] px-4 pointer-events-none">
      <nav
        className={cn(
          "relative flex items-center rounded-full p-1.5",
          // Glassmorphism
          "bg-white/5 backdrop-blur-xl",
          // Border & shadow
          "border border-white/10",
          "shadow-lg shadow-black/20",
          "pointer-events-auto"
        )}
        style={{ gap: "var(--dock-gap)" }}
      >
        {/* Sliding active indicator with warm orange glow */}
        {activeIndex >= 0 && (
          <div
            className={cn(
              "absolute top-1.5 left-1.5 rounded-full",
              "bg-gradient-to-br from-white/12 to-[#ff9f6a]/8",
              "shadow-[0_0_16px_rgba(255,159,106,0.12)]"
            )}
            style={{
              width: "var(--dock-item-size)",
              height: "var(--dock-item-size)",
              transform: `translateX(calc(${activeIndex} * (var(--dock-item-size) + var(--dock-gap))))`,
              transition: `transform 300ms ${EASE_SPRING}`,
            }}
          />
        )}

        {navItems.map((item) => {
          const active = isActive(pathname, item.path, item.matchType);
          const Icon = item.icon;

          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  href={item.path}
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-full",
                    "active:scale-95 active:duration-75",
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  )}
                  style={{
                    width: "var(--dock-item-size)",
                    height: "var(--dock-item-size)",
                    transition: `all 150ms ${EASE_SPRING}`,
                  }}
                >
                  <Icon
                    className={cn(
                      "size-4 md:size-5",
                      active && "scale-105"
                    )}
                    style={{ transition: `all 150ms ${EASE_SPRING}` }}
                    strokeWidth={active ? 2 : 1.75}
                    fill={active ? "currentColor" : "none"}
                  />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
}
