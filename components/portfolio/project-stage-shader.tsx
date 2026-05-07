"use client";

import { MeshGradient } from "@paper-design/shaders-react";

type ProjectStageShaderProps = {
  speed: number;
  scale: number;
  distortion: number;
  swirl: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  frame?: number;
  colors: string[];
};

export function ProjectStageShader(props: ProjectStageShaderProps) {
  return (
    <MeshGradient
      {...props}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
