import { notFound } from "next/navigation";
import {
  getAdjacentProjects,
  getAllProjects,
  getProjectBySlug,
} from "@/lib/projects";
import { MobileProjectDetail } from "@/components/portfolio/mobile-project-detail";
import { NavBar } from "@/components/portfolio/nav-bar";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
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
    title: `${meta.title} - Ion Mesca`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} - Ion Mesca`,
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

  const { meta, content } = result;
  const { prev, next } = getAdjacentProjects(slug);

  return (
    <>
      <MobileProjectDetail
        project={meta}
        content={content}
        prev={prev}
        next={next}
      />

      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        <NavBar />
        <div className="mx-4 mb-4 flex min-h-0 flex-1 overflow-hidden rounded-3xl bg-bg-base shadow-card ring-1 ring-black/[0.06]">
          <div className="w-[380px] shrink-0 border-r border-border-subtle">
            <ProjectDetail project={meta} prev={prev} next={next} />
          </div>
          <ProjectGallery project={meta} />
        </div>
      </div>
    </>
  );
}
