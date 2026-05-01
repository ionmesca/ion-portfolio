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
        "flex min-h-12 items-center gap-2 rounded-xl px-2 py-2 transition-colors cursor-pointer",
        isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
      )}
    >
      <div
        className="size-7 rounded-[7px] flex items-center justify-center flex-shrink-0"
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
        <span className="block truncate text-[13px] font-medium leading-4 text-text-primary">
          {project.title}
        </span>
        <span className="block truncate text-[13px] leading-4 text-text-label">
          {project.description}
        </span>
      </div>
      <span className="text-sm text-text-label tabular-nums flex-shrink-0">
        {project.year}
      </span>
    </div>
  );
}
