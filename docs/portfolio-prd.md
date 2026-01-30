---
date: 2026-01-29
owner: ion
tags:
  - portfolio
  - prd
  - job-search
status: active
---

# Portfolio PRD: Ion Mesca

> Design engineer portfolio optimized for AI-era job search, built as a long-term playground.

---

## 1. Product Overview

### Vision
A portfolio that demonstrates **design engineering craft** and **AI-native workflow** — not just showcasing work, but being a showcase itself. Built to grow into a personal playground beyond the job search.

### Target Audience
- Hiring managers at Anthropic, OpenAI, xAI, RAMP, Block
- Design/engineering leaders evaluating craft and technical depth

### Success Criteria
- **30-second test**: Visitor immediately understands "design engineer who ships with AI"
- **2-minute test**: Can navigate to a case study and see process depth
- **Technical impression**: Site itself demonstrates modern stack proficiency

### Key Impression
> "This person ships. The portfolio itself is a masterpiece of AI's current edges."

---

## 2. Information Architecture

### Routes

| Route | Purpose | Top Tabs | Right Actions |
|-------|---------|----------|---------------|
| `/` | Home/intro | None | — |
| `/work` | Case study index | None | Filter? |
| `/work/[slug]` | Case study detail | Overview \| Process \| Results | Share |
| `/lab` | Experiments index | None | — |
| `/lab/[slug]` | Experiment detail | Demo \| Code \| Writeup | Source link |
| `/stack` | Tools/tech I use | None | Platform filter |
| `/writing` | Articles (year-grouped) | None | — |
| `/writing/[slug]` | Article detail | None | Share |
| `/agent` | AI chat interface | None | Model picker? |
| `/canvas`* | Infinite workspace | None | Zoom controls |

*Canvas is future scope, but architecture should not preclude it.

### Left Sidebar (Global)
Always visible on desktop. Contains:
- Logo/home link
- Work
- Lab
- Stack
- Writing
- Agent
- (Future: Canvas)

Bottom section:
- Theme toggle
- Social links

### Top Bar (Contextual)
Appears only when needed:
- Tabs for sub-navigation within a page
- Right action zone for page-specific controls

### Responsive Behavior
- **Desktop**: Collapsible sidebar (default expanded) + top bar + right actions
- **Tablet**: Sidebar collapsed by default (icon-only)
- **Mobile**: Bottom tab bar (Home, Work, Lab, Stack, Agent), sidebar hidden, top bar simplified

---

## 3. Layout System

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│ AppShell                                                │
│ ┌─────────┬─────────────────────────────────────────┐   │
│ │         │ TopBar (contextual)          [Actions]  │   │
│ │ Sidebar │ ────────────────────────────────────────│   │
│ │         │                                         │   │
│ │  nav    │ ContentArea                             │   │
│ │  items  │                                         │   │
│ │         │                                         │   │
│ │         │                                         │   │
│ │ ─────── │                                         │   │
│ │ bottom  │                                         │   │
│ └─────────┴─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

1. **AppShell** — Root layout, manages sidebar state, provides context
2. **Sidebar** — Fixed left nav, collapsible on mobile
3. **TopBar** — Contextual tabs + right action slot (renders based on route)
4. **ContentArea** — Scrollable main content, max-width constrained
5. **RightActionZone** — Slot for page-specific actions in TopBar

### Sidebar Specs
- **Width**: Collapsible — icon-only (~64px) ↔ expanded (~200px)
- **Default state**: Expanded on desktop, collapsed on mobile
- **Toggle**: Button in sidebar or keyboard shortcut
- **Items**: Icon + label (label hidden when collapsed), active state indicator
- **Persistence**: Remember collapsed state in localStorage

### TopBar Specs
- **Height**: ~48-56px
- **Left**: Tabs (when applicable)
- **Right**: Action buttons (share, filter, etc.)
- **Visibility**: Controlled per-route via metadata or layout

---

## 4. Content Types

### Case Study (`/work/[slug]`)
MDX-powered with tabbed sections defined in frontmatter:
```yaml
---
title: Ledgy Dashboards
tabs:
  - id: overview
    label: Overview
  - id: process
    label: Process
  - id: results
    label: Results
---
```
- **Overview**: Hero, problem, outcome
- **Process**: Design decisions, iterations
- **Results**: Metrics, learnings

### Lab Experiment (`/lab/[slug]`)
Interactive React components with:
- **Demo**: Live interactive component
- **Code**: Syntax-highlighted source
- **Writeup**: Context and learnings

### Stack (`/stack`)
Table/grid layout (Brian Lovin style):
- Icon, Name, Description, Platform tags
- Filterable by platform (macOS, iOS, Web, etc.)
- Data stored in Convex

### Writing (`/writing`)
Year-grouped list:
- Minimal design
- MDX content

### Agent (`/agent`)
AI chat interface:
- AI SDK 6 with Claude
- Can answer questions about Ion
- Potential: tool use for navigation, demos

