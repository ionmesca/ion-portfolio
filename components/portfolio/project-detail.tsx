import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "./back-button";
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
    <div className="h-full w-full overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="flex gap-1">
          {prev ? (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-text-tertiary hover:text-text-primary"
            >
              <Link href={`/work/${prev.slug}`}>Prev</Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-text-muted"
            >
              Prev
            </Button>
          )}
          {next ? (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-text-tertiary hover:text-text-primary"
            >
              <Link href={`/work/${next.slug}`}>Next</Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-text-muted"
            >
              Next
            </Button>
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
        <h1 className="text-lg font-semibold text-text-primary">
          {project.title}
        </h1>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">
        {project.description}
      </p>

      {project.stats.length > 0 && (
        <div className="flex gap-3">
          {project.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 p-3.5 rounded-xl bg-bg-surface flex flex-col gap-1"
            >
              <span className="text-xl font-semibold text-text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-text-tertiary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-text-tertiary">
          Role
        </span>
        <span className="text-sm text-text-secondary">{project.role}</span>
      </div>

      {project.stack.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-text-tertiary">
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
    </div>
  );
}
