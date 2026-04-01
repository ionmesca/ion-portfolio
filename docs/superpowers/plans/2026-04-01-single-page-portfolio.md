# Single-Page Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page portfolio with a two-panel layout — sticky sidebar with identity/project list, scrollable hero timeline, and an expand view via intercepting routes.

**Architecture:** Next.js App Router with server components by default. Client islands only for scroll spy and interactive list. MDX for project content. Intercepting routes for inline project expansion with proper metadata. Semantic design tokens for light mode using Tailwind neutral scale.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (radix base, new-york style), MDX, Aeonik Pro font.

**Spec:** `docs/superpowers/specs/2026-04-01-single-page-portfolio-design.md`

---

## File Map

```
lib/
  projects.ts                              # MDX loader — reads frontmatter, returns ProjectMeta[]
  types.ts                                 # ProjectMeta type definition

content/work/
  ledgy/index.mdx                          # Ledgy project placeholder
  beets/index.mdx                          # Beets project placeholder

components/portfolio/
  identity.tsx                             # Avatar + name + role (server)
  social-links.tsx                         # GitHub, LinkedIn, X icons (server)
  sidebar.tsx                              # Fixed left panel shell (server)
  project-item.tsx                         # Single list row — icon, name, desc, year (server)
  project-list.tsx                         # Interactive list with active state (client)
  hero-card.tsx                            # Single hero image card (server)
  timeline.tsx                             # Scrollable hero cards with scroll spy (client)
  project-detail.tsx                       # Expanded detail panel (server)
  project-gallery.tsx                      # Expanded image gallery (server)

hooks/
  use-scroll-spy.ts                        # IntersectionObserver hook (rewrite existing)

app/
  layout.tsx                               # Simplified root layout (rewrite)
  page.tsx                                 # Landing — timeline view (rewrite)
  @detail/
    default.tsx                            # Parallel route fallback (returns null)
    (.)work/[slug]/
      page.tsx                             # Intercepting route — inline detail panel
  work/
    [slug]/
      page.tsx                             # Standalone project page + generateMetadata

app/globals.css                            # Light-mode token update (modify)
```

---

### Task 1: Cleanup — Remove Old Layout Components

