import { ProjectMedia } from "./project-media";
import type { ProjectMeta } from "@/lib/types";

export function ProjectGallery({ project }: { project: ProjectMeta }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
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
          sizes="(max-width: 768px) 100vw, 60vw"
          className="max-w-[1200px]"
        />
      ))}
    </div>
  );
}
