import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectMedia } from "./project-media";
import type { Collaborator, ProjectMeta, Stat } from "@/lib/types";
import { cn } from "@/lib/utils";

type NarrativeSection = {
  title: string;
  blocks: string[];
};

const toolLabels: Record<string, string> = {
  figma: "Figma",
  storybook: "Storybook",
  typescript: "TypeScript",
  react: "React",
  nextdotjs: "Next.js",
  tailwindcss: "Tailwind CSS",
  vercel: "Vercel",
  convex: "Convex",
  linear: "Linear",
  notion: "Notion",
  github: "GitHub",
  slack: "Slack",
  n8n: "n8n",
  anthropic: "Claude Code",
  openai: "Codex / OpenAI",
  cursor: "Cursor",
  googlegemini: "Google Gemini",
};

const toolIcons = Object.fromEntries(
  Object.keys(toolLabels).map((id) => [id, `/projects/tools/${id}.svg`])
) as Record<string, string>;

const avatarClasses: Record<Collaborator["color"], string> = {
  1: "bg-[linear-gradient(135deg,#ff8b5e,#ff5e97)]",
  2: "bg-[linear-gradient(135deg,#66c5ff,#3b82f6)]",
  3: "bg-[linear-gradient(135deg,#a78bfa,#6d28d9)]",
  4: "bg-[linear-gradient(135deg,#34d399,#059669)]",
  5: "bg-[linear-gradient(135deg,#fbbf24,#d97706)]",
};

function displayYear(year: string) {
  return String(year).split("-")[0];
}

function formatStatValue(value: string) {
  const match = value.match(/^(.+?)(%)$/);
  if (!match) return value;

  return (
    <>
      {match[1]}
      <sup className="ml-px text-xs font-medium">{match[2]}</sup>
    </>
  );
}