**Files:**
- Delete: `components/layout/app-shell.tsx`
- Delete: `components/layout/floating-dock.tsx`
- Delete: `components/layout/header.tsx`
- Delete: `components/layout/content-area.tsx`
- Delete: `components/layout/index.ts`
- Delete: `components/layout/split-layout.tsx`
- Delete: `components/case-study/` (all 5 files)
- Delete: `components/patterns/feature-grid.tsx`
- Delete: `components/patterns/hero.tsx`
- Delete: `app/case-study-demo/` (entire directory)
- Delete: `lib/route-config.ts`
- Delete: `app/work/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Delete old layout files**

```bash
rm components/layout/app-shell.tsx
rm components/layout/floating-dock.tsx
rm components/layout/header.tsx
rm components/layout/content-area.tsx
rm components/layout/index.ts
rm components/layout/split-layout.tsx
rm -rf components/case-study
rm components/patterns/feature-grid.tsx
rm components/patterns/hero.tsx
rm -rf app/case-study-demo
rm lib/route-config.ts
rm app/work/page.tsx
```

- [ ] **Step 2: Simplify root layout**

Rewrite `app/layout.tsx` — remove AppShell, remove ConvexClientProvider, keep ThemeProvider:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "./providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ion Mesca — Design Engineer",
  description: "Design engineer building interfaces for AI products",
};

export default function RootLayout({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg-base text-text-primary">
        <ThemeProvider>
          {children}
          {detail}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: The `detail` prop is the parallel route slot (`@detail`). It renders `null` by default and shows the intercepted project detail when navigating to `/work/[slug]`.

- [ ] **Step 3: Verify build passes**

```bash
bun run build
```

Expected: build succeeds (pages that import deleted components will error — fix by replacing `app/page.tsx` with a minimal placeholder):

```tsx
// app/page.tsx (temporary)
export default function Home() {
  return <div>Portfolio — rebuilding</div>;
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old layout components and simplify root layout"
```

---

### Task 2: Design Tokens — Light Mode

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Update semantic tokens to light mode**

In `app/globals.css`, find the `@theme inline` block and replace the dark-mode color values with light-mode neutral scale values. Keep dark values in a `.dark` selector for future use.

Replace the color section inside `@theme inline { ... }`:

```css
  /* ----------------------------------------
     LIGHT THEME (default)
     ---------------------------------------- */

  /* Backgrounds */
  --color-bg-base: #ffffff;
  --color-bg-surface: #fafafa;
  --color-bg-elevated: #f5f5f5;
  --color-bg-glass: rgba(0, 0, 0, 0.02);

  /* Text */
  --color-text-primary: #171717;
  --color-text-secondary: #525252;
  --color-text-tertiary: #a3a3a3;
  --color-text-muted: #d4d4d4;

  /* Accent */
  --color-accent: #ff9f6a;
  --color-accent-soft: rgba(255, 159, 106, 0.1);
  --color-accent-hover: #ff8c4a;

  /* Borders */
  --color-border-default: #e5e5e5;
  --color-border-subtle: #f0f0f0;
  --color-border-strong: #d4d4d4;
```

Also add a `.dark` block after the `@theme inline` to preserve dark values:

```css
.dark {
  --color-bg-base: #000000;
  --color-bg-surface: #0a0a0a;
  --color-bg-elevated: #141414;
  --color-bg-glass: rgba(255, 255, 255, 0.03);
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #666666;
  --color-text-muted: #404040;
  --color-accent: #ff9f6a;
  --color-accent-soft: rgba(255, 159, 106, 0.2);
  --color-accent-hover: #ffb88a;
  --color-border-default: #1a1a1a;
  --color-border-subtle: #111111;
  --color-border-strong: #333333;
}
```

- [ ] **Step 2: Verify tokens render correctly**

```bash
bun run dev -p 3005
```

Open `http://localhost:3005` — the page should have a white background with dark text.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: switch semantic tokens to light-mode neutral scale"
```

---

### Task 3: Types and MDX Data Layer

**Files:**
- Create: `lib/types.ts`
- Create: `lib/projects.ts`
- Create: `content/work/ledgy/index.mdx`
- Create: `content/work/beets/index.mdx`

- [ ] **Step 1: Create the ProjectMeta type**

```typescript
// lib/types.ts
export type ProjectMeta = {
  title: string;
  slug: string;
  description: string;
  year: number;
  icon: string;
  iconBg: string;
  hero: string;
  stats: { value: string; label: string }[];
  role: string;
  collaborators: { name: string; avatar: string }[];
  stack: string[];
  images: { src: string; alt: string }[];
  order: number;
};
```

- [ ] **Step 2: Create the MDX loader**

This reads frontmatter from all project MDX files and returns sorted `ProjectMeta[]`. Uses `gray-matter` (already installed).

```typescript
// lib/projects.ts
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
```

- [ ] **Step 3: Create Ledgy MDX placeholder**

```mdx
---
title: Ledgy Dashboards
slug: ledgy
description: Equity management platform
year: 2026
icon: /projects/ledgy-logo.svg
iconBg: "#1B2A4A"
hero: /projects/ledgy-hero.png
stats:
  - value: "40%"
    label: "faster workflows"
  - value: "12"
    label: "screens shipped"
role: Lead Design Engineer
collaborators: []
stack:
  - React
  - TypeScript
  - D3.js
images:
  - src: /projects/ledgy-hero.png
    alt: Dashboard overview
order: 1
---

## The Challenge

Placeholder content for the detailed writeup. This will be replaced with the real case study.

## The Approach

Placeholder content describing the design and engineering process.

## The Outcome

Placeholder content with results and learnings.
```

Save to `content/work/ledgy/index.mdx`.

- [ ] **Step 4: Create Beets MDX placeholder**

```mdx
---
title: Beets
slug: beets
description: Recipe app for your agents
year: 2025
icon: /projects/beets-logo.svg
iconBg: "#5C1A2E"
hero: /projects/beets-hero.png
stats:
  - value: "500+"
    label: "recipes indexed"
  - value: "AI"
    label: "powered search"
role: Design Engineer
collaborators: []
stack:
  - Next.js
  - Convex
  - AI SDK
images:
  - src: /projects/beets-hero.png
    alt: Beets app overview
order: 2
---

## The Challenge

Placeholder content for the detailed writeup.

## The Approach

Placeholder content describing the design and engineering process.

## The Outcome

Placeholder content with results and learnings.
```

Save to `content/work/beets/index.mdx`.

- [ ] **Step 5: Create placeholder hero images**

Generate simple colored placeholder PNGs (or use solid-color SVGs as placeholders):

```bash
# Create simple SVG placeholders that will be swapped for real images later
cat > public/projects/ledgy-hero.svg << 'EOF'
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="800" fill="#f5f5f5" rx="12"/>
  <text x="600" y="400" text-anchor="middle" fill="#d4d4d4" font-family="sans-serif" font-size="24">Ledgy Dashboard Preview</text>
</svg>
EOF

cat > public/projects/beets-hero.svg << 'EOF'
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="800" fill="#f5f5f5" rx="12"/>
  <text x="600" y="400" text-anchor="middle" fill="#d4d4d4" font-family="sans-serif" font-size="24">Beets App Preview</text>
</svg>
EOF
```

Update the MDX frontmatter `hero` fields to point to `.svg` instead of `.png`:
- Ledgy: `hero: /projects/ledgy-hero.svg`
- Beets: `hero: /projects/beets-hero.svg`

- [ ] **Step 6: Verify data loading**

Add a temporary test in `app/page.tsx`:

```tsx
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  const projects = getAllProjects();
  return (
    <pre className="p-8 text-sm">
      {JSON.stringify(projects, null, 2)}
    </pre>
  );
}
```

Run `bun run dev -p 3005`, open `http://localhost:3005`, verify both projects render as JSON.

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/projects.ts content/work/ public/projects/
git commit -m "feat: add MDX data layer with project types and placeholder content"
```

---

### Task 4: Sidebar Components — Identity, Social Links, Project Item

**Files:**
- Create: `components/portfolio/identity.tsx`
- Create: `components/portfolio/social-links.tsx`
- Create: `components/portfolio/project-item.tsx`

- [ ] **Step 1: Create Identity component**

```tsx
// components/portfolio/identity.tsx
import Image from "next/image";

