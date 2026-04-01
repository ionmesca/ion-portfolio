"use client";

import Image from "next/image";
import { usePortfolio } from "./portfolio-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function InlineProjectDetail() {
  const { expandedSlug, allProjects, expandProject, collapseProject } = usePortfolio();

  const index = allProjects.findIndex((p) => p.slug === expandedSlug);
  const project = allProjects[index];
  if (!project) return null;

  const prev = index > 0 ? allProjects[index - 1] : null;
  const next = index < allProjects.length - 1 ? allProjects[index + 1] : null;

  return (
    <div className="w-[360px] min-w-[360px] h-full overflow-y-auto border-r border-border-subtle p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={collapseProject}
          className="text-text-tertiary hover:text-text-primary"
        >
          &larr; Back
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!prev}
            onClick={() => prev && expandProject(prev.slug)}
            className={prev ? "text-text-tertiary hover:text-text-primary" : "text-text-muted"}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!next}
            onClick={() => next && expandProject(next.slug)}
            className={next ? "text-text-tertiary hover:text-text-primary" : "text-text-muted"}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: project.iconBg }}
        >
          <Image src={project.icon} alt="" width={18} height={18} />
        </div>
        <h1 className="text-lg font-semibold text-text-primary">{project.title}</h1>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>

      {project.stats.length > 0 && (
        <div className="flex gap-3">
          {project.stats.map((stat) => (
            <div key={stat.label} className="flex-1 p-3.5 rounded-xl bg-bg-surface flex flex-col gap-1">
              <span className="text-xl font-semibold text-text-primary">{stat.value}</span>
              <span className="text-xs text-text-tertiary">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-text-tertiary">Role</span>
        <span className="text-sm text-text-secondary">{project.role}</span>
      </div>

      {project.stack.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-text-tertiary">Stack</span>
          <div className="flex gap-1.5 flex-wrap">
            {project.stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
