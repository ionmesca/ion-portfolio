"use client";

import Image from "next/image";
import Link from "next/link";
import { usePortfolio } from "./portfolio-context";
import type { ProjectMeta } from "@/lib/types";

export function HeroCard({ project }: { project: ProjectMeta }) {
  const { expandProject } = usePortfolio();

  return (
    <>
      {/* Desktop: client-side expand */}
      <div
        className="hidden md:block group cursor-pointer"
        data-project={project.slug}
        onClick={() => expandProject(project.slug)}
      >
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bg-surface">
          <Image
            src={project.hero}
            alt={`${project.title} hero`}
            fill
            className="object-cover"
            sizes="70vw"
          />
          <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/40 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="size-6 overflow-hidden rounded-md flex items-center justify-center bg-bg-elevated">
                <Image src={project.icon} alt="" width={24} height={24} className="size-full object-cover" />
              </div>
              <span className="text-sm font-medium text-white">{project.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: navigate to standalone page */}
      <Link
        href={`/work/${project.slug}`}
        className="block md:hidden group"
        data-project={project.slug}
      >
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bg-surface">
          <Image
            src={project.hero}
            alt={`${project.title} hero`}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/40 to-transparent">
            <div className="flex items-center gap-2">
              <div className="size-6 overflow-hidden rounded-md flex items-center justify-center bg-bg-elevated">
                <Image src={project.icon} alt="" width={24} height={24} className="size-full object-cover" />
              </div>
              <span className="text-sm font-medium text-white">{project.title}</span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
