import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ProjectMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content/work");

export function getAllProjects(): ProjectMeta[] {
  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => {
      const fullPath = path.join(CONTENT_DIR, name);
      return fs.statSync(fullPath).isDirectory();
    });

  const projects = slugs.map((slug) => {
    const filePath = path.join(CONTENT_DIR, slug, "index.mdx");
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return { ...data, slug } as ProjectMeta;
  });

  return projects.sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): {
  meta: ProjectMeta;
  content: string;
} | null {
  const filePath = path.join(CONTENT_DIR, slug, "index.mdx");
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { meta: { ...data, slug } as ProjectMeta, content };
}

export function getAdjacentProjects(
  slug: string
): { prev: ProjectMeta | null; next: ProjectMeta | null } {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  };
}
