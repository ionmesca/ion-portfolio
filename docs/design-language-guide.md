# Design Language Guide

> The visual and interaction system for Ion Mesca's portfolio. A design engineer's proof-of-work—not a gallery, but a machine that reduces risk.

---

## Part 0: Critical Review of Current State

Before defining the system, here's what needs fixing in the existing code.

### Issue 1: Color Token Conflict (Critical)

**Current state**: Two incompatible color systems.

| Source | Background | Accent | Status |
|--------|------------|--------|--------|
| `playground/page.tsx` tokens | `#000000` | `#ff9f6a` (warm orange) | ✓ Correct |
| `globals.css` `@theme inline` | `#09090b` | `#3b82f6` (blue) | ✗ Wrong |

**Action**: Update globals.css to use playground's tokens. The warm orange `#ff9f6a` is your signature—the blue is shadcn default that was never changed.

### Issue 2: Three Parallel Color Systems

The codebase has:
1. `const tokens = {}` in playground (JS object, not reusable)
2. `@theme inline {}` in globals.css (Tailwind theme)
3. `:root` and `.dark` with oklch values (shadcn defaults)

**Action**: Consolidate into one source of truth in `@theme inline`. Delete or align the others.

### Issue 3: Unused shadcn Variables

20+ sidebar-* variables exist but you use a floating dock, not a sidebar:
```css
--sidebar-ring, --sidebar-border, --sidebar-accent-foreground,
--sidebar-accent, --sidebar-primary-foreground, --sidebar-primary,
--sidebar-foreground, --sidebar
```

**Action**: Remove unused variables. Keep only what the dock and actual components need.

### Issue 4: Playground Tokens Aren't CSS Variables

```typescript
// Current (not reusable)
const tokens = { colors: { bg: { base: "#000000" }}}

// Should be
// In globals.css: --color-bg-base: #000000;
// In components: bg-[var(--color-bg-base)] or bg-bg-base
```

**Action**: Move playground tokens to globals.css as CSS custom properties.

### Issue 5: Typography Not Codified

Playground demonstrates a type scale but it's not in CSS:
- Display / 48px / Light
- H1 / 36px / Semibold
- H2 / 24px / Medium
- etc.

**Action**: Add typography utility classes to globals.css `@layer base` or `@layer utilities`.

### Issue 6: :root Color Scheme Confusion

`:root` says `color-scheme: dark` but the oklch values are light mode (white backgrounds):
```css
:root {
  color-scheme: dark;
  --background: oklch(1 0 0); /* This is white! */
}
```

**Action**: Fix :root to be proper dark mode defaults, or remove oklch and use hex consistently.

### Issue 7: Missing Components for Content Strategy

Per `docs/content-strategy.md`, these components are needed but don't exist:

| Component | Purpose | Priority |
|-----------|---------|----------|
| `MetricCard` | Results-first hero (3 impact numbers) | Must have |
| `Collapsible` | Section 04 technical depth | Must have |
| `CaseStudyHero` | Results-first layout | Must have |
| `StickyRail` | Desktop case study nav | Must have |
| `MobileSectionNav` | Horizontal pill bar | Must have |
| `UseCaseCard` | Filterable, expandable | High |
| `RevealContainer` | Scroll-triggered stagger | High |

### Issue 8: Motion Tokens Incomplete

**Exists**:
```css
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-snap: cubic-bezier(0.25, 0.1, 0.25, 1);
```

**Missing**:
- Duration tokens: `--duration-fast: 100ms`, `--duration-default: 150ms`, etc.
- Stagger delay: `--stagger-delay: 50ms`
- Reduced motion: `@media (prefers-reduced-motion: reduce)` rules

---

### Migration Checklist

Before building new components, fix the foundation:

- [ ] **globals.css**: Replace shadcn blue accent with `#ff9f6a`
- [ ] **globals.css**: Change `--color-background` from `#09090b` to `#000000`
- [ ] **globals.css**: Add semantic color tokens (bg-base, bg-surface, bg-elevated)
- [ ] **globals.css**: Remove unused sidebar-* variables
- [ ] **globals.css**: Add typography utility classes
- [ ] **globals.css**: Add duration tokens
- [ ] **globals.css**: Add reduced motion support
- [ ] **globals.css**: Fix :root oklch confusion (make dark mode default)
- [ ] **playground/page.tsx**: Refactor to use CSS variables instead of JS const

