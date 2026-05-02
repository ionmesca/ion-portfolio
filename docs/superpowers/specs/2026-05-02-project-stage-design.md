---
title: ProjectStage — background shader system
date: 2026-05-02
status: design
owner: ion
related:
  - docs/superpowers/specs/2026-04-01-single-page-portfolio-design.md
  - DESIGN.md
  - app/globals.css
---

# ProjectStage — design spec

A reusable background-shader component that gives every project surface in the portfolio a tint, an atmosphere, and a controllable level of motion. One component, two palette families, two motion modes.

## 1. Brief

The portfolio currently has a beautiful but **empty** preview area on the landing page (the right pane next to the project list). It needs an atmospheric background that:

- Reads as **distinctively Ion's** — not a generic Tailwind gradient.
- Stays **light-mode friendly** — DESIGN.md is explicit that the landing is light-first (gray app surface behind a white shell).
- Carries **Ledgy's brand violet** when on Ledgy work, **Beets's burgundy** when on Beets, with room for future palettes.
- Can be **expressive** (slowly drifting shader) on hero surfaces and **calm** (frozen mesh) on reading surfaces.
- Respects `prefers-reduced-motion` automatically.
- Hands off cleanly to any build agent — one component, one prop set, no surprises.

**Success criteria.** Drop `<ProjectStage tint="ledgy" />` into the codebase and get the validated chapel-violet stage. Drop `<ProjectStage tint="beets" />` and get the burgundy variant. Toggle `motion="frozen"` for thumbnails or accessibility. No other configuration needed at the call site.

## 2. Strategic decisions

### 2.1 Wow vs quiet — two registers, both legitimate