export function Identity() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Image
          src="/ion.jpeg"
          alt="Ion Mesca"
          width={36}
          height={36}
          className="rounded-full"
          priority
        />
        <span className="text-[15px] font-semibold text-text-primary">
          Ion Mesca
        </span>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        Design engineer building interfaces for AI products. Previously at
        Ledgy.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create SocialLinks component**

```tsx
// components/portfolio/social-links.tsx
const links = [
  {
    label: "GitHub",
    href: "https://github.com/ionmesca",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ion-mesca/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/jonnyacsem",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors"
          aria-label={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create ProjectItem component**

```tsx
// components/portfolio/project-item.tsx
import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProjectItem({
  project,
  isActive,
}: {
  project: ProjectMeta;
  isActive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors cursor-pointer",
        isActive ? "bg-bg-surface" : "hover:bg-bg-surface/50"
      )}
    >
      <div
        className="size-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: project.iconBg }}
      >
        <Image
          src={project.icon}
          alt={project.title}
          width={16}
          height={16}
          className="size-4"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-text-primary truncate">
          {project.title}
        </div>
        <div className="text-[11px] text-text-tertiary truncate">
          {project.description}
        </div>
      </div>
      <span className="text-[11px] text-text-muted tabular-nums flex-shrink-0">
        {project.year}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/portfolio/
git commit -m "feat: add sidebar components — identity, social links, project item"
```

---

### Task 5: Sidebar Shell and Hero Card

**Files:**
- Create: `components/portfolio/sidebar.tsx`
- Create: `components/portfolio/hero-card.tsx`

- [ ] **Step 1: Create Sidebar shell**

```tsx
// components/portfolio/sidebar.tsx
import { Identity } from "./identity";
import { SocialLinks } from "./social-links";
import type { ProjectMeta } from "@/lib/types";