---

## Part 1: Brand Identity

### Story Pillars

Five words that define who you are and how you work:

| Pillar | Meaning |
|--------|---------|
| **Precise** | Every pixel intentional. No decoration without purpose. |
| **Cinematic** | Dramatic reveals. Considered pacing. Moments that land. |
| **Candid** | Honest about constraints. Shows the work, not just polish. |
| **Systems-minded** | Sees patterns. Builds foundations. Thinks in architectures. |
| **Proof-driven** | Results over claims. Evidence over assertions. Ships over talks. |

### Visual Adjectives

Five words that define the aesthetic:

| Adjective | Translation |
|-----------|-------------|
| **Operator** | Control-panel confidence. Information density handled elegantly. |
| **Nocturnal** | Dark-first. Light is accent, not default. |
| **Warm-industrial** | Steel softened by amber. Technical but human. |
| **Spatial** | Generous negative space. Breath between elements. |
| **Kinetic** | Things move with purpose. Spring tension. Snap-back. |

### The Aesthetic Territory

**Operator Console × Field Notes**

- Primary mode: crisp, monochrome, fast-scan blocks (Operator Console)
- Accent mode: narrative warmth, artifact-driven proof (Field Notes)
- Technical depth: ledger-like precision (Lab + Ledger)

This hybrid serves all audiences:
- **xAI** sees technical confidence and first-principles clarity
- **Anthropic** sees reasoning traces and candid process
- **Block/Ramp** see enterprise rigor and fintech depth
- **OpenAI** sees shipping velocity and systems thinking

---

## Part 2: Token Layer

### Color System

#### Core Palette

```css
/* Base backgrounds - true blacks for depth */
--color-bg-base: #000000;        /* Page background */
--color-bg-surface: #0a0a0a;     /* Card backgrounds */
--color-bg-elevated: #141414;    /* Lifted surfaces */
--color-bg-glass: rgba(255, 255, 255, 0.03); /* Frosted overlays */

/* Text hierarchy - four levels only */
--color-text-primary: #ffffff;    /* Headings, emphasis */
--color-text-secondary: #a0a0a0;  /* Body text */
--color-text-tertiary: #666666;   /* Captions, metadata */
--color-text-muted: #404040;      /* Disabled, hints */

/* Accent - warm orange (signature) */
--color-accent: #ff9f6a;          /* Primary accent */
--color-accent-soft: rgba(255, 159, 106, 0.2);  /* Accent backgrounds */
--color-accent-glow: rgba(255, 159, 106, 0.12); /* Ambient glow */

/* Semantic colors */
--color-success: #34d399;         /* emerald-400 */
--color-warning: #fbbf24;         /* amber-400 */
--color-error: #f87171;           /* red-400 */

/* Borders - three intensities */
--color-border-subtle: rgba(255, 255, 255, 0.06);
--color-border-default: rgba(255, 255, 255, 0.10);
--color-border-strong: rgba(255, 255, 255, 0.20);
```

#### Light Mode Override

```css
.light {
  --color-bg-base: #ffffff;
  --color-bg-surface: #fafafa;
  --color-bg-elevated: #f5f5f5;
  --color-bg-glass: rgba(0, 0, 0, 0.02);

  --color-text-primary: #09090b;
  --color-text-secondary: #52525b;
  --color-text-tertiary: #a1a1aa;
  --color-text-muted: #d4d4d8;

  --color-border-subtle: rgba(0, 0, 0, 0.04);
  --color-border-default: rgba(0, 0, 0, 0.08);
  --color-border-strong: rgba(0, 0, 0, 0.15);
}
```

#### Tailwind Theme Extension

```css
@theme inline {
  /* Semantic color mapping */
  --color-background: var(--color-bg-base);
  --color-foreground: var(--color-text-primary);
  --color-muted: var(--color-bg-surface);
  --color-muted-foreground: var(--color-text-secondary);
  --color-accent: var(--color-accent);
  --color-accent-warm: #ff9f6a;
  --color-border: var(--color-border-default);
}
```

---

### Typography System

#### Font Stack

| Role | Font | Fallback |
|------|------|----------|
| **Sans (primary)** | Aeonik Pro | system-ui, sans-serif |
| **Mono (code)** | Geist Mono | ui-monospace, monospace |

