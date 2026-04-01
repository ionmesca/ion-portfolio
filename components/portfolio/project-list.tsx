"use client";

import { usePortfolio } from "./portfolio-context";
import { ProjectItem } from "./project-item";
import type { ProjectMeta } from "@/lib/types";

export function ProjectList({ projects }: { projects: ProjectMeta[] }) {
  const { activeSlug, scrollToProject } = usePortfolio();

  return (
    <div className="flex flex-col gap-0.5">
      {projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => scrollToProject(project.slug)}
          className="text-left w-full"
        >
          <ProjectItem
            project={project}
            isActive={activeSlug === project.slug}
          />
        </button>
      ))}
    </div>
  );
}
