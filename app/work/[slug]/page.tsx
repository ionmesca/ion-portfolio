import { notFound } from "next/navigation";
import {
  getAllProjects,
  getProjectBySlug,
  getAdjacentProjects,
} from "@/lib/projects";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
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
    <div className="flex h-screen">
      <Sidebar>
        <div className="flex flex-col gap-0.5">
          {projects.map((p) => (
            <a
              key={p.slug}
              href={`/work/${p.slug}`}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] ${
                p.slug === slug
                  ? "bg-bg-elevated font-medium text-text-primary"
                  : "text-text-tertiary hover:bg-bg-elevated/50"
              }`}
            >
              {p.title}
            </a>
          ))}
        </div>
      </Sidebar>
      <ProjectDetail project={meta} prev={prev} next={next} />
      <ProjectGallery project={meta} />
    </div>
  );
}
