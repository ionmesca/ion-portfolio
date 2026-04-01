import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";

export function ProjectGallery({ project }: { project: ProjectMeta }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
      {project.images.map((image) => (
        <div
          key={image.src}
          className="relative w-full aspect-[3/2] max-w-[1200px] rounded-xl overflow-hidden bg-bg-elevated"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      ))}
    </div>
  );
}
