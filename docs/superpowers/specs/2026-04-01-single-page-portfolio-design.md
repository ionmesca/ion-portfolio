# Single-Page Portfolio — Design Spec

> One page, two panels. A scroll-driven timeline that lets hiring managers browse projects instantly, with an expand view for depth.

---

## 1. Overview

Replace the current multi-page portfolio with a single-page layout. The page has two panels: a fixed left sidebar with identity and project list, and a scrollable right area showing hero images. Clicking a project expands it with a detail panel and image gallery via Next.js intercepting routes — the URL updates to `/work/[slug]` with full metadata, but the transition is instant and inline.

**Target audience:** Hiring managers at AI companies (Anthropic, OpenAI, xAI, Ramp, Block) evaluating design engineering craft.

**Success criteria:**
- 30-second test: visitor sees the work immediately on landing
- Scroll-driven browsing: no clicks required to see all projects
- Expand for depth: one click reveals process, metrics, and full gallery
- Shareable: `/work/ledgy` deep-links with proper OG metadata

---

## 2. Layout

### Desktop (>= 768px)

```
┌──────────────────────────────────────────────────┐
│  Ion Mesca        Design Engineer    [gh] [li] [x]│
│  ─────────────────────────────────────────────────│
│                   │                               │
│  Projects         │   ┌─────────────────────┐     │
│                   │   │                     │     │
│  [icon] Ledgy  26 │   │   Hero image 1      │     │
│  [icon] Beets  25 │   │   (Ledgy)           │     │
│                   │   │                     │     │
│                   │   └─────────────────────┘     │
│                   │                               │
│                   │   ┌─────────────────────┐     │
│                   │   │                     │     │
│                   │   │   Hero image 2      │     │
│                   │   │   (Beets)           │     │
│                   │   │                     │     │
│                   │   └─────────────────────┘     │
│                   │                               │
└──────────────────────────────────────────────────┘
```

- **Left panel:** fixed 320px, sticky to viewport. Contains avatar, name, role, "Projects" label, project list items.
- **Right panel:** `flex: 1`, scrollable. Hero image cards stacked vertically with gaps. Cards have `max-width: 1200px`, centered.
- **Divider:** single subtle 1px line (`border-border-subtle`) between panels.

### Desktop Expanded (`/work/ledgy`)

```
┌──────────────────────────────────────────────────┐
│  Ion Mesca        Design Engineer    [gh] [li] [x]│
│  ─────────────────────────────────────────────────│
│                 │               │                  │
│  Projects       │  ← Back       │  ┌──────────┐   │
│                 │               │  │ Image 1  │   │
│  [icon] Ledgy ● │  [icon] Ledgy │  └──────────┘   │
│  [icon] Beets   │  Description  │                  │
│                 │  40% | 12     │  ┌──────────┐   │
│                 │  Role         │  │ Image 2  │   │
│                 │  Collabs      │  └──────────┘   │
│                 │  Stack        │                  │
│                 │  Prev | Next  │  ┌──────────┐   │
│                 │               │  │ Image 3  │   │
│                 │               │  └──────────┘   │
└──────────────────────────────────────────────────┘
```

- **Left panel:** same 320px, project list with active indicator.
- **Detail panel:** ~360px fixed, sticky. Back button, project title, description, stats, role, collaborators, stack, prev/next navigation.
- **Gallery panel:** `flex: 1`, scrollable. All project images stacked vertically.
- **Two subtle 1px dividers** (`border-border-subtle`) between the three panels.
- **Transition:** intercepting route renders the detail + gallery inline. CSS transition on mount (~300ms).

### Mobile (< 768px)

**Landing:**
```
┌───────────────────────┐
│ [avatar] Ion Mesca [x]│
│ Projects              │
├───────────────────────┤
│ ┌───────────────────┐ │
│ │ Hero card         │ │
│ │ [icon] Ledgy      │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │ Hero card         │ │
│ │ [icon] Beets      │ │
│ └───────────────────┘ │
└───────────────────────┘
```

- Single column. Identity header at top, then hero cards as a vertical feed.
- Each card is the hero image with project name + icon overlaid at the bottom.
- No sidebar — the heroes ARE the list.

**Expanded (tap a card):**
```
┌───────────────────────┐
│ ← Back      Prev Next │
├───────────────────────┤
│ [icon] Ledgy          │
│ Description           │
│ 40%    12 screens     │
│ Role   Stack          │
├───────────────────────┤
│ Image 1               │
│ Image 2               │
│ Image 3               │
└───────────────────────┘
```

