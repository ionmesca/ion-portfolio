"use client";

import Image from "next/image";
import { usePortfolio } from "./portfolio-context";

export function InlineProjectGallery() {
  const { expandedSlug, allProjects } = usePortfolio();

  const project = allProjects.find((p) => p.slug === expandedSlug);
  if (!project) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {project.images.map((image) => (
        <div
          key={image.src}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bg-surface"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="60vw"
          />
        </div>
      ))}
    </div>
  );
}