function parseNarrativeSections(content: string): NarrativeSection[] {
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of content.split("\n")) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (current) sections.push(current);
      current = { title: heading[1], lines: [] };
      continue;
    }

    current?.lines.push(line);
  }

  if (current) sections.push(current);

  return sections
    .map((section) => ({
      title: section.title,
      blocks: section.lines
        .join("\n")
        .trim()
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean),
    }))
    .filter((section) => section.blocks.length > 0);
}

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderTextBlock(block: string, index: number) {
  const lines = block.split("\n").map((line) => line.trim());
  const isList = lines.every((line) => line.startsWith("- "));

  if (isList) {
    return (
      <ul key={index} className="space-y-2 pl-4 text-[15px] leading-7 text-text-secondary">
        {lines.map((line) => (
          <li key={line} className="list-disc">
            {line.replace(/^- /, "")}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={index} className="text-[15px] leading-7 text-text-secondary">
      {block.replace(/\n/g, " ")}
    </p>
  );
}

function ProjectMark({ project }: { project: ProjectMeta }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-bg-elevated">
      <Image
        src={project.icon}
        alt=""
        width={44}
        height={44}
        className="size-full object-cover"
      />
    </div>
  );
}

function StatGrid({ stats }: { stats: [Stat, Stat, Stat] }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border-subtle min-[390px]:grid-cols-3 min-[390px]:divide-x min-[390px]:divide-y-0">
      {stats.map((stat) => (
        <div key={stat.label} className="py-2.5 min-[390px]:px-3 min-[390px]:py-1">
          <div className="text-[22px] font-semibold leading-none text-text-primary">
            {formatStatValue(stat.value)}
          </div>
          <div className="mt-1.5 flex items-start gap-1 text-[13px] leading-5 text-text-label">
            <span>{stat.label}</span>
            {stat.icon === "bot" && (
              <Bot className="mt-0.5 size-3 shrink-0" aria-label="Agent-assisted" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AvatarStack({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <div className="flex shrink-0">
      {collaborators.map((collaborator, index) => (
        <div
          key={`${collaborator.initials}-${index}`}
          title={collaborator.label ?? collaborator.initials}
          className={cn(
            "relative flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-bg-base text-[10px] font-semibold tracking-[0.02em] text-white",
            index > 0 && "-ml-2",
            !collaborator.icon && avatarClasses[collaborator.color],
            collaborator.icon && "bg-bg-elevated text-text-secondary"
          )}
        >
          {collaborator.icon ? (
            <Image
              src={collaborator.icon}
              alt=""
              width={16}
              height={16}
              className="size-4 opacity-80"
            />
          ) : (
            collaborator.initials
          )}
        </div>
      ))}
    </div>
  );
}

function StackGrid({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((tool) => {
        const label = toolLabels[tool] ?? tool;
        const icon = toolIcons[tool];

        return (
          <div
            key={tool}
            className="flex min-h-10 items-center gap-2 rounded-xl bg-bg-elevated px-3 text-sm text-text-secondary"
          >
            {icon && (
              <Image
                src={icon}
                alt=""
                width={16}
                height={16}
                className="size-4 opacity-70"
              />
            )}
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MobileProjectHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-surface/90 px-3 py-2 backdrop-blur-md">
      <div className="flex h-10 items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-text-secondary transition-colors active:bg-bg-elevated"
        >
          <ArrowLeft className="size-4" />
          Projects
        </Link>
        <Link
          href="/agent"
          aria-label="Ask Ion's agent"
          className="inline-flex size-10 items-center justify-center rounded-full text-text-secondary transition-colors active:bg-bg-elevated"
        >
          <Bot className="size-4" />
        </Link>
      </div>
    </header>
  );
}

export function MobileProjectDetail({
  project,
  content,
  prev,
  next,
}: {
  project: ProjectMeta;
  content: string;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
}) {
  const [heroImage, ...galleryImages] = project.images;
  const narrativeSections = parseNarrativeSections(content).filter(
    (section) => sectionId(section.title) !== "the-bet"
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg-surface md:hidden">
      <MobileProjectHeader />

      <main className="flex-1 overflow-y-auto bg-bg-base">
        <article className="pb-24">
          <section className="px-4 pb-4 pt-4">
            <div className="flex items-start gap-3">
              <ProjectMark project={project} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-[22px] font-semibold leading-[1.12] text-text-primary">
                    {project.title}
                  </h1>
                  <span className="ml-auto shrink-0 text-sm tabular-nums text-text-label">
                    {displayYear(project.year)}
                  </span>
                </div>
                <p className="mt-1 text-base leading-6 text-text-label">
                  {project.subtitle}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[17px] font-medium leading-7 text-text-primary">
              {project.tagline}
            </p>
          </section>

          {heroImage && (
            <section className="px-3 pb-4">
              <ProjectMedia
                project={project}
                image={heroImage}
                sizes="100vw"
                className="shadow-none ring-0"
                plainAspectClass="aspect-[4/3]"
                comparisonAspectClass="aspect-[4/3]"
              />
            </section>
          )}

          <section className="border-t border-border-subtle px-4 py-3">
            <StatGrid stats={project.stats} />
          </section>

          <section className="border-t border-border-subtle px-4 py-4">
            <p className="typo-label mb-3 text-text-label">The bet</p>
            <p className="border-l border-text-primary pl-4 text-[15px] leading-7 text-text-primary">
              {project.theBet}
            </p>
          </section>

          <section className="border-t border-border-subtle px-4 py-4">
            <p className="typo-label mb-3 text-text-label">Role &amp; collaborators</p>
            <div className="flex items-center gap-3">
              <AvatarStack collaborators={project.collaborators} />
              <p className="text-[15px] leading-6 text-text-secondary">
                <strong className="font-semibold text-text-primary">
                  {project.role.title}
                </strong>
                {project.role.description ? ` ${project.role.description}` : ""}
              </p>
            </div>
          </section>

          <section className="border-t border-border-subtle px-4 py-4">
            <p className="typo-label mb-3 text-text-label">Stack</p>
            <StackGrid stack={project.stack} />
          </section>

          {narrativeSections.length > 0 && (
            <section className="border-t border-border-subtle">
              {narrativeSections.map((section) => (
                <section
                  key={section.title}
                  id={sectionId(section.title)}
                  className="border-b border-border-subtle px-4 py-4 last:border-b-0"
                >
                  <h2 className="mb-3 text-xl font-semibold leading-6 text-text-primary">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.blocks.map(renderTextBlock)}
                  </div>
                </section>
              ))}
            </section>
          )}

          {galleryImages.length > 0 && (
            <section
              className="border-t border-border-subtle px-3 py-4"
              aria-labelledby="gallery-title"
            >
              <h2 id="gallery-title" className="typo-label mb-3 px-1 text-text-label">
                Gallery
              </h2>
              <div className="space-y-4">
                {galleryImages.map((image) => (
                  <ProjectMedia
                    key={
                      image.type === "stage"
                        ? `stage-${project.slug}`
                        : image.type === "comparison"
                          ? image.alt
                          : image.src
                    }
                    project={project}
                    image={image}
                    sizes="100vw"
                    className="shadow-none ring-0"
                    plainAspectClass="aspect-[4/3]"
                    comparisonAspectClass="aspect-[4/3]"
                  />
                ))}
              </div>
            </section>
          )}

          {(prev || next) && (
            <nav
              className="grid grid-cols-2 border-t border-border-subtle"
              aria-label="Project navigation"
            >
              {prev ? (
                <Link
                  href={`/work/${prev.slug}`}
                  className="flex min-h-14 items-center gap-2 px-4 text-sm font-medium text-text-primary transition-colors active:bg-bg-elevated"
                >
                  <ChevronLeft className="size-4" />
                  <span className="truncate">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/work/${next.slug}`}
                  className="flex min-h-14 items-center justify-end gap-2 border-l border-border-subtle px-4 text-right text-sm font-medium text-text-primary transition-colors active:bg-bg-elevated"
                >
                  <span className="truncate">{next.title}</span>
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>
      </main>
    </div>
  );
}
