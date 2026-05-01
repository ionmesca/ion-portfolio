"use client";

import { usePortfolio } from "./portfolio-context";
import { ProjectPanel } from "./project-panel";

export function InlineProjectDetail() {
  const { expandedSlug, allProjects, collapseProject } = usePortfolio();

  const project = allProjects.find((p) => p.slug === expandedSlug);
  if (!project) return null;

  return <ProjectPanel project={project} onClose={collapseProject} />;
}
