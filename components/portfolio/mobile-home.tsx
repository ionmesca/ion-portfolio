import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProjectStageCard } from "./project-stage-card";
import type { ProjectMeta } from "@/lib/types";

function displayYear(year: string) {
  return String(year).split("-")[0];
}

function ProjectIcon({ project, size = 40 }: { project: ProjectMeta; size?: 40 | 48 }) {
  return (
    <div
      className={
        size === 48
          ? "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-bg-elevated"
          : "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-bg-elevated"
      }
    >
      <Image
        src={project.icon}
        alt=""
        width={size}
        height={size}
        className="size-full object-cover"
      />
    </div>
  );
}

function MobileProjectPreview({ project }: { project: ProjectMeta }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block border-t border-border-subtle px-4 py-4 text-text-primary transition-colors duration-150 first:border-t-0 active:bg-bg-elevated/70"
    >
      <div className="relative overflow-hidden rounded-[18px] bg-bg-surface">
        <ProjectStageCard
          project={project}
          motion="frozen"
          playWhenVisible={false}
          showLabel={false}
          className="aspect-video"
        />
      </div>

      <div className="pt-3">
        <div className="flex items-start gap-3">
          <ProjectIcon project={project} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="truncate text-[18px] font-semibold leading-6 text-text-primary">
                {project.title}
              </h2>
              <span className="ml-auto inline-flex shrink-0 items-center gap-2 text-sm tabular-nums text-text-label">
                {displayYear(project.year)}
                <ArrowRight className="size-4 text-text-tertiary transition-transform duration-200 group-active:translate-x-0.5" />
              </span>
            </div>
            <p className="mt-0.5 text-[15px] leading-6 text-text-label">
              {project.subtitle}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MobileHome({ projects }: { projects: ProjectMeta[] }) {
  return (
    <main className="flex-1 overflow-y-auto pb-24 pt-1 md:hidden">
      <section className="px-4 pb-5 pt-2">
        <h1 className="text-lg font-semibold leading-6 text-text-primary">
          Lead Product Designer at Ledgy
        </h1>
        <p className="text-lg font-semibold leading-6 text-text-label">
          Building AI-native software for complex work
        </p>
      </section>

      <section
        aria-labelledby="mobile-projects-title"
        className="border-y border-border-subtle bg-bg-base"
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <h2
            id="mobile-projects-title"
            className="text-sm font-medium text-text-label"
          >
            Projects
          </h2>
        </div>
        {projects.map((project) => (
          <MobileProjectPreview key={project.slug} project={project} />
        ))}
      </section>
    </main>
  );
}
