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
        "flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer",
        isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
      )}
    >
      <div
        className="size-6 rounded-[6px] flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: project.iconBg }}
      >
        <Image
          src={project.icon}
          alt={project.title}
          width={14}
          height={14}
          className="size-3.5"
        />
      </div>
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-sm font-medium text-text-primary flex-shrink-0">
          {project.title}
        </span>
        <span className="text-sm text-text-label truncate">
          {project.description}
        </span>
      </div>
      <span className="text-sm text-text-label tabular-nums flex-shrink-0">
        {project.year}
      </span>
    </div>
  );
}
