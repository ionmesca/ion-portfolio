"use client";

import Image from "next/image";
import { usePortfolio } from "./portfolio-context";
import { cn } from "@/lib/utils";

function displayYear(year: string) {
  return String(year).split("-")[0];
}

export function CompactProjectList() {
  const { allProjects, expandedSlug, expandProject } = usePortfolio();

  return (
    <div className="flex flex-col gap-1 px-3 pb-6">
      {allProjects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => expandProject(project.slug)}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left w-full",
            project.slug === expandedSlug
              ? "bg-bg-elevated text-text-primary font-medium"
              : "text-text-label hover:bg-bg-elevated/50"
          )}
        >
          <div className="size-5 overflow-hidden rounded-[4px] flex items-center justify-center flex-shrink-0 bg-bg-elevated">
            <Image src={project.icon} alt="" width={20} height={20} className="size-full object-cover" />
          </div>
          <span className="text-sm truncate">{project.title}</span>
          <span className="text-xs text-text-tertiary tabular-nums ml-auto flex-shrink-0">
            {displayYear(project.year)}
          </span>
        </button>
      ))}
    </div>
  );
}
