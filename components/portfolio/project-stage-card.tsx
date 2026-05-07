"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ProjectStage,
  type ProjectStageMotion,
  type ProjectStageTint,
} from "./project-stage";
import { useManagedVideoPlayback } from "./use-managed-video";
import { cn } from "@/lib/utils";
import type { ProjectMeta } from "@/lib/types";

export function getProjectStageTint(project: ProjectMeta): ProjectStageTint {
  return project.slug === "beets" ? "beets" : "ledgy";
}

const PROJECT_STAGE_FRAMES: Record<string, number> = {
  beets: 48200,
  "ai-document-auditor": 114899.41599999536,
  "tranche-builder": 78400,
  ripple: 138600,
  "admin-home": 163200,
};

function scheduleIdleVideoLoad(callback: () => void) {
  let cancelIdleLoad: (() => void) | undefined;
  const timeoutId = window.setTimeout(() => {
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
      cancelIdleLoad = () => window.cancelIdleCallback(idleId);
      return;
    }

    callback();
  }, 900);

  return () => {
    window.clearTimeout(timeoutId);
    cancelIdleLoad?.();
  };
}

function ProjectStagePlaceholder({
  project,
  playWhenVisible,
}: {
  project: ProjectMeta;
  playWhenVisible: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useManagedVideoPlayback(
    Boolean(project.heroVideo) && playWhenVisible && shouldLoadVideo
  );

  useEffect(() => {
    if (!project.heroVideo || !playWhenVisible || shouldLoadVideo) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelIdleLoad: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
        observer.disconnect();
        cancelIdleLoad = scheduleIdleVideoLoad(() => {
          setShouldLoadVideo(true);
        });
      },
      { threshold: [0, 0.35, 0.65, 1] }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelIdleLoad?.();
    };
  }, [playWhenVisible, project.heroVideo, shouldLoadVideo]);

  if (project.heroVideo) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          poster={project.heroVideo.poster}
          autoPlay={playWhenVisible && shouldLoadVideo}
          loop
          muted
          playsInline
          preload={shouldLoadVideo ? "metadata" : "none"}
          aria-label={project.heroVideo.alt}
        >
          {shouldLoadVideo && project.heroVideo.webm && (
            <source src={project.heroVideo.webm} type="video/webm" />
          )}
          {shouldLoadVideo && (
            <source src={project.heroVideo.src} type="video/mp4" />
          )}
        </video>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="rounded-xl bg-bg-base/78 px-5 py-3 text-sm font-medium text-text-muted shadow-card ring-1 ring-black/[0.06] backdrop-blur-xl">
        {project.title} Preview
      </div>
    </div>
  );
}

function ProjectStageLabel({ project }: { project: ProjectMeta }) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-5">
      <div className="absolute inset-x-0 -bottom-px h-56 opacity-[0.001] transition-opacity duration-200 ease-out will-change-[opacity] md:group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-t from-white/38 via-white/14 via-55% to-transparent dark:from-white/18 dark:via-white/6" />
        <div
          className="absolute inset-0 transform-gpu backdrop-blur-xl"
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, rgba(0,0,0,0.82) 30%, rgba(0,0,0,0.34) 66%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, rgba(0,0,0,0.82) 30%, rgba(0,0,0,0.34) 66%, transparent 100%)",
          }}
        />
      </div>
      <div className="relative flex items-center gap-3 opacity-100 transition-opacity duration-200 ease-out md:opacity-0 md:group-hover:opacity-100">
        <div className="size-8 overflow-hidden rounded-lg flex items-center justify-center bg-bg-base/86 shadow-card ring-1 ring-black/[0.06] backdrop-blur-xl">
          <Image
            src={project.icon}
            alt=""
            width={32}
            height={32}
            className="size-full object-cover"
          />
        </div>
        <span className="text-base font-semibold text-text-primary">
          {project.title}
        </span>
      </div>
    </div>
  );
}

export function ProjectStageCard({
  project,
  motion = "frozen",
  playWhenVisible = true,
  showLabel = true,
  className,
}: {
  project: ProjectMeta;
  motion?: ProjectStageMotion;
  playWhenVisible?: boolean;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <ProjectStage
      tint={getProjectStageTint(project)}
      motion={motion}
      frame={PROJECT_STAGE_FRAMES[project.slug]}
      renderShader={motion === "active" && !project.heroVideo}
      className={cn(
        showLabel && "group",
        "relative w-full rounded-2xl bg-bg-surface",
        className
      )}
    >
      <ProjectStagePlaceholder
        project={project}
        playWhenVisible={playWhenVisible}
      />
      {showLabel && <ProjectStageLabel project={project} />}
    </ProjectStage>
  );
}
