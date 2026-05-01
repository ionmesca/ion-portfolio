"use client";

import { usePortfolio } from "./portfolio-context";
import { ProjectItem } from "./project-item";
import type { ProjectMeta } from "@/lib/types";

export function ProjectList({ projects }: { projects: ProjectMeta[] }) {
  const { activeSlug, expandedSlug, expandProject } = usePortfolio();
  const selectedSlug = expandedSlug ?? activeSlug;

  return (
    <div className="flex flex-col gap-1">
      {projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => expandProject(project.slug)}
          className="text-left w-full"
        >
          <ProjectItem
            project={project}
            isActive={selectedSlug === project.slug}
          />
        </button>
      ))}
    </div>
  );
}
