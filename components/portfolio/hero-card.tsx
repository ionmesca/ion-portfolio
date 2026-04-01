import Image from "next/image";
import Link from "next/link";
import type { ProjectMeta } from "@/lib/types";

export function HeroCard({ project }: { project: ProjectMeta }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="block group"
      data-project={project.slug}
    >
      <div className="relative w-full aspect-[3/2] max-w-[1200px] rounded-xl overflow-hidden bg-bg-elevated">
        <Image
          src={project.hero}
          alt={`${project.title} hero`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 70vw"
        />
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: project.iconBg }}
            >
              <Image
                src={project.icon}
                alt=""
                width={14}
                height={14}
                className="size-3.5"
              />
            </div>
            <span className="text-[13px] font-medium text-white">
              {project.title}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
