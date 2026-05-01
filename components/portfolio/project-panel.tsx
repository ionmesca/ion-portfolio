"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Collaborator, ProjectMeta, Stat } from "@/lib/types";

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

function ProjectMark({ project }: { project: ProjectMeta }) {
  return (
    <div className="flex size-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-bg-elevated shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]">
      <Image
        src={project.icon}
        alt=""
        width={38}
        height={38}
        className="size-full object-cover"
      />
    </div>
  );
}

function formatStatValue(value: string) {
  const match = value.match(/^(.+?)(%)$/);
  if (!match) return value;

  return (
    <>
      {match[1]}
      <sup className="ml-px text-xs font-medium tracking-normal">{match[2]}</sup>
    </>
  );
}

function StatBar({ stats }: { stats: [Stat, Stat, Stat] }) {
  return (
    <div className="relative mb-[22px] grid grid-cols-3 before:absolute before:bottom-2 before:left-1/3 before:top-2 before:w-px before:bg-border after:absolute after:bottom-2 after:left-2/3 after:top-2 after:w-px after:bg-border">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "min-w-0 px-3",
            index === 0 && "pl-0",
            index === stats.length - 1 && "pr-0"
          )}
        >
          <div className="mb-1 text-xl font-semibold leading-[1.05] tracking-[-0.02em] text-text-primary">
            {formatStatValue(stat.value)}
          </div>
          <div className="flex items-start gap-1 text-[11px] leading-[1.35] text-text-label">
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
            "relative flex size-[26px] items-center justify-center overflow-hidden rounded-full border-2 border-bg-base text-[9.5px] font-semibold tracking-[0.02em] text-white transition-transform duration-150 ease-in-out hover:z-10 hover:-translate-y-0.5",
            index > 0 && "-ml-[7px]",
            !collaborator.icon && avatarClasses[collaborator.color],
            collaborator.icon && "bg-bg-elevated text-text-secondary"
          )}
        >
          {collaborator.icon ? (
            <Image
              src={collaborator.icon}
              alt=""
              width={14}
              height={14}
              className="size-3.5 opacity-80"
            />
          ) : (
            collaborator.initials
          )}
        </div>
      ))}
    </div>
  );
}

function ToolIcon({ id }: { id: string }) {
  const label = toolLabels[id] ?? id;
  const icon = toolIcons[id];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group/tool flex size-8 items-center justify-center rounded-lg bg-bg-elevated text-text-secondary transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-bg-base hover:text-text-primary hover:shadow-[0_0_0_1px_var(--color-border-default),0_4px_10px_-4px_rgba(0,0,0,0.08)]">
          {icon && (
            <Image
              src={icon}
              alt=""
              width={16}
              height={16}
              className="size-4 opacity-70 transition-opacity duration-200 group-hover/tool:opacity-100"
            />
          )}
          <span className="sr-only">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="px-2 py-1 text-[11px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function ProjectPanel({
  project,
  onClose,
  prev,
  next,
  showBack = false,
  className,
}: {
  project: ProjectMeta;
  onClose?: () => void;
  prev?: ProjectMeta | null;
  next?: ProjectMeta | null;
  showBack?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (!onClose) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <Card
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
      className={cn(
        "group/project-panel relative h-full gap-0 overflow-hidden rounded-none border-0 bg-bg-base p-0 text-text-primary shadow-none before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(600px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,159,106,0.035),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col p-6 md:p-7">
        {showBack && (
          <div className="mb-5 flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <div className="flex gap-1">
              {prev && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/work/${prev.slug}`}>Prev</Link>
                </Button>
              )}
              {next && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/work/${next.slug}`}>Next</Link>
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mb-[18px] flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <ProjectMark project={project} />
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.018em] text-text-primary">
              {project.title}
            </h1>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-[26px] shrink-0 items-center justify-center rounded-[7px] border border-border bg-bg-base px-2.5 font-mono text-[11px] text-text-label shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
            >
              Esc
            </button>
          )}
        </div>

        <p className="mb-5 text-sm leading-6 text-text-subtitle">{project.tagline}</p>

        <StatBar stats={project.stats} />

        <div className="mb-[22px] rounded-r-lg border-l-2 border-text-primary bg-bg-elevated px-4 py-3.5">
          <p className="m-0 text-[13px] leading-5 text-text-primary">
            {project.theBet}
          </p>
        </div>

        <div className="mt-auto space-y-[22px] pt-3">
          <div>
            <p className="typo-label mb-2 text-text-label">Role &amp; collaborators</p>
            <div className="flex items-center gap-3">
              <AvatarStack collaborators={project.collaborators} />
              <p className="m-0 text-[12.5px] leading-[1.45] text-text-subtitle">
                <strong className="font-semibold text-text-primary">
                  {project.role.title}
                </strong>
                {project.role.description ? ` ${project.role.description}` : ""}
              </p>
            </div>
          </div>

          <div>
            <p className="typo-label mb-2 text-text-label">Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tool) => (
                <ToolIcon key={tool} id={tool} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
