"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "@/app/providers/theme-provider";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

type Palette = readonly [string, string, string, string];

const PALETTES_LIGHT: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
  beets: ["#C5475F", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

const PALETTES_DARK: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#1A0B5E", "#1A0B5E", "#1A0B5E"],
  beets: ["#C5475F", "#2C0815", "#2C0815", "#2C0815"],
};

const FROZEN_FRAME: Record<ProjectStageTint, number> = {
  ledgy: 114899.41599999536,
  beets: 0,
};

const ACTIVE_PARAMS = {
  speed: 0.06,
  scale: 0.82,
  distortion: 0.58,
  swirl: 0.18,
  rotation: 10,
  offsetX: -0.08,
  offsetY: 0.03,
} as const;

export interface ProjectStageProps {
  tint?: ProjectStageTint;
  motion?: ProjectStageMotion;
  frame?: number;
  className?: string;
  children?: ReactNode;
}

export function ProjectStage({
  tint = "ledgy",
  motion = "active",
  frame,
  className,
  children,
}: ProjectStageProps) {
  const prefersReduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isFrozen = motion === "frozen" || prefersReduced === true;
  const colors = (isDark ? PALETTES_DARK : PALETTES_LIGHT)[tint];

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MeshGradient
        speed={isFrozen ? 0 : ACTIVE_PARAMS.speed}
        scale={ACTIVE_PARAMS.scale}
        distortion={ACTIVE_PARAMS.distortion}
        swirl={ACTIVE_PARAMS.swirl}
        rotation={ACTIVE_PARAMS.rotation}
        offsetX={ACTIVE_PARAMS.offsetX}
        offsetY={ACTIVE_PARAMS.offsetY}
        frame={isFrozen ? (frame ?? FROZEN_FRAME[tint]) : undefined}
        colors={colors as unknown as string[]}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
