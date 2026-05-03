"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "@/app/providers/theme-provider";
import { useEffect, useState, type ReactNode } from "react";
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

function browserSupportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function getFallbackBackground(colors: Palette) {
  return [
    `radial-gradient(circle at 42% 48%, ${colors[1]} 0 24%, transparent 42%)`,
    `radial-gradient(circle at 34% 62%, ${colors[0]} 0 20%, transparent 50%)`,
    `linear-gradient(135deg, ${colors[0]} 0%, ${colors[2]} 52%, ${colors[3]} 100%)`,
  ].join(", ");
}

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
  const [supportsWebGL, setSupportsWebGL] = useState(false);
  const isDark = resolvedTheme === "dark";
  const isFrozen = motion === "frozen" || prefersReduced === true;
  const colors = (isDark ? PALETTES_DARK : PALETTES_LIGHT)[tint];

  useEffect(() => {
    setSupportsWebGL(browserSupportsWebGL());
  }, []);

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {supportsWebGL ? (
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
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: getFallbackBackground(colors) }}
        />
      )}
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