- Full-width single column. Detail card at top, images below. Back returns to feed.

---

## 3. Scroll-Driven Active State

On the landing view, as the user scrolls the right panel's hero images, the left sidebar highlights which project is currently in view.

**Implementation:** IntersectionObserver on each hero card with `threshold: 0.5`. When a card crosses 50% visibility, update the active project in state. The left sidebar item gets a `bg-bg-surface` highlight.

**Clicking a sidebar item** smooth-scrolls the right panel to that project's hero card.

---

## 4. Data Model

### MDX Frontmatter

Each project lives in `content/work/<slug>/index.mdx`:

```yaml
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
collaborators:
  - name: "Colleague Name"
    avatar: "/projects/collaborators/name.jpg"
stack:
  - React
  - TypeScript
  - D3.js
images:
  - src: /projects/ledgy/dashboard-overview.png
    alt: Dashboard overview
  - src: /projects/ledgy/cap-table.png
    alt: Cap table detail
order: 1
---

## The Challenge

Placeholder content for the detailed writeup...

## The Approach

Placeholder content...

## The Outcome

Placeholder content...
```

### Types (split for RSC boundaries)

```typescript
// Serializable — safe to pass through client boundaries
type ProjectMeta = {
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

// MDX content rendered server-side only — never passed to client components
// Loaded separately in the detail view server component
```

The list, timeline, and sidebar only need `ProjectMeta`. MDX body is rendered server-side in the `/work/[slug]` route.

---

## 5. URL & Routing Strategy

Uses Next.js App Router intercepting routes for inline expansion with proper metadata.

### Route structure

```
app/
  page.tsx                          # Landing — timeline view (server component)
  layout.tsx                        # Root layout — simplified, no AppShell
  @detail/                          # Parallel route slot for detail panel
    (.)work/[slug]/                 # Intercepting route — inline expansion
      page.tsx                      # Detail panel rendered inline
  work/
    [slug]/
      page.tsx                      # Standalone project page (direct link / SEO)
      generateMetadata              # Per-project OG image, title, description
```

### How it works

| Action | URL | What renders |
|--------|-----|-------------|
| Landing | `/` | Timeline with hero cards. Sidebar visible. |
| Click project from timeline | `/work/ledgy` | Intercepting route: detail + gallery appear inline. Same layout, no page reload. |
| Direct link / share | `/work/ledgy` | Standalone project page with full metadata, OG images. |
| Click "Back" / browser back | `/` | Returns to timeline, scroll position preserved. |

### Benefits over query params
- Per-project `generateMetadata` — custom OG image, title, description for each project
- Proper analytics — each project gets its own page view
- Clean 404 handling for invalid slugs
- Native browser back/forward behavior

---

## 6. Component Architecture

Server components by default. Client islands only for scroll sync and interactive state.

| Component | Server/Client | Purpose |
|-----------|--------------|---------|
| `PortfolioLayout` | Server | Root two-panel layout |
| `Sidebar` | Server | Fixed left panel shell |
| `Identity` | Server | Avatar + name + role |
| `ProjectList` | Client | List items with scroll-driven active state |
| `ProjectItem` | Server | Single list item — icon, name, description, year |
| `Timeline` | Client | Scrollable hero cards with IntersectionObserver |
| `HeroCard` | Server | Single hero image card |
| `ProjectDetail` | Server | Expanded detail panel — project info + MDX content |
| `ProjectGallery` | Server | Expanded image gallery |
| `SocialLinks` | Server | GitHub, LinkedIn, X icon links |
| `ScrollSpy` | Client | Hook: IntersectionObserver for active state |

**Client islands:** Only `ProjectList` and `Timeline` need client-side state (for scroll sync and active project tracking). Everything else is server-rendered.

**Location:** `components/portfolio/`

---

## 7. Interaction Details

### Expand
1. User clicks project item in sidebar OR clicks a hero card
2. Next.js Link navigates to `/work/<slug>` — intercepting route catches it
3. Detail panel renders inline via parallel route slot (`@detail`)
4. CSS transition animates the panel in (~300ms)
5. Gallery shows all images for the project
6. Left sidebar shows active indicator

### Collapse
1. User clicks "Back" button or presses Escape or uses browser back
2. `router.back()` returns to `/`
3. Detail panel animates out, timeline reappears
4. Scroll position in timeline is preserved

