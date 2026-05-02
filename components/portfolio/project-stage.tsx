"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

export interface ProjectStageProps {
  /** Palette family. Defaults to 'ledgy'. */
  tint?: ProjectStageTint;
  /** Motion mode. 'active' = animated drift; 'frozen' = locked still frame. Defaults to 'active'. */
  motion?: ProjectStageMotion;
  /** Optional className for sizing/radius/etc. */
  className?: string;
  /** Optional content layered on top of the shader. */
  children?: ReactNode;
}

export function ProjectStage({ className, children }: ProjectStageProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
