import { getProjectBySlug, getAdjacentProjects } from "@/lib/projects";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { notFound } from "next/navigation";

export default async function DetailPanel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getProjectBySlug(slug);
  if (!result) notFound();

  const { meta } = result;
  const { prev, next } = getAdjacentProjects(slug);

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="hidden md:block w-80 flex-shrink-0" />
      <div className="flex flex-1">
        <ProjectDetail project={meta} prev={prev} next={next} />
        <div className="hidden md:flex flex-1">
          <ProjectGallery project={meta} />
        </div>
      </div>
    </div>
  );
}