#### Type Scale

| Token | Size | Weight | Line Height | Tracking | Use |
|-------|------|--------|-------------|----------|-----|
| `display` | 48px (3rem) | 300 (light) | 1.1 | -0.02em | Hero headlines |
| `h1` | 36px (2.25rem) | 600 (semibold) | 1.2 | -0.02em | Page titles |
| `h2` | 24px (1.5rem) | 500 (medium) | 1.3 | -0.01em | Section headers |
| `h3` | 20px (1.25rem) | 500 (medium) | 1.4 | 0 | Card titles |
| `body` | 16px (1rem) | 400 (regular) | 1.6 | 0 | Body text |
| `body-sm` | 14px (0.875rem) | 400 (regular) | 1.5 | 0 | Secondary text |
| `caption` | 12px (0.75rem) | 400 (regular) | 1.4 | 0.01em | Metadata |
| `label` | 11px (0.6875rem) | 500 (medium) | 1.2 | 0.08em | Section labels (uppercase) |

#### Typography Classes

```css
/* Display - hero headlines */
.typo-display {
  @apply text-5xl font-light tracking-tight leading-[1.1];
}

/* H1 - page titles */
.typo-h1 {
  @apply text-4xl font-semibold tracking-tight leading-[1.2];
}

/* H2 - section headers */
.typo-h2 {
  @apply text-2xl font-medium tracking-tight leading-[1.3];
}

/* H3 - card titles */
.typo-h3 {
  @apply text-xl font-medium leading-[1.4];
}

/* Body */
.typo-body {
  @apply text-base leading-relaxed;
}

/* Body small */
.typo-body-sm {
  @apply text-sm leading-normal;
}

/* Caption */
.typo-caption {
  @apply text-xs leading-snug tracking-wide;
}

/* Section label */
.typo-label {
  @apply text-[11px] font-medium uppercase tracking-[0.08em];
}
```

---

### Spacing System

#### Base Scale (4px grid)

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight gaps (icon padding) |
| `space-2` | 8px | Inline spacing, small gaps |
| `space-3` | 12px | Default padding |
| `space-4` | 16px | Card padding, section gaps |
| `space-6` | 24px | Component separation |
| `space-8` | 32px | Content sections |
| `space-12` | 48px | Major sections (mobile) |
| `space-16` | 64px | Major sections (desktop) |
| `space-24` | 96px | Page sections |
| `space-32` | 128px | Hero spacing |

#### Semantic Spacing

```css
/* Section spacing */
--section-gap-mobile: 48px;   /* space-12 */
--section-gap-desktop: 64px;  /* space-16 */

/* Card padding */
--card-padding-sm: 16px;      /* space-4 */
--card-padding-default: 24px; /* space-6 */
--card-padding-lg: 32px;      /* space-8 */

/* Content max-widths */
--content-narrow: 640px;      /* Prose, body text */
--content-default: 896px;     /* Main content area */
--content-wide: 1152px;       /* Full-bleed sections */
```

---

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 6px | Small buttons, tags |
| `radius-md` | 8px | Inputs, small cards |
| `radius-lg` | 10px | Default cards |
| `radius-xl` | 12px | Large buttons |
| `radius-2xl` | 16px | Hero cards, modals |
| `radius-3xl` | 20px | Feature sections |
| `radius-full` | 9999px | Pills, avatars, dock |

#### Design Principle

- **Smaller elements → smaller radius** (buttons: 8-12px)
- **Larger elements → larger radius** (cards: 12-20px)
- **Interactive pills → full radius** (dock, chips)

---

### Shadow System

```css
/* Elevation levels */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4);

/* Glow effects */
--glow-accent: 0 0 20px rgba(255, 159, 106, 0.15);
--glow-white: 0 0 20px rgba(255, 255, 255, 0.1);
--glow-primary: 0 0 24px rgba(255, 255, 255, 0.15);

/* Glass shadow (for floating elements) */
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.4),
               0 0 0 1px rgba(255, 255, 255, 0.1);
```

---

## Part 3: Component Inventory

### Primitives

#### Button Variants

| Variant | Background | Text | Border | Use |
|---------|------------|------|--------|-----|
| `primary` | white | black | none | Primary CTA |
| `secondary` | white/10 | white | white/10 | Secondary actions |
| `outline` | transparent | white | white/20 | Tertiary actions |
| `ghost` | transparent | white/70 | none | Navigation, text links |
| `glass` | white/5 + blur | white | white/10 | Floating UI |

