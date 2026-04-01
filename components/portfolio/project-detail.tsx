import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ProjectMeta } from "@/lib/types";

export function ProjectDetail({
  project,
  prev,
  next,
  children,
}: {
  project: ProjectMeta;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
  children?: React.ReactNode;
}) {
  return (
    <aside className="w-[360px] min-w-[360px] sticky top-0 h-screen overflow-y-auto border-r border-border-subtle p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          &larr; Back
        </Link>
        <div className="flex gap-3">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="text-[12px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              Prev
            </Link>
          ) : (
            <span className="text-[12px] text-text-muted">Prev</span>
          )}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="text-[12px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              Next
            </Link>
          ) : (
            <span className="text-[12px] text-text-muted">Next</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: project.iconBg }}
        >
          <Image src={project.icon} alt="" width={18} height={18} />
        </div>
        <h1 className="text-[17px] font-semibold text-text-primary">
          {project.title}
        </h1>
      </div>

      <p className="text-[13px] text-text-secondary leading-relaxed">
        {project.description}
      </p>

      {project.stats.length > 0 && (
        <div className="flex gap-3">
          {project.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 p-3.5 rounded-xl bg-bg-surface flex flex-col gap-1"
            >
              <span className="text-[20px] font-semibold text-text-primary">
                {stat.value}
              </span>
              <span className="text-[11px] text-text-tertiary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
          Role
        </span>
        <span className="text-[13px] text-text-secondary">{project.role}</span>
      </div>

      {project.stack.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
            Stack
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {project.stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </div>
      )}

      {children && (
        <div className="prose prose-sm prose-neutral mt-2">{children}</div>
      )}
    </aside>
  );
}
