"use client";

import { ProjectMedia } from "./project-media";
import { usePortfolio } from "./portfolio-context";

export function InlineProjectGallery() {
  const { expandedSlug, allProjects } = usePortfolio();

  const project = allProjects.find((p) => p.slug === expandedSlug);
  if (!project) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {project.images.map((image) => (
        <ProjectMedia
          key={
            image.type === "stage"
              ? `stage-${project.slug}`
              : image.type === "comparison"
                ? image.alt
                : image.src
          }
          project={project}
          image={image}
          sizes="60vw"
          plainAspectClass="aspect-[4/3]"
        />
      ))}
    </div>
  );
}