#### Button Sizes

| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| `sm` | 32px | 12px h | 14px | 8px |
| `default` | 40px | 20px h | 14px | 12px |
| `lg` | 48px | 24px h | 16px | 12px |

#### Button Shapes

- **Rectangular**: Default for forms, toolbars
- **Pill**: Hero CTAs, feature buttons (`rounded-full`)
- **Icon**: Square aspect ratio, always `rounded-full`

---

#### Card Variants

| Variant | Background | Border | Shadow | Use |
|---------|------------|--------|--------|-----|
| `default` | #0a0a0a | white/6% | none | Content cards |
| `elevated` | #141414 | white/8% | shadow-xl | Feature cards |
| `glass` | white/3% + blur | white/8% | shadow-lg | Floating UI |
| `interactive` | default + hover states | white/6% → white/12% | none | Clickable cards |

---

#### Badge Variants

| Variant | Background | Text | Use |
|---------|------------|------|-----|
| `default` | white/10 | white/80 | Labels, tags |
| `accent` | accent/20 | accent | Featured, highlighted |
| `success` | emerald/20 | emerald-400 | Status: complete |

---

#### Input Styling

```css
/* Base input */
.input-base {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
}

/* Focus state */
.input-base:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

/* Placeholder */
.input-base::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
```

---

### Layout Components

#### Section Structure

```
Section
├── SectionLabel      — Uppercase marker + accent dot
├── SectionHeadline   — h1/h2/h3, large type
├── SectionBody       — Prose wrapper, max-width constrained
└── SectionActions    — Button row
```

#### Section Anatomy

```jsx
<Section>
  <SectionLabel>Selected Work</SectionLabel>
  <SectionHeadline>
    Projects that shipped <span className="text-accent">and mattered.</span>
  </SectionHeadline>
  <SectionBody>
    A curated selection of work demonstrating AI product design,
    technical depth, and measurable outcomes.
  </SectionBody>
  <SectionActions>
    <PillButton variant="primary">View All Work</PillButton>
  </SectionActions>
</Section>
```

---

#### App Shell Structure

```
AppShell
├── Header (fixed top)
│   ├── Avatar (left) — link to home
│   └── Social links (right) — GitHub, LinkedIn, Twitter
├── Main content (pt-20 pb-24) — padded for header + dock
└── FloatingDock (fixed bottom center)
    └── Nav items: Home, Work, Lab, Stack, Writing, Agent
```

---

### Case Study Components

Based on the Results-First Scrollytelling structure from content strategy:

#### Results-First Hero

```
CaseStudyHero
├── Visual (key image/video)
├── Title + Tagline
├── Metrics (3 impact numbers)
├── Metadata (role, timeline, stack)
└── CTA ("Read the story ↓")
```

#### Scrollytelling Rail (Desktop)

```
StickyRail (left, 280px)
├── Project metadata
├── Section progress (01-06)
├── Current section highlight
└── Quick links (live/repo)

ScrollContent (right, flex-1)
├── Section 01: Problem
├── Section 02: Constraints
├── Section 03: Approach
├── Section 04: System (with collapsibles)
├── Section 05: Use Cases (interactive cards)
└── Section 06: Results
```

#### Mobile Section Nav

Horizontal scrollable pill bar:

```
[IMPACT] [01 Problem] [02 Constraints] [03 Approach] ...
                      ← swipe →
```

---

## Part 4: Layout System

### Grid System

#### Breakpoints

| Token | Width | Target |
|-------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

#### Content Containers

```css
/* Narrow - prose, forms */
.container-narrow {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Default - main content */
.container-default {
  max-width: 896px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Wide - full sections */
.container-wide {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}
```

---

### Section Spacing Rules

| Context | Mobile | Desktop |
|---------|--------|---------|
| Section vertical padding | 48px | 64px |
| Between sections | 48px | 64px |
| Hero bottom margin | 64px | 96px |
| Content to dock clearance | 96px | 96px |

---

### Case Study Layout

#### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (fixed)                                                   │
├─────────────────────┬───────────────────────────────────────────┤
│ Sticky Rail         │ Scrollable Content                         │
│ (280px, sticky)     │ (flex-1, scrolls)                         │
│                     │                                            │
│ ┌─────────────────┐ │ ┌───────────────────────────────────────┐ │
│ │ Project Title   │ │ │ Section 01: Problem                   │ │
│ │ ───────────     │ │ │ [Content blocks...]                   │ │
│ │ 01 Problem  ●   │ │ └───────────────────────────────────────┘ │
│ │ 02 Constraints  │ │ ┌───────────────────────────────────────┐ │
│ │ 03 Approach     │ │ │ Section 02: Constraints               │ │
│ │ 04 System       │ │ │ [Content blocks...]                   │ │
│ │ 05 Use Cases    │ │ └───────────────────────────────────────┘ │
│ │ 06 Results      │ │ ...                                       │
│ │ ───────────     │ │                                            │
│ │ [Live Demo]     │ │                                            │
│ │ [GitHub]        │ │                                            │
│ └─────────────────┘ │                                            │
├─────────────────────┴───────────────────────────────────────────┤
│ Floating Dock (fixed)                                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Mobile

```
┌───────────────────────────┐
│ Header (fixed)            │
├───────────────────────────┤
│ Hero (results-first)      │
├───────────────────────────┤
│ [Pill Nav] ← swipe →      │
├───────────────────────────┤
│ Content (full width)      │
│ Sections stack vertically │
├───────────────────────────┤
│ Floating Dock (fixed)     │
└───────────────────────────┘
```

---

### Sticky Rail Implementation

```css
.case-study-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
}

.sticky-rail {
  position: sticky;
  top: 96px; /* Header height + gap */
  height: fit-content;
  max-height: calc(100vh - 192px); /* Viewport minus header and dock */
}

@media (max-width: 1023px) {
  .case-study-layout {
    display: block;
  }
  .sticky-rail {
    display: none; /* Use pill nav instead */
  }
}
```

---

## Part 5: Motion System

### Easing Functions

| Token | Curve | Use |
|-------|-------|-----|
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Interactive snaps (buttons, tabs) |
| `ease-snap` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | General UI transitions |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrances, reveals |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exits |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes |

### Duration Tokens

| Token | Duration | Use |
|-------|----------|-----|
| `duration-fast` | 100ms | Micro-interactions (active states) |
| `duration-default` | 150ms | Most transitions |
| `duration-medium` | 200ms | Hover states, color changes |
| `duration-slow` | 300ms | Larger movements, reveals |
| `duration-entrance` | 400ms | Page sections, modals |
| `duration-stagger` | 50ms | Delay between staggered items |

---

### Motion Patterns

#### Button Press

```css
.button {
  transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.button:active {
  transform: scale(0.95);
  transition-duration: 75ms;
}
```

#### Link Underline