### Canvas (`/canvas`) — Future
Infinite workspace:
- Pan/zoom viewport
- Placed images, components, notes
- Tech: `@use-gesture/react` + transforms or dedicated lib

---

## 5. Tech Stack (Confirmed)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | App Router, RSC, Turbopack |
| React | 19 | Required for Next.js 15 |
| TypeScript | 5.x | Full type safety |
| AI SDK | 6.x | Agent for `/agent` page |
| Convex | Latest | Collections (stack, bookmarks) |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component primitives |
| Framer Motion | 11.x | Animations |
| MDX | 3.x | Case studies, writing |
| Vercel | — | Hosting |

### Future-proofing for Canvas
- `@use-gesture/react` — Pan/zoom gestures
- Consider `react-flow` or custom canvas implementation

---

## 6. Phase 1 Scope (MVP)

**Goal**: Live site with navigation architecture, one case study, basic styling.

### Deliverables

- [ ] **Project setup**: Next.js 15 + Tailwind 4 + shadcn/ui + TypeScript
- [ ] **AppShell layout**: Sidebar + TopBar + ContentArea
- [ ] **Sidebar component**: Nav items, responsive (drawer on mobile)
- [ ] **TopBar component**: Contextual tabs, right action slot
- [ ] **Routes scaffolded**: `/`, `/work`, `/work/[slug]`, `/stack`, `/writing`, `/agent`
- [ ] **Home page**: Basic intro, links to sections
- [ ] **MDX pipeline**: Content loading for case studies
- [ ] **One case study**: Ledgy dashboards with tabs (Overview | Process | Results)
- [ ] **Stack page**: Convex data, grid layout
- [ ] **Deploy to Vercel**: Custom domain

### NOT in Phase 1
- Lab experiments
- Agent chat (page scaffolded but no AI SDK integration)
- Canvas
- Writing articles
- Framer Motion animations (basic CSS transitions only)
- Dark/light theme toggle

### Data: Convex from Start
Set up Convex immediately for stack/tools data. This enables:
- Future collections (bookmarks, etc.)
- Real-time updates if needed
- Consistent data layer across the app

---

## 7. Implementation Tasks (Agent-Ready)

### 7.1 Project Initialization
```
- Init Next.js 15 with App Router, TypeScript, Tailwind 4
- Install shadcn/ui, configure components
- Set up project structure (app/, components/, content/, lib/)
- Configure path aliases
- Deploy empty shell to Vercel
```

### 7.2 Layout System
```
- Create AppShell component (app/layout.tsx wrapper)
- Create Sidebar component with nav items
- Implement sidebar collapse toggle + localStorage persistence
- Create TopBar component with tabs + actions slots
- Create ContentArea wrapper with max-width
- Create BottomTabBar for mobile navigation
- Add responsive breakpoints (sidebar → bottom tabs)
- Add route-based TopBar configuration
```

### 7.3 Page Scaffolding
```
- Create home page (/)
- Create /work index page
- Create /work/[slug] dynamic route with tab layout
- Create /stack page with placeholder grid
- Create /writing page with placeholder list
- Create /agent page with placeholder
```

### 7.4 MDX Integration
```
- Install and configure MDX for Next.js 15
- Create case study template component
- Create tab content components (Overview, Process, Results)
- Set up content directory structure
- Write Ledgy dashboards case study
```

### 7.5 Convex + Stack Page
```
- Set up Convex project and connect to Next.js
- Define stack schema (name, description, icon, platforms, url)
- Create Convex functions (queries for stack items)
- Seed initial stack data
- Create stack item component
- Build grid/table layout with Convex data
- Add platform filter
```

### 7.6 Polish & Deploy
```
- Basic typography and spacing
- Navigation active states
- Mobile navigation testing
- Lighthouse audit (90+ target)
- Final Vercel deployment with domain
```

---

## 8. Verification

### End-to-End Testing
1. **Navigation**: Click through all sidebar items, verify routing
2. **Case study tabs**: Navigate to `/work/ledgy-dashboards`, switch between Overview/Process/Results
3. **Stack page**: Verify grid renders, filters work
4. **Mobile**: Test bottom tab bar, ensure all pages accessible
5. **Performance**: Run Lighthouse, verify 90+ scores
6. **Deploy**: Verify Vercel deployment, custom domain works

### Key Files to Verify
- `app/layout.tsx` — AppShell integration
- `components/layout/sidebar.tsx` — Navigation working
- `components/layout/top-bar.tsx` — Contextual tabs rendering
- `app/work/[slug]/page.tsx` — MDX loading, tabs working
- `app/stack/page.tsx` — Grid rendering

---

## 9. Decisions Made

| Question | Decision |
|----------|----------|
| Sidebar style | Collapsible (icon-only ↔ expanded) |
| Mobile nav | Bottom tab bar |
| Data source | Convex from start |
| Case study tabs | MDX frontmatter (flexible per case study) |
| Bottom tab items | Home, Work, Lab, Stack, Agent |

---

## Related

- [[portfolio-plan-v1]]
- [[portfolio-tech-stack-2026]]
- [[2026-career]]
