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
    <div
      className="hidden md:flex fixed z-40 bg-bg-base rounded-r-3xl overflow-hidden border-l border-bg-surface"
      style={{
        top: '74px',
        left: 'calc(16px + 432px)',
        right: '16px',
        bottom: '16px',
      }}
    >
      <ProjectDetail project={meta} prev={prev} next={next} />
      <ProjectGallery project={meta} />
    </div>
  );
}
