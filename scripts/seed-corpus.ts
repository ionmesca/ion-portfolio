import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

type CorpusKind = "writing" | "tweet" | "tool" | "note" | "metric";

type CorpusChunk = {
  slug: string;
  kind: CorpusKind;
  title: string;
  body: string;
  tags: string[];
  sourceUrl?: string;
  projectSlug?: string;
  updatedAt: number;
};

const root = process.cwd();
const globalCorpusDir = path.join(root, "content/corpus/global");
const workDir = path.join(root, "content/work");

function chunkFromMarkdown(file: string, raw: string, fallbackSlug: string): CorpusChunk {
  const parsed = matter(raw);
  const slug = String(parsed.data.slug ?? fallbackSlug);

  return {
    slug,
    kind: parsed.data.kind ?? "writing",
    title: parsed.data.title ?? slug,
    body: parsed.content.trim(),
    tags: parsed.data.tags ?? [],
    sourceUrl: parsed.data.sourceUrl || undefined,
    projectSlug: parsed.data.projectSlug || undefined,
    updatedAt: parsed.data.updatedAt
      ? new Date(parsed.data.updatedAt).getTime()
      : Date.now(),
  };
}

function readGlobalCorpusChunks(): CorpusChunk[] {
  if (!fs.existsSync(globalCorpusDir)) {
    return [];
  }

  return fs
    .readdirSync(globalCorpusDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(globalCorpusDir, file), "utf8");
      return chunkFromMarkdown(file, raw, file.replace(/\.md$/, ""));
    });
}

function readProjectAgentChunks(): CorpusChunk[] {
  if (!fs.existsSync(workDir)) {
    return [];
  }

  return fs.readdirSync(workDir).flatMap((projectSlug): CorpusChunk[] => {
    const agentDir = path.join(workDir, projectSlug, "agent");
    if (!fs.existsSync(agentDir)) return [];

    return fs
      .readdirSync(agentDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const raw = fs.readFileSync(path.join(agentDir, file), "utf8");
        return chunkFromMarkdown(file, raw, `${projectSlug}-${file.replace(/\.md$/, "")}`);
      });
  });
}

function readProjectSpineChunks(): CorpusChunk[] {
  if (!fs.existsSync(workDir)) {
    return [];
  }

  return fs.readdirSync(workDir).flatMap((slug): CorpusChunk[] => {
    const filePath = path.join(workDir, slug, "index.mdx");
    if (!fs.existsSync(filePath)) return [];

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    if (parsed.data.published === false) return [];

    const body = [
      parsed.data.tagline,
      parsed.data.theBet,
      parsed.data.role?.title,
      parsed.data.role?.description,
      ...(parsed.data.stats ?? []).map(
        (stat: { value: string; label: string }) => `${stat.value} ${stat.label}`
      ),
      parsed.content,
    ]
      .filter(Boolean)
      .join("\n\n");

    return [
      {
        slug: `project-${slug}`,
        kind: "writing",
        title: parsed.data.title ?? slug,
        body,
        tags: ["project", ...(parsed.data.stack ?? [])],
        projectSlug: slug,
        updatedAt: Date.now(),
      },
    ];
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required.");
  }

  const chunks = [
    ...readProjectSpineChunks(),
    ...readProjectAgentChunks(),
    ...readGlobalCorpusChunks(),
  ].filter((chunk) => chunk.body.length > 0);

  if (chunks.length === 0) {
    console.warn("No chunks found to seed.");
    return;
  }

  const convex = new ConvexHttpClient(url);
  const result = await convex.mutation(api.agent.upsertCorpus, { chunks });
  console.log(`Seeded ${result.upserted} corpus chunks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
