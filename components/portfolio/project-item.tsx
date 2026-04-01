import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProjectItem({
  project,
  isActive,
}: {
  project: ProjectMeta;
  isActive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors cursor-pointer",
        isActive ? "bg-bg-surface" : "hover:bg-bg-surface/50"
      )}
    >
      <div
        className="size-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: project.iconBg }}
      >
        <Image
          src={project.icon}
          alt={project.title}
          width={16}
          height={16}
          className="size-4"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-text-primary truncate">
          {project.title}
        </div>
        <div className="text-[11px] text-text-tertiary truncate">
          {project.description}
        </div>
      </div>
      <span className="text-[11px] text-text-muted tabular-nums flex-shrink-0">
        {project.year}
      </span>
    </div>
  );
}