export function Sidebar({
  projects,
  children,
}: {
  projects: ProjectMeta[];
  children: React.ReactNode; // ProjectList (client) goes here
}) {
  return (
    <aside className="w-80 min-w-80 sticky top-0 h-screen flex flex-col border-r border-border-subtle">
      <div className="flex items-center justify-between px-6 py-4">
        <Identity />
        <SocialLinks />
      </div>
      <div className="px-6 py-2">
        <span className="text-[12px] font-medium text-text-tertiary">
          Projects
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6">{children}</nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create HeroCard component**

```tsx
// components/portfolio/hero-card.tsx
import Image from "next/image";
import Link from "next/link";
import type { ProjectMeta } from "@/lib/types";

export function HeroCard({ project }: { project: ProjectMeta }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="block group"
      data-project={project.slug}
    >
      <div className="relative w-full aspect-[3/2] max-w-[1200px] rounded-xl overflow-hidden bg-bg-elevated">
        <Image
          src={project.hero}
          alt={`${project.title} hero`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 70vw"
        />
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: project.iconBg }}
            >
              <Image
                src={project.icon}
                alt=""
                width={14}
                height={14}
                className="size-3.5"
              />
            </div>
            <span className="text-[13px] font-medium text-white">
              {project.title}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/sidebar.tsx components/portfolio/hero-card.tsx
git commit -m "feat: add sidebar shell and hero card components"
```

---

### Task 6: Scroll Spy Hook and Client Islands

**Files:**
- Rewrite: `hooks/use-scroll-spy.ts`
- Create: `components/portfolio/project-list.tsx`
- Create: `components/portfolio/timeline.tsx`

- [ ] **Step 1: Rewrite useScrollSpy hook**

```typescript
// hooks/use-scroll-spy.ts
"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollSpy(slugs: string[]) {
  const [activeSlug, setActiveSlug] = useState<string>(slugs[0] ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).dataset.project;
            if (slug) setActiveSlug(slug);
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    const cards = container.querySelectorAll("[data-project]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [slugs]);

  const scrollToProject = (slug: string) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector(`[data-project="${slug}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { activeSlug, containerRef, scrollToProject };
}
```

- [ ] **Step 2: Create ProjectList client component**

```tsx
// components/portfolio/project-list.tsx
"use client";

import Link from "next/link";
import { ProjectItem } from "./project-item";
import type { ProjectMeta } from "@/lib/types";

export function ProjectList({
  projects,
  activeSlug,
  onProjectClick,
}: {
  projects: ProjectMeta[];
  activeSlug: string;
  onProjectClick: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => onProjectClick(project.slug)}
          className="text-left w-full"
        >
          <ProjectItem
            project={project}
            isActive={activeSlug === project.slug}
          />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create Timeline client component**

```tsx
// components/portfolio/timeline.tsx
"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { HeroCard } from "./hero-card";
import { ProjectList } from "./project-list";
import { Sidebar } from "./sidebar";
import type { ProjectMeta } from "@/lib/types";

export function Timeline({ projects }: { projects: ProjectMeta[] }) {
  const slugs = projects.map((p) => p.slug);
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);

  return (
    <div className="flex h-screen">
      <Sidebar projects={projects}>
        <ProjectList
          projects={projects}
          activeSlug={activeSlug}
          onProjectClick={scrollToProject}
        />
      </Sidebar>
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
      >
        {projects.map((project) => (
          <HeroCard key={project.slug} project={project} />
        ))}
      </main>
    </div>
  );
}
```

Note: The `Timeline` is a client component because it manages scroll spy state. But `Sidebar`, `HeroCard`, and `ProjectItem` are server components passed as children/rendered inside — they still get server-rendered and passed as serialized React elements.

Wait — `Sidebar` accepts `children` (the client `ProjectList`), but `Sidebar` itself is imported in a client component (`Timeline`). This means `Sidebar` will be treated as a client component too. To preserve the RSC boundary, restructure: the **page** (server component) should compose the layout, passing server-rendered sidebar content and the client timeline as separate props.

Let me revise. Delete the above `Timeline` and replace with a simpler approach:

```tsx
// components/portfolio/timeline.tsx
"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import type { ProjectMeta } from "@/lib/types";
import type { ReactNode } from "react";

export function TimelineScroller({
  projects,
  children,
  renderList,
}: {
  projects: ProjectMeta[];
  children: ReactNode; // Server-rendered hero cards
  renderList: (activeSlug: string, onProjectClick: (slug: string) => void) => ReactNode;
}) {
  const slugs = projects.map((p) => p.slug);
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);

  return (
    <>
      {renderList(activeSlug, scrollToProject)}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
      >
        {children}
      </main>
    </>
  );
}
```

Actually, render props cross the RSC boundary. Let me use the simplest correct pattern — the page server component composes the layout, and the client component just manages scroll state:

```tsx
// components/portfolio/timeline.tsx
"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import type { ProjectMeta } from "@/lib/types";

export function useTimeline(projects: ProjectMeta[]) {
  const slugs = projects.map((p) => p.slug);
  return useScrollSpy(slugs);
}
```

No — hooks can't be used from server components. The correct approach is to make the `Timeline` a client wrapper that receives server-rendered children:

```tsx
// components/portfolio/timeline.tsx
"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import type { ProjectMeta } from "@/lib/types";
import type { ReactNode } from "react";

export function Timeline({
  slugs,
  sidebar,
  children,
}: {
  slugs: string[];
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);

  return (
    <div className="flex h-screen" data-active-slug={activeSlug}>
      {sidebar}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
      >
        {children}
      </main>
    </div>
  );
}
```

And `ProjectList` reads the active slug from a shared context or data attribute. Let me use a lightweight context:

```tsx
// components/portfolio/portfolio-context.tsx
"use client";

import { createContext, useContext } from "react";

type PortfolioContextType = {
  activeSlug: string;
  scrollToProject: (slug: string) => void;
};

export const PortfolioContext = createContext<PortfolioContextType>({
  activeSlug: "",
  scrollToProject: () => {},
});

export function usePortfolio() {
  return useContext(PortfolioContext);
}
```

```tsx
// components/portfolio/timeline.tsx
"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { PortfolioContext } from "./portfolio-context";
import type { ReactNode } from "react";

export function Timeline({
  slugs,
  children,
}: {
  slugs: string[];
  children: ReactNode;
}) {
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);

  return (
    <PortfolioContext value={{ activeSlug, scrollToProject }}>
      <div className="flex h-screen">
        {children}
      </div>
      {/* Hidden ref anchor — the actual scrollable container */}
    </PortfolioContext>
  );
}
```

Hmm, the `containerRef` needs to be on the scrollable element, but that's inside `children`. Let me simplify — make the `Timeline` own the scroll container and accept sidebar + cards as separate children:

```tsx
// components/portfolio/timeline.tsx
"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { PortfolioContext } from "./portfolio-context";
import type { ReactNode } from "react";

export function Timeline({
  slugs,
  sidebar,
  cards,
}: {
  slugs: string[];
  sidebar: ReactNode;
  cards: ReactNode;
}) {
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);

  return (
    <PortfolioContext value={{ activeSlug, scrollToProject }}>
      <div className="flex h-screen">
        {sidebar}
        <main
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
        >
          {cards}
        </main>
      </div>
    </PortfolioContext>
  );
}
```

And `ProjectList` consumes the context:

```tsx
// components/portfolio/project-list.tsx
"use client";

import { usePortfolio } from "./portfolio-context";
import { ProjectItem } from "./project-item";
import type { ProjectMeta } from "@/lib/types";

export function ProjectList({ projects }: { projects: ProjectMeta[] }) {
  const { activeSlug, scrollToProject } = usePortfolio();

  return (
    <div className="flex flex-col gap-0.5">
      {projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => scrollToProject(project.slug)}
          className="text-left w-full"
        >
          <ProjectItem
            project={project}
            isActive={activeSlug === project.slug}
          />
        </button>
      ))}
    </div>
  );
}
```

This is the correct pattern. The page (server) renders `Timeline` with server-rendered `sidebar` and `cards` as ReactNode props. `Timeline` (client) provides context. `ProjectList` (client) consumes context. `Sidebar`, `HeroCard`, `ProjectItem`, `Identity`, `SocialLinks` stay as server components.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-scroll-spy.ts components/portfolio/portfolio-context.tsx components/portfolio/project-list.tsx components/portfolio/timeline.tsx
git commit -m "feat: add scroll spy hook, timeline, and project list client components"
```

---

### Task 7: Landing Page — Assemble Everything

**Files:**
- Rewrite: `app/page.tsx`

- [ ] **Step 1: Write the landing page**

```tsx
// app/page.tsx
import { getAllProjects } from "@/lib/projects";
import { Timeline } from "@/components/portfolio/timeline";
import { Sidebar } from "@/components/portfolio/sidebar";
import { ProjectList } from "@/components/portfolio/project-list";
import { HeroCard } from "@/components/portfolio/hero-card";

export default function Home() {
  const projects = getAllProjects();
  const slugs = projects.map((p) => p.slug);

  return (
    <Timeline
      slugs={slugs}
      sidebar={
        <Sidebar projects={projects}>
          <ProjectList projects={projects} />
        </Sidebar>
      }
      cards={projects.map((project) => (
        <HeroCard key={project.slug} project={project} />
      ))}
    />
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
bun run dev -p 3005
```

Open `http://localhost:3005`:
- Left sidebar with avatar, name, description, "Projects" label, Ledgy and Beets items
- Right side with two hero cards
- Scrolling the right side should update the active project highlight on the left
- Clicking a sidebar item should smooth-scroll to the corresponding hero

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble landing page with sidebar and timeline"
```

---

### Task 8: Project Detail and Gallery Components

**Files:**
- Create: `components/portfolio/project-detail.tsx`
- Create: `components/portfolio/project-gallery.tsx`

- [ ] **Step 1: Create ProjectDetail component**

```tsx
// components/portfolio/project-detail.tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ProjectMeta } from "@/lib/types";

export function ProjectDetail({
  project,
  prev,
  next,
  children,
}: {
  project: ProjectMeta;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
  children?: React.ReactNode; // MDX content
}) {
  return (
    <aside className="w-[360px] min-w-[360px] sticky top-0 h-screen overflow-y-auto border-r border-border-subtle p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          &larr; Back
        </Link>
        <div className="flex gap-3">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="text-[12px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              Prev
            </Link>
          ) : (
            <span className="text-[12px] text-text-muted">Prev</span>
          )}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="text-[12px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              Next
            </Link>
          ) : (
            <span className="text-[12px] text-text-muted">Next</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: project.iconBg }}
        >
          <Image src={project.icon} alt="" width={18} height={18} />
        </div>
        <h1 className="text-[17px] font-semibold text-text-primary">
          {project.title}
        </h1>
      </div>

      <p className="text-[13px] text-text-secondary leading-relaxed">
        {project.description}
      </p>

      {project.stats.length > 0 && (
        <div className="flex gap-3">
          {project.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 p-3.5 rounded-xl bg-bg-surface flex flex-col gap-1"
            >
              <span className="text-[20px] font-semibold text-text-primary">
                {stat.value}
              </span>
              <span className="text-[11px] text-text-tertiary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
          Role
        </span>
        <span className="text-[13px] text-text-secondary">{project.role}</span>
      </div>

      {project.stack.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
            Stack
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {children && (
        <div className="prose prose-sm prose-neutral mt-2">{children}</div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Create ProjectGallery component**

```tsx
// components/portfolio/project-gallery.tsx
import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";

export function ProjectGallery({ project }: { project: ProjectMeta }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
      {project.images.map((image) => (
        <div
          key={image.src}
          className="relative w-full aspect-[3/2] max-w-[1200px] rounded-xl overflow-hidden bg-bg-elevated"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/project-detail.tsx components/portfolio/project-gallery.tsx
git commit -m "feat: add project detail and gallery components"
```

---

### Task 9: Intercepting Route — Inline Project Expansion

**Files:**
- Create: `app/@detail/default.tsx`
- Create: `app/@detail/(.)work/[slug]/page.tsx`

- [ ] **Step 1: Create parallel route default**

Every parallel route slot must have a `default.tsx` that returns `null` to prevent 404s on hard navigation.

```tsx
// app/@detail/default.tsx
export default function DetailDefault() {
  return null;
}
```

- [ ] **Step 2: Create intercepting route page**

```tsx
// app/@detail/(.)work/[slug]/page.tsx
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
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay to close */}
      <div className="w-80 flex-shrink-0" /> {/* Space for sidebar */}
      <div className="flex flex-1">
        <ProjectDetail project={meta} prev={prev} next={next} />
        <ProjectGallery project={meta} />
      </div>
    </div>
  );
}
```

Note: This renders as an overlay positioned after the sidebar. The sidebar remains visible from the landing page underneath. The detail + gallery take the remaining space.

- [ ] **Step 3: Test inline expansion**

```bash
bun run dev -p 3005
```

1. Open `http://localhost:3005`
2. Click the Ledgy hero card or sidebar item
3. URL should update to `/work/ledgy`
4. Detail panel + gallery should appear
5. Click "Back" — should return to `/` with timeline visible

- [ ] **Step 4: Commit**

```bash
git add app/@detail/
git commit -m "feat: add intercepting route for inline project expansion"
```

---

### Task 10: Standalone Project Page + Metadata

**Files:**
- Create: `app/work/[slug]/page.tsx`

- [ ] **Step 1: Create standalone project page with generateMetadata**

This renders when someone directly visits `/work/ledgy` (shared link, bookmark, search engine).

```tsx
// app/work/[slug]/page.tsx
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
      <Sidebar projects={projects}>
        <div className="flex flex-col gap-0.5">
          {projects.map((p) => (
            <a
              key={p.slug}
              href={`/work/${p.slug}`}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] ${
                p.slug === slug
                  ? "bg-bg-surface font-medium text-text-primary"
                  : "text-text-tertiary hover:bg-bg-surface/50"
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
```

- [ ] **Step 2: Verify direct access**

Open `http://localhost:3005/work/ledgy` directly (not by clicking from timeline):
- Should render the full project page with sidebar, detail, and gallery
- Check page title in browser tab: "Ledgy Dashboards — Ion Mesca"

Open `http://localhost:3005/work/nonexistent`:
- Should show 404 page

- [ ] **Step 3: Commit**

```bash
git add app/work/
git commit -m "feat: add standalone project page with metadata and static params"
```

---

### Task 11: Mobile Layout

**Files:**
- Modify: `components/portfolio/sidebar.tsx`
- Modify: `components/portfolio/timeline.tsx`
- Modify: `components/portfolio/hero-card.tsx`

- [ ] **Step 1: Make sidebar hidden on mobile**

Update `sidebar.tsx` to add responsive classes:

```tsx
// In sidebar.tsx, update the aside className:
<aside className="hidden md:flex w-80 min-w-80 sticky top-0 h-screen flex-col border-r border-border-subtle">
```

- [ ] **Step 2: Add mobile header**

Create a mobile-only header that shows above the timeline on small screens:

```tsx
// components/portfolio/mobile-header.tsx
import Image from "next/image";
import { SocialLinks } from "./social-links";

export function MobileHeader() {
  return (
    <div className="flex md:hidden items-center justify-between px-4 py-3 sticky top-0 z-10 bg-bg-base/80 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <Image
          src="/ion.jpeg"
          alt="Ion Mesca"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-[14px] font-semibold text-text-primary">
          Ion Mesca
        </span>
      </div>
      <SocialLinks />
    </div>
  );
}
```

- [ ] **Step 3: Update HeroCard for mobile**

Add the project label overlay that's always visible on mobile (not just on hover):

Update `hero-card.tsx` — change the overlay classes:

```tsx
// Replace the overlay div className:
<div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/40 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity">
```

- [ ] **Step 4: Update page.tsx to include mobile header**

```tsx
// In app/page.tsx, add MobileHeader import and render it above Timeline
import { MobileHeader } from "@/components/portfolio/mobile-header";

// In the return, wrap everything:
return (
  <>
    <MobileHeader />
    <Timeline
      slugs={slugs}
      sidebar={...}
      cards={...}
    />
  </>
);
```

- [ ] **Step 5: Verify mobile layout**

Open browser dev tools, toggle device toolbar to iPhone 14 (390px):
- Should see mobile header with avatar + name + social icons
- No sidebar visible
- Hero cards full-width with project labels visible
- Tapping a card navigates to the project detail

- [ ] **Step 6: Commit**

```bash
git add components/portfolio/ app/page.tsx
git commit -m "feat: add responsive mobile layout with mobile header"
```

---

### Task 12: Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

```bash
bun run build
```

Expected: Build succeeds with all routes generated:
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ● /work/[slug]    (with generateStaticParams)
```

- [ ] **Step 2: Test all interactions**

```bash
bun run dev -p 3005
```

Checklist:
1. Landing page renders with sidebar + timeline
2. Scrolling timeline updates active project in sidebar
3. Clicking sidebar item smooth-scrolls to hero card
4. Clicking hero card navigates to `/work/ledgy` with detail panel
5. "Back" button returns to timeline
6. "Next" navigates to next project
7. Direct access to `/work/ledgy` renders standalone page
8. Direct access to `/work/nonexistent` shows 404
9. Mobile: no sidebar, mobile header visible, hero cards with labels
10. Mobile: tapping card shows project detail

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: single-page portfolio v1 complete"
```