```css
.text-link {
  position: relative;
}
.text-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 300ms ease-out;
}
.text-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

#### Card Hover

```css
.interactive-card {
  transition: all 300ms ease-snap;
}
.interactive-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: #0f0f0f;
}
```

#### Dock Indicator Slide

```css
.dock-indicator {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

### Section Reveals (Scroll-triggered)

#### Staggered Entrance

```css
.reveal-item {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 400ms ease-out,
    transform 400ms ease-out;
}

.reveal-item.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.reveal-item:nth-child(1) { transition-delay: 0ms; }
.reveal-item:nth-child(2) { transition-delay: 50ms; }
.reveal-item:nth-child(3) { transition-delay: 100ms; }
.reveal-item:nth-child(4) { transition-delay: 150ms; }
```

#### Implementation (IntersectionObserver)

```typescript
const useReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
};
```

---

### Scroll Sync (Sticky Rail)

```typescript
const useScrollSpy = (sectionIds: string[]) => {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -60% 0%', // Triggers in upper third
        threshold: 0
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
};
```

---

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Part 6: Content Patterns

### Heading Hierarchy

| Context | Element | Style |
|---------|---------|-------|
| Page title | `h1` | Display or H1, once per page |
| Section header | `h2` | H2, introduces new topic |
| Subsection | `h3` | H3, within a section |
| Card title | `h3` or `h4` | H3 style at smaller size |

### Writing Metrics

Format: **Number + Unit** with emphasis on the number.

```
✓ +40% adoption
✓ -35% handle time
✓ 10K active users

✗ Increased adoption by forty percent
✗ 40 percent adoption increase
```

### Section Labels

- Always uppercase
- Include accent dot indicator
- Max 2-3 words
- Examples: "Selected Work", "Technical Approach", "Impact Metrics"

### CTA Writing

| Type | Pattern | Example |
|------|---------|---------|
| Primary | Action + Object | "View Case Study" |
| Secondary | Verb phrase | "Learn More" |
| Tertiary | Arrow + Short phrase | "→ See all projects" |

---

## Part 7: Accessibility

### Color Contrast

All text must meet WCAG AA:
- **Normal text** (< 18px): 4.5:1 minimum
- **Large text** (≥ 18px or 14px bold): 3:1 minimum
- **UI components**: 3:1 minimum

Current contrast ratios (against #000000):
- `#ffffff` (primary): 21:1 ✓
- `#a0a0a0` (secondary): 10:1 ✓
- `#666666` (tertiary): 4.5:1 ✓
- `#ff9f6a` (accent): 8.5:1 ✓

### Focus States

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* Interactive components */
.button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-bg-base),
              0 0 0 4px rgba(255, 255, 255, 0.2);
}
```

### Keyboard Navigation

- All interactive elements accessible via Tab
- Dock items navigable via arrow keys
- Collapsibles toggle via Enter/Space
- `scroll-margin-top` on anchored sections (avoid header overlap)

```css
[id] {
  scroll-margin-top: 96px; /* Header height + padding */
}
```

---

## Part 8: Implementation Checklist

### CSS Variables (globals.css)

- [ ] Add semantic color tokens
- [ ] Add spacing scale variables
- [ ] Add shadow tokens
- [ ] Add motion tokens (easing, duration)
- [ ] Ensure light mode overrides

### Tailwind Theme (inline @theme)

- [ ] Map all color tokens
- [ ] Add custom radius scale
- [ ] Add font stack variables
- [ ] Add custom spacing if needed

### Components to Build

#### Primitives
- [x] Button (variants: primary, secondary, outline, ghost, glass)
- [x] PillButton (rounded-full variant)
- [x] IconButton
- [x] Card (variants: default, elevated, glass)
- [x] Badge (variants: default, accent, success)
- [x] Input
- [x] TextLink

#### Layout
- [x] AppShell
- [x] Header
- [x] FloatingDock
- [x] Section, SectionLabel, SectionHeadline, SectionBody, SectionActions

#### Case Study
- [ ] CaseStudyHero (results-first)
- [ ] StickyRail (desktop)
- [ ] MobileSectionNav (pill bar)
- [ ] Collapsible (for Section 04 technical depth)
- [ ] UseCaseCard (interactive, filterable)
- [ ] MetricCard (impact numbers)

#### Motion
- [ ] useReveal hook (IntersectionObserver)
- [ ] useScrollSpy hook (section tracking)
- [ ] RevealContainer (staggered children)

---

## Quick Reference: Token Values

### Colors (Dark Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#000000` | Page |
| Surface | `#0a0a0a` | Cards |
| Elevated | `#141414` | Lifted |
| Text Primary | `#ffffff` | Headings |
| Text Secondary | `#a0a0a0` | Body |
| Text Tertiary | `#666666` | Captions |
| Accent | `#ff9f6a` | Highlight |
| Border Subtle | `rgba(255,255,255,0.06)` | Dividers |
| Border Default | `rgba(255,255,255,0.10)` | Cards |
| Border Strong | `rgba(255,255,255,0.20)` | Focus |

### Spacing

| Token | Value |
|-------|-------|
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 6 | 24px |
| 8 | 32px |
| 12 | 48px |
| 16 | 64px |

### Motion

| Token | Value |
|-------|-------|
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Snap | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Fast | 100ms |
| Default | 150ms |
| Medium | 200ms |
| Slow | 300ms |
| Entrance | 400ms |

---

## Appendix A: Recommended globals.css Structure

This is what globals.css should look like after migration. Replace the current file with this structure:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ========================================
   FONTS
   ======================================== */

@font-face {
  font-family: "Aeonik Pro";
  src: url("/fonts/AeonikPro-VF.ttf") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Aeonik Pro";
  src: url("/fonts/AeonikPro-Italic-VF.ttf") format("truetype");
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}

/* ========================================
   DESIGN TOKENS (via Tailwind @theme)
   ======================================== */

