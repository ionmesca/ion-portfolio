import { ProjectPanel } from "./project-panel";
import type { ProjectMeta } from "@/lib/types";

export function ProjectDetail({
  project,
  prev,
  next,
}: {
  project: ProjectMeta;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
}) {
  return <ProjectPanel project={project} prev={prev} next={next} showBack />;
}
