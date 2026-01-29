# ion-portfolio

Ion Mesca's portfolio. Design engineer targeting AI companies.

## Tech Stack

| Tech | Purpose |
|------|---------|
| Next.js 15 | App Router, RSC, Turbopack |
| React 19 | UI |
| Tailwind CSS 4 | Styling (inline @theme, no config file) |
| shadcn/ui | Component primitives (extend, don't modify ui/) |
| Convex | Database (stack, collections) |
| AI SDK 6 | Claude chat on /agent |
| MDX | Case studies, articles |
| Aeonik Pro | Typography (variable font in public/fonts/) |

## Structure

- `app/` — Routes
- `components/ui/` — shadcn (don't modify)
- `components/layout/` — AppShell, Sidebar, TopBar
- `content/` — MDX files
- `convex/` — Database
- `public/fonts/` — Aeonik Pro

## Commands

```bash
bun dev              # Dev server
bunx convex dev      # Convex (separate terminal)
bunx shadcn@latest add [name]  # Add component
```

## Conventions

- Dark theme default, light/dark toggle in sidebar
- Components: PascalCase
- Extend shadcn via CSS variables + variants
- Server Components by default, "use client" only when needed

## Development Approach

Scaffold first, style later. Build navigation + routes with defaults, then iterate on visual design.
