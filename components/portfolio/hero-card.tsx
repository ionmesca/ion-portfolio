"use client";

import Image from "next/image";
import Link from "next/link";
import { usePortfolio } from "./portfolio-context";
import { ProjectStage, type ProjectStageMotion, type ProjectStageTint } from "./project-stage";
import type { ProjectMeta } from "@/lib/types";

function getProjectStageTint(project: ProjectMeta): ProjectStageTint {
  return project.slug === "beets" ? "beets" : "ledgy";
}

const PROJECT_STAGE_FRAMES: Record<string, number> = {
  beets: 48200,
  "ai-document-auditor": 114899.41599999536,
  "tranche-builder": 78400,
  ripple: 138600,
  "admin-home": 163200,
};

function ProjectStagePlaceholder({ project }: { project: ProjectMeta }) {
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

export function HeroCard({
  project,
  stageMotion = "frozen",
}: {
  project: ProjectMeta;
  stageMotion?: ProjectStageMotion;
}) {
  const { expandProject } = usePortfolio();
  const stageTint = getProjectStageTint(project);
  const stageFrame = PROJECT_STAGE_FRAMES[project.slug];

  return (
    <Link
      href={`/work/${project.slug}`}
      className="block group cursor-pointer"
      data-project={project.slug}
      onClick={(event) => {
        if (!window.matchMedia("(min-width: 768px)").matches) return;
        event.preventDefault();
        expandProject(project.slug);
      }}
    >
      <ProjectStage
        tint={stageTint}
        motion={stageMotion}
        frame={stageFrame}
        className="relative w-full aspect-[4/3] rounded-2xl bg-bg-surface"
      >
        <ProjectStagePlaceholder project={project} />
        <ProjectStageLabel project={project} />
      </ProjectStage>
    </Link>
  );
}
