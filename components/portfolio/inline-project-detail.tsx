"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePortfolio } from "./portfolio-context";
import { Badge } from "@/components/ui/badge";

export function InlineProjectDetail() {
  const { expandedSlug, allProjects, collapseProject } = usePortfolio();

  // Escape key to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        collapseProject();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [collapseProject]);

  const project = allProjects.find((p) => p.slug === expandedSlug);
  if (!project) return null;

  return (
    <div className="h-full w-full overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.iconBg }}
          >
            <Image src={project.icon} alt="" width={18} height={18} />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">{project.title}</h1>
        </div>
        <button
          type="button"
          onClick={collapseProject}
          className="text-xs text-text-tertiary border border-border-default rounded-md px-2 py-1 hover:text-text-primary hover:border-border-strong transition-colors"
        >
          Esc
        </button>
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
