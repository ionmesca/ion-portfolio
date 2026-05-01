import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

function displayYear(year: string) {
  return String(year).split("-")[0];
}

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
      <div className="size-7 overflow-hidden rounded-[7px] flex items-center justify-center flex-shrink-0 bg-bg-elevated">
        <Image
          src={project.icon}
          alt={project.title}
          width={28}
          height={28}
          className="size-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block truncate text-[13px] font-medium leading-4 text-text-primary">
          {project.title}
        </span>
        <span className="block truncate text-[13px] leading-4 text-text-label">
          {project.subtitle}
        </span>
      </div>
      <span className="text-sm text-text-label tabular-nums flex-shrink-0">
        {displayYear(project.year)}
      </span>
    </div>
  );
}
