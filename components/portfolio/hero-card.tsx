"use client";

import Link from "next/link";
import { usePortfolio } from "./portfolio-context";
import { ProjectStageCard } from "./project-stage-card";
import type { ProjectStageMotion } from "./project-stage";
import type { ProjectMeta } from "@/lib/types";

export function HeroCard({
  project,
  stageMotion = "frozen",
  playWhenVisible = true,
}: {
  project: ProjectMeta;
  stageMotion?: ProjectStageMotion;
  playWhenVisible?: boolean;
}) {
  const { expandProject, expandedSlug } = usePortfolio();

  return (
    <Link
      href={`/#project-${project.slug}`}
      className="block group cursor-pointer"
      data-project={project.slug}
      onClick={(event) => {
        event.preventDefault();
        expandProject(project.slug);
      }}
    >
      <ProjectStageCard
        project={project}
        motion={stageMotion}
        playWhenVisible={playWhenVisible && expandedSlug === null}
        className={project.heroVideo ? "aspect-video" : "aspect-[4/3]"}
      />
    </Link>
  );
}
