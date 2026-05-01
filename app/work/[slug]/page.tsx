import { notFound } from "next/navigation";
import {
  getAllProjects,
  getProjectBySlug,
  getAdjacentProjects,
} from "@/lib/projects";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { ProjectItem } from "@/components/portfolio/project-item";
import { ProjectPanel } from "@/components/portfolio/project-panel";
import { ResizableRail } from "@/components/portfolio/resizable-rail";
import { Sidebar } from "@/components/portfolio/sidebar";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getProjectBySlug(slug);
  if (!result) return {};

  const { meta } = result;
  return {
    title: `${meta.title} — Ion Mesca`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} — Ion Mesca`,
      description: meta.description,
      images: [meta.hero],
    },
  };
}

export default async function ProjectPage({
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
    <>
      <div className="hidden h-screen md:flex">
        <Sidebar>
          <div className="flex flex-col gap-1">
            {projects.map((p) => (
              <a
                key={p.slug}
                href={`/work/${p.slug}`}
                className="block text-left"
              >
                <ProjectItem project={p} isActive={p.slug === slug} />
              </a>
            ))}
          </div>
        </Sidebar>
        <ResizableRail
          defaultWidth={360}
          hideBelowMd={false}
          minWidth={300}
          maxWidth={560}
          resizeLabel="Resize project details"
          storageKey="ion-portfolio-project-detail-width"
        >
          <ProjectDetail project={meta} prev={prev} next={next} />
        </ResizableRail>
        <ProjectGallery project={meta} />
      </div>

      <div className="min-h-screen bg-bg-surface md:hidden">
        <ProjectPanel
          project={meta}
          prev={prev}
          next={next}
          showBack
          className="h-auto border-b border-border-subtle"
        />
        <ProjectGallery project={meta} />
      </div>
    </>
  );
}