The portfolio needs both a *first-impression wow* (earns attention while a visitor is *deciding* whether to engage) and *quiet proof of work* (respects them while they're *reading*). The mapping:

| Surface | Register | Motion |
|---|---|---|
| Landing preview area (active project hero) | Wow | `active` |
| Project detail (when expanded inline) | Quiet | `frozen` |
| About page | Quiet | `frozen` |
| Writing / notes | None | no stage |

This split prevents the shader from undermining the "Quiet Proof of Work" thesis on content-heavy surfaces while still earning the first-impression moment on the landing.

### 2.2 Two parameterized shaders, not many

Every Ledgy project (AI Document Auditor, Tranche Builder, Admin Home, Ledgy Agent, Ripple) shares the **Ledgy violet** stage. Beets uses its own **burgundy** stage. Future personal projects will get their own palettes when shipped.

Why not one shader per project? Two parameterized shaders give us identity + variety. Ten unrelated shaders give us inconsistency, more design surface to maintain, and more GPU cost.

### 2.3 Light + dark parity from day one

Per DESIGN.md: the landing is a soft gray app surface behind a white shell. The shader sits **inside** that white shell, so it must be designed light-first — mostly white with a focal color blob, not a dark dramatic field.

Dark mode follows the same philosophy with one swap: same focal brand color, but the field becomes a **deep-tinted near-black** (a dark indigo for Ledgy, a deep burgundy for Beets), not pure black. This keeps the brand recognizable in both modes and avoids the "dark dramatic curtain" energy that would undermine the calm thesis.

### 2.4 Paper Design's `MeshGradient` as the primitive

Paper's `MeshGradient` (from `@paper-design/shaders-react@0.0.76`) is the right primitive: real WebGL, slow temporal motion, configurable colors and distortion, exports cleanly to React. The validated parameters were dialed in directly in Paper's UI and exported as JSX — the captured "money frame" lives in this spec (Section 4.4).

## 3. Visual direction

**Mood — Ledgy.** Calm, almost-still violet wave inside a white field. Reads as architectural restraint, not "AI demo." Single light direction. The brand violet appears as a focal moment, not a wallpaper.

**Mood — Beets.** Same composition, palette swapped to oxblood-on-cream. Warm, kitchen-at-dusk feel.

**The shader's job is to be barely noticed.** It is atmosphere, not subject. When content (a HeroCard, a project detail) sits on top, the shader steps back. The card commands; the shader supports.

## 4. The `<ProjectStage>` component

### 4.1 File location

```
components/portfolio/project-stage.tsx
```

### 4.2 Dependency

```bash
bun add @paper-design/shaders-react@0.0.76
```

### 4.3 Public API

```tsx
import type { ReactNode } from 'react';

type Tint = 'ledgy' | 'beets';
type Motion = 'active' | 'frozen';

interface ProjectStageProps {
  /** Palette family. Defaults to 'ledgy'. */
  tint?: Tint;
  /** Motion mode. 'active' = animated drift; 'frozen' = locked still frame. Defaults to 'active'. */
  motion?: Motion;
  /** Optional className for sizing/radius/etc. */
  className?: string;
  /** Optional content layered on top of the shader. */
  children?: ReactNode;
}

export function ProjectStage(props: ProjectStageProps): JSX.Element;
```

### 4.4 Reference implementation

```tsx
// components/portfolio/project-stage.tsx
'use client';

import { MeshGradient } from '@paper-design/shaders-react';
import { useReducedMotion } from 'motion/react';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tint = 'ledgy' | 'beets';
type Motion = 'active' | 'frozen';
type Palette = [string, string, string, string]; // 4 stops for MeshGradient

// Light: brand-color focal blob in a white field.
const PALETTES_LIGHT: Record<Tint, Palette> = {
  ledgy: ['#5A1EFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  beets: ['#C5475F', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
};

// Dark: same focal brand color, field swapped to a deep-tinted near-black.
const PALETTES_DARK: Record<Tint, Palette> = {
  ledgy: ['#5A1EFF', '#1A0B5E', '#1A0B5E', '#1A0B5E'],
  beets: ['#C5475F', '#2C0815', '#2C0815', '#2C0815'],
};

// "Money frame" captured from Paper for each tint. Frame is theme-agnostic:
// it controls the noise phase, not colors.
const FROZEN_FRAME: Record<Tint, number> = {
  ledgy: 114899.41599999536,
  beets: 0, // TODO: capture in Paper, paste exact value
};

const ACTIVE_PARAMS = {
  speed: 0.02,
  scale: 0.75,
  distortion: 0.65,
  swirl: 0.05,
} as const;

interface ProjectStageProps {
  tint?: Tint;
  motion?: Motion;
  className?: string;
  children?: ReactNode;
}

export function ProjectStage({
  tint = 'ledgy',
  motion = 'active',
  className,
  children,
}: ProjectStageProps) {
  const prefersReduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isFrozen = motion === 'frozen' || prefersReduced;
  const isDark = resolvedTheme === 'dark';
  const colors = (isDark ? PALETTES_DARK : PALETTES_LIGHT)[tint];

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      <MeshGradient
        speed={isFrozen ? 0 : ACTIVE_PARAMS.speed}
        scale={ACTIVE_PARAMS.scale}
        distortion={ACTIVE_PARAMS.distortion}
        swirl={ACTIVE_PARAMS.swirl}
        frame={isFrozen ? FROZEN_FRAME[tint] : undefined}
        colors={colors}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
```

**SSR / hydration note.** `useTheme()` from `next-themes` returns `undefined` on first server render, then resolves on the client. Until resolved, the falsy check on `resolvedTheme === 'dark'` defaults to the light palette. There may be a one-frame flash for users on dark mode. This is acceptable for an MVP — the shader fades in via WebGL anyway. If the flash becomes noticeable in practice, we can gate render on a `mounted` state.

### 4.5 Validated shader parameters

Captured from Paper file `01KMJ9G3R26NWX4WDDZJKJ0AZD`, node `97-0`, on 2026-05-02:

```tsx
<MeshGradient
  speed={0.02}
  scale={0.75}
  distortion={0.65}
  swirl={0.05}
  frame={114899.41599999536}
  colors={['#5A1EFF', '#FFFFFF', '#FFFFFF', '#FFFFFF']}
/>
```

**Do not change these values without re-validating in Paper.** They are the result of a long iteration between mostly-white field and a focal violet blob. Edits should happen in Paper, not in code.

## 5. Palette tokens

Add to `app/globals.css` `@theme inline` block (alongside existing `--color-*` tokens):

```css
--color-brand-ledgy: #5A1EFF;  /* Ledgy primary brand violet */
--color-brand-beets: #C5475F;  /* Beets primary brand oxblood */
```

That's it. Two tokens.

**Why so few?**

- `<ProjectStage>` carries its own palettes internally (light + dark). It does not consume these tokens directly.
- These exist as canonical brand references for any *future* consumer — badges, focus rings, hover states, decorative accents — so the brand is defined in one place.
- We add more shades only when a real consumer needs them. Defining a full ramp now is YAGNI.

**Note on existing accent token.** `--color-accent: #ff9f6a` in `globals.css` is flagged by DESIGN.md as provisional ("not the final brand accent"). It's not removed in this spec, but the long-term direction is to migrate accent uses toward `--color-brand-ledgy` and retire `#ff9f6a`. Tracked in Section 11.

## 6. Motion rules

### 6.1 When `motion="active"`

The shader drifts at `speed=0.02` — slow enough that the eye doesn't track it but fast enough that the page feels alive. Use on:

- Landing preview area (the visible HeroCard's stage)
- Hero moments where the visitor is **looking at**, not **reading**

### 6.2 When `motion="frozen"`

The shader renders a single still frame from `FROZEN_FRAME[tint]`. Use on:

- HeroCard thumbnails (when many are stacked and only one is "active")
- Project detail pages (reading mode)
- About page background
- Anywhere `prefers-reduced-motion: reduce` is set (handled automatically)

### 6.3 Reduced motion

`useReducedMotion()` from `motion/react` is checked inside the component. When true, the component **automatically** falls through to frozen mode regardless of the `motion` prop. No additional setup required at the call site.

## 7. Integration points

### 7.1 Landing — preview area (Phase 1, ship first)

In `components/portfolio/timeline.tsx`, the main preview area currently looks like:

```tsx
<div className="flex-1 relative overflow-hidden">
  <motion.main className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4">
    {cards}
  </motion.main>
  ...
</div>
```

Add `<ProjectStage>` as a sibling **before** `<motion.main>`:

```tsx
<div className="flex-1 relative overflow-hidden">
  <ProjectStage
    tint="ledgy"
    motion="active"
    className="absolute inset-0"
  />
  <motion.main className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4">
    {cards}
  </motion.main>
  ...
</div>
```

**Stacking note.** Both elements use `absolute inset-0`. With default `z-index: auto`, the later sibling wins — `<motion.main>` renders **on top** of `<ProjectStage>`. No explicit `z-index` needed. The shader has `pointer-events: none` internally, so it never blocks clicks on cards.

The stage sits behind every HeroCard. HeroCards retain their own surface treatment (the existing `bg-bg-surface` rounded card with the project hero image). The shader provides Ledgy ambient; the cards provide content.

### 7.2 HeroCard — no change required for Phase 1

`components/portfolio/hero-card.tsx` does **not** need to change. The card still renders its own image and overlay; the shader is purely behind it.

### 7.3 Tint switching when active project changes (Phase 2)

When the active project is **Beets**, the stage should crossfade to `tint="beets"`. When it's any **Ledgy** project, the stage stays `tint="ledgy"`. Implementation sketch (in Timeline):

```tsx
const activeProject = projects.find(p => p.slug === activeSlug);
const stageTint = activeProject?.slug === 'beets' ? 'beets' : 'ledgy';

<ProjectStage tint={stageTint} className="absolute inset-0" />
```

The crossfade itself can be handled either by:

- (a) Two `ProjectStage` components stacked with `motion/react` opacity transition, or
- (b) Re-mounting on key change with a CSS `transition: opacity`.

Phase 2 — not required for the first ship. Phase 1 ships with `tint="ledgy"` hardcoded.

### 7.4 Project detail surfaces (Phase 3)

`components/portfolio/inline-project-detail.tsx` and any standalone detail pages get `<ProjectStage tint={…} motion="frozen" />` as their background. This carries the Ledgy/Beets identity through without distracting from the case-study content.

## 8. Accessibility & performance

### 8.1 Accessibility

- ✅ `prefers-reduced-motion` respected automatically (Section 6.3).
- ✅ `pointer-events: none` on the shader so it never blocks clicks on overlaid content.
- ✅ Decorative — no `role` or `aria-*` needed; content above carries semantics.

### 8.2 Performance

- WebGL has GPU cost. **Render at most one `motion="active"` instance per page.** Multiple animated stages compete for the same GPU and reduce frame rate.
- Frozen stages are fine to multi-render; they only paint once.
- Browsers cap concurrent WebGL contexts (~16). If a future surface uses many `<ProjectStage>` thumbnails, swap to a static PNG poster frame for the bulk.
- The component is `'use client'` — Next.js will not SSR it. There may be a brief unstyled moment on first paint. Acceptable.

### 8.3 Bundle size

`@paper-design/shaders-react` adds ~30 KB gzipped. Dynamic import isn't required for an MVP but is a future option if bundle budgets tighten.

## 9. Out of scope

The following are explicitly **not** part of this spec:

- **Beets `frozen` frame value.** The Ledgy frozen frame is captured (`114899.41599999536`); the Beets equivalent must be captured in Paper before Beets stages ship in `motion="frozen"`. Tracked in Section 10.
- **Active-project-driven tint switching.** Phase 1 hardcodes `tint="ledgy"` in Timeline. Switching tints when Beets is the active project (with crossfade) is Phase 2.
- **Diagonal CSS-bar pattern variant.** Earlier in the design exploration we built a CSS `repeating-linear-gradient` bar pattern at the Ledgy logo angle (parked at `.superpowers/brainstorm/.../05-stage-lab.html`). Future direction — could be a graphic, "logo-led" alternative or an additional layer behind the shader.
- **Ripple-specific tint variant.** All Ledgy projects use the same `ledgy` tint in this spec. If Ripple, Agent, or any specific project needs a distinct accent, that's a future palette extension.
- **Detail-page subtle motion.** Project detail surfaces are `frozen` for now. Subtle motion on detail pages is a future polish.
- **Retiring `--color-accent`.** Migrating existing `#ff9f6a` accent uses to `--color-brand-ledgy` is a separate cleanup tracked in Section 11.

## 10. Open questions

- **Beets `FROZEN_FRAME` value.** Capture in Paper before Beets stages ship in frozen mode. Workflow: open the Paper file, drop a Mesh Gradient with the Beets palette, drag the `frame` slider until the burgundy blob lands in a beautiful position, copy that frame value, paste into the constant.
- **Where does the active stage tint switch?** Phase 2 work — answered when we wire tint-per-active-project.
- **Crossfade implementation choice.** `motion/react` two-instance vs. CSS `key` re-mount. Decided when Phase 2 lands.

## 11. Future directions

- **Phase 2 — active-project-driven tint switching.** When the active project changes between Ledgy work and Beets, crossfade the stage tint. Implementation choice (two stacked instances vs. key-remount) decided when the work lands.
- **Phase 3 — ProjectStage on detail surfaces.** Inline project detail and About page get `motion="frozen"` stages.
- **Accent retirement.** Migrate existing `--color-accent: #ff9f6a` consumers to `--color-brand-ledgy` and remove the provisional accent token.
- **Diagonal CSS-bar pattern.** Optional alternative or composable layer (Section 9).
- **Per-project accent override.** Only if a specific need surfaces (e.g., Ripple needs a cyan tinge).

## Appendix A — captured shader JSX (source of truth)

```tsx
/** @paper-design/shaders-react@0.0.76 */
import { MeshGradient } from '@paper-design/shaders-react';

/**
 * Captured from Paper
 * https://app.paper.design/file/01KMJ9G3R26NWX4WDDZJKJ0AZD/01KMJ9G3R2SQGK9JY20D67YB8J/97-0
 * on May 2, 2026
 */
export default function () {
  return (
    <MeshGradient
      speed={0.02}
      scale={0.75}
      distortion={0.65}
      swirl={0.05}
      frame={114899.41599999536}
      colors={['#5A1EFF', '#FFFFFF', '#FFFFFF', '#FFFFFF']}
      style={{ alignSelf: 'stretch', flex: 1 }}
    />
  );
}
```

## Appendix B — Paper references

- **Paper file:** `01KMJ9G3R26NWX4WDDZJKJ0AZD`
- **Page:** `01KMJ9G3R2SQGK9JY20D67YB8J`
- **Validated Ledgy shader node:** `97-0`
- **Landing mock artboard:** `S-0` (named "Landing — current") — faithful to current code with real assets and typography.

## Appendix C — definition of done (Phase 1)

- [ ] `@paper-design/shaders-react@0.0.76` installed.
- [ ] `components/portfolio/project-stage.tsx` created with the reference implementation from Section 4.4.
- [ ] Palette tokens from Section 5 added to `app/globals.css` (`--color-brand-ledgy`, `--color-brand-beets`).
- [ ] `<ProjectStage tint="ledgy" motion="active" />` integrated into `components/portfolio/timeline.tsx` per Section 7.1.
- [ ] **Light-mode visual check:** shader visible behind HeroCards, no click blocking, drift is slow, brand violet feels like a focal blob in a white field.
- [ ] **Dark-mode visual check:** toggle theme to dark; shader field swaps to deep indigo, focal violet still recognizable, no harsh banding.
- [ ] **Reduced motion check:** enable OS `prefers-reduced-motion: reduce`; shader freezes (no drift visible).
- [ ] **No regressions:** existing tests pass; manual smoke test of expand/collapse, scroll-spy, identity panel open/close.
