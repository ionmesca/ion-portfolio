import { redirect } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
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
  redirect(`/#project-${slug}`);
}
