import { getAllProjects, getProjectBySlug, getAdjacentProjects } from "@/lib/projects";
import { CompactSidebar } from "@/components/portfolio/compact-sidebar";
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
  const projects = getAllProjects();

  return (
    <div
      className="hidden md:flex fixed z-40 bg-bg-base rounded-3xl overflow-hidden ring-1 ring-black/[0.06]"
      style={{
        top: '74px',
        left: '16px',
        right: '16px',
        bottom: '16px',
      }}
    >
      <CompactSidebar projects={projects} activeSlug={slug} />
      <ProjectDetail project={meta} prev={prev} next={next} />
      <ProjectGallery project={meta} />
    </div>
  );
}