### Scroll sync (landing only)
1. `useScrollSpy` hook with IntersectionObserver at `threshold: 0.5`
2. When a hero card becomes majority-visible, active project updates
3. Sidebar item gets `bg-bg-surface` highlight
4. Clicking a sidebar item calls `scrollIntoView({ behavior: 'smooth' })`

---

## 8. Design Tokens (Light Mode)

Update `globals.css` semantic tokens to light-mode values using Tailwind neutral scale. Dark mode values preserved in `.dark` selector for future toggle.

```css
/* Light mode (default) */
--color-bg-base: #ffffff;
--color-bg-surface: #fafafa;        /* neutral-50 */
--color-bg-elevated: #f5f5f5;       /* neutral-100 */
--color-bg-glass: rgba(0, 0, 0, 0.02);

--color-text-primary: #171717;      /* neutral-900 */
--color-text-secondary: #525252;    /* neutral-600 */
--color-text-tertiary: #a3a3a3;     /* neutral-400 */
--color-text-muted: #d4d4d4;        /* neutral-300 */

--color-accent: #ff9f6a;            /* kept — warm orange signature */
--color-accent-soft: rgba(255, 159, 106, 0.1);

--color-border-default: #e5e5e5;    /* neutral-200 */
--color-border-subtle: #f0f0f0;     /* ~neutral-100 */
--color-border-strong: #d4d4d4;     /* neutral-300 */
```

Components use semantic token classes (e.g., `bg-bg-surface`, `text-text-secondary`, `border-border-subtle`) — never raw `neutral-*` classes directly.

---

## 9. Cleanup

### Files to delete

| File | Reason |
|------|--------|
| `components/layout/app-shell.tsx` | Replaced by PortfolioLayout |
| `components/layout/floating-dock.tsx` | Removed — no dock in new design |
| `components/layout/header.tsx` | Removed — identity moves into Sidebar |
| `components/layout/content-area.tsx` | Unused |
| `components/layout/index.ts` | Barrel export, no longer needed |
| `components/layout/split-layout.tsx` | Only used by case-study-demo |
| `components/case-study/` (all 5 files) | Old case study approach, replaced by MDX detail view |
| `components/patterns/feature-grid.tsx` | Never used in live pages |
| `components/patterns/hero.tsx` | Never used in live pages |
| `app/case-study-demo/` | Demo page, fully replaced |
| `lib/route-config.ts` | Single page, no route config needed |

### Files to rewrite

| File | Change |
|------|--------|
| `app/layout.tsx` | Remove AppShell, remove ConvexClientProvider (not used in v1), simplify to ThemeProvider + children |
| `app/page.tsx` | Replace placeholder with timeline view |
| `app/globals.css` | Swap dark-mode token defaults to light-mode neutral scale |
| `app/work/page.tsx` | Remove empty placeholder — replaced by `work/[slug]/page.tsx` |

### Files to keep but unlink

These route pages stay as files but are not navigable from the portfolio:

- `app/lab/page.tsx`
- `app/stack/page.tsx`
- `app/writing/page.tsx`
- `app/agent/page.tsx`
- `app/playground/page.tsx` (dev tool)

---

## 10. What Stays / Gets Added Later

- `/playground` — stays as a dev tool, not linked
- `/agent` — future: Claude chat
- **Insights tab** — future: writings, tools, links. Same layout, different content list.
- **Dark mode** — future: toggle, tokens already structured for it
- **View transitions** — future: animate between states
- **Mobile gestures** — future: swipe for prev/next

---

## 11. Files to Create

```
content/work/ledgy/index.mdx               # Ledgy project (placeholder content)
content/work/beets/index.mdx               # Beets project (placeholder content)
public/projects/ledgy-logo.svg             # Done
public/projects/beets-logo.svg             # Done
public/projects/ledgy-hero.png             # Placeholder
public/projects/beets-hero.png             # Placeholder
components/portfolio/                       # All new components
lib/projects.ts                            # MDX loader — returns ProjectMeta[]
app/page.tsx                               # Rewritten — timeline view
app/layout.tsx                             # Simplified — no AppShell
app/@detail/(.)work/[slug]/page.tsx        # Intercepting route — inline detail
app/work/[slug]/page.tsx                   # Standalone project page + metadata
hooks/use-scroll-spy.ts                    # Already exists, may need updates
```
