import Image from "next/image";
import Link from "next/link";
import type { ProjectMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CompactSidebar({
  projects,
  activeSlug,
}: {
  projects: ProjectMeta[];
  activeSlug: string;
}) {
  return (
    <aside className="w-[220px] min-w-[220px] h-full flex-col border-r border-border-subtle hidden md:flex">
      <div className="px-4 py-6">
        <span className="text-sm font-medium text-text-label">
          Projects
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="flex flex-col gap-1">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-sm",
                project.slug === activeSlug
                  ? "bg-bg-elevated font-medium text-text-primary"
                  : "text-text-label hover:bg-bg-elevated/50"
              )}
            >
              <div
                className="size-5 rounded-[4px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.iconBg }}
              >
                <Image
                  src={project.icon}
                  alt=""
                  width={12}
                  height={12}
                  className="size-3"
                />
              </div>
              <span className="truncate">{project.title}</span>
              <span className="text-xs text-text-tertiary tabular-nums ml-auto flex-shrink-0">
                {project.year}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