@theme inline {
  /* Typography */
  --font-sans: "Aeonik Pro", system-ui, sans-serif;
  --font-mono: var(--font-geist-mono);

  /* Motion - Easing */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snap: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Motion - Duration */
  --duration-fast: 100ms;
  --duration-default: 150ms;
  --duration-medium: 200ms;
  --duration-slow: 300ms;
  --duration-entrance: 400ms;
  --stagger-delay: 50ms;

  /* Dock sizing (mobile defaults) */
  --dock-item-size: 2.5rem;
  --dock-gap: 0.25rem;

  /* Radius scale */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 20px;
  --radius-full: 9999px;

  /* ----------------------------------------
     DARK THEME (default)
     ---------------------------------------- */

  /* Backgrounds */
  --color-bg-base: #000000;
  --color-bg-surface: #0a0a0a;
  --color-bg-elevated: #141414;
  --color-bg-glass: rgba(255, 255, 255, 0.03);

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #666666;
  --color-text-muted: #404040;

  /* Accent */
  --color-accent: #ff9f6a;
  --color-accent-soft: rgba(255, 159, 106, 0.2);
  --color-accent-glow: rgba(255, 159, 106, 0.12);

  /* Borders */
  --color-border-subtle: rgba(255, 255, 255, 0.06);
  --color-border-default: rgba(255, 255, 255, 0.10);
  --color-border-strong: rgba(255, 255, 255, 0.20);

  /* Semantic (what Tailwind classes use) */
  --color-background: var(--color-bg-base);
  --color-foreground: var(--color-text-primary);
  --color-muted: var(--color-bg-surface);
  --color-muted-foreground: var(--color-text-secondary);
  --color-border: var(--color-border-default);
  --color-ring: var(--color-border-strong);
  --color-input: var(--color-border-default);

  /* Interactive states */
  --color-primary: var(--color-text-primary);
  --color-primary-foreground: var(--color-bg-base);
  --color-secondary: var(--color-bg-surface);
  --color-secondary-foreground: var(--color-text-primary);
  --color-accent-foreground: var(--color-bg-base);

  /* Semantic colors */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-destructive: #f87171;

  /* Cards & Popovers */
  --color-card: var(--color-bg-surface);
  --color-card-foreground: var(--color-text-primary);
  --color-popover: var(--color-bg-elevated);
  --color-popover-foreground: var(--color-text-primary);

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4);
  --shadow-glow-accent: 0 0 20px var(--color-accent-glow);
  --shadow-glow-white: 0 0 20px rgba(255, 255, 255, 0.1);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-border-subtle);
}

/* ========================================
   BASE STYLES
   ======================================== */

:root {
  color-scheme: dark;
}

/* Dock sizing responsive */
@media (min-width: 768px) {
  :root {
    --dock-item-size: 3rem;
    --dock-gap: 0.5rem;
  }
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
}

/* ========================================
   LIGHT MODE OVERRIDE
   ======================================== */

.light {
  color-scheme: light;

  --color-bg-base: #ffffff;
  --color-bg-surface: #fafafa;
  --color-bg-elevated: #f5f5f5;
  --color-bg-glass: rgba(0, 0, 0, 0.02);

  --color-text-primary: #09090b;
  --color-text-secondary: #52525b;
  --color-text-tertiary: #a1a1aa;
  --color-text-muted: #d4d4d8;

  --color-border-subtle: rgba(0, 0, 0, 0.04);
  --color-border-default: rgba(0, 0, 0, 0.08);
  --color-border-strong: rgba(0, 0, 0, 0.15);

  /* Re-map semantic tokens */
  --color-background: var(--color-bg-base);
  --color-foreground: var(--color-text-primary);
  --color-muted: var(--color-bg-surface);
  --color-muted-foreground: var(--color-text-secondary);
  --color-border: var(--color-border-default);
  --color-primary: var(--color-text-primary);
  --color-primary-foreground: var(--color-bg-base);
  --color-card: var(--color-bg-surface);
  --color-card-foreground: var(--color-text-primary);

  /* Shadows in light mode */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* ========================================
   TYPOGRAPHY UTILITIES
   ======================================== */

@layer utilities {
  /* Display - hero headlines */
  .typo-display {
    font-size: 3rem; /* 48px */
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  /* H1 - page titles */
  .typo-h1 {
    font-size: 2.25rem; /* 36px */
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  /* H2 - section headers */
  .typo-h2 {
    font-size: 1.5rem; /* 24px */
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  /* H3 - card titles */
  .typo-h3 {
    font-size: 1.25rem; /* 20px */
    font-weight: 500;
    line-height: 1.4;
  }

  /* Body */
  .typo-body {
    font-size: 1rem; /* 16px */
    font-weight: 400;
    line-height: 1.6;
  }

  /* Body small */
  .typo-body-sm {
    font-size: 0.875rem; /* 14px */
    font-weight: 400;
    line-height: 1.5;
  }

  /* Caption */
  .typo-caption {
    font-size: 0.75rem; /* 12px */
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: 0.01em;
  }

  /* Section label */
  .typo-label {
    font-size: 0.6875rem; /* 11px */
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

/* ========================================
   ANIMATION UTILITIES
   ======================================== */

@layer utilities {
  /* Reveal animation base */
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity var(--duration-entrance) var(--ease-out),
      transform var(--duration-entrance) var(--ease-out);
  }

  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Stagger delays */
  .stagger-1 { transition-delay: calc(var(--stagger-delay) * 1); }
  .stagger-2 { transition-delay: calc(var(--stagger-delay) * 2); }
  .stagger-3 { transition-delay: calc(var(--stagger-delay) * 3); }
  .stagger-4 { transition-delay: calc(var(--stagger-delay) * 4); }
  .stagger-5 { transition-delay: calc(var(--stagger-delay) * 5); }
}

/* ========================================
   REDUCED MOTION
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
  }
}

/* ========================================
   BASE ELEMENT STYLES
   ======================================== */

@layer base {
  * {
    border-color: var(--color-border);
  }

  /* Scroll margin for anchored sections */
  [id] {
    scroll-margin-top: 96px;
  }
}
```

---

## Appendix B: Component Migration from Playground

The playground components should be moved to `components/` as proper exports:

### File: `components/ui/playground-button.tsx`

Move `PlaygroundButton`, `PillButton`, `IconButton` from playground. Rename to:
- `Button` (rectangular, extends shadcn)
- `PillButton` (new component)
- `IconButton` (new component)

### File: `components/ui/text-link.tsx`

Move `TextLink` component with animated underline.

### File: `components/ui/input.tsx`

Update existing shadcn input to match playground styling.

### File: `components/ui/badge.tsx`

Update existing shadcn badge to add `accent` and `success` variants.

### New Components to Create

| File | Component | Based on |
|------|-----------|----------|
| `components/case-study/metric-card.tsx` | MetricCard | New |
| `components/case-study/case-study-hero.tsx` | CaseStudyHero | New |
| `components/case-study/sticky-rail.tsx` | StickyRail | New |
| `components/case-study/mobile-section-nav.tsx` | MobileSectionNav | New |
| `components/case-study/use-case-card.tsx` | UseCaseCard | New |
| `components/ui/collapsible.tsx` | Collapsible | shadcn + custom |
| `components/motion/reveal.tsx` | Reveal, RevealGroup | New |

---

## Appendix C: Token Quick Reference (Updated)

### Colors

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--color-bg-base` | `#000000` | `#ffffff` |
| `--color-bg-surface` | `#0a0a0a` | `#fafafa` |
| `--color-bg-elevated` | `#141414` | `#f5f5f5` |
| `--color-text-primary` | `#ffffff` | `#09090b` |
| `--color-text-secondary` | `#a0a0a0` | `#52525b` |
| `--color-text-tertiary` | `#666666` | `#a1a1aa` |
| `--color-accent` | `#ff9f6a` | `#ff9f6a` |
| `--color-border-subtle` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.04)` |
| `--color-border-default` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` |

### Motion

| Token | Value |
|-------|-------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--ease-snap` | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| `--duration-fast` | `100ms` |
| `--duration-default` | `150ms` |
| `--duration-medium` | `200ms` |
| `--duration-slow` | `300ms` |
| `--duration-entrance` | `400ms` |
| `--stagger-delay` | `50ms` |

### Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `10px` |
| `--radius-xl` | `12px` |
| `--radius-2xl` | `16px` |
| `--radius-3xl` | `20px` |
| `--radius-full` | `9999px` |

---

*Last updated: January 2026*
