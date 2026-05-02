# ProjectStage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `<ProjectStage>` shader-background component with light + dark + reduced-motion support, then wire it behind the landing-page preview area in `Timeline`.

**Architecture:** A single client-side React component wraps `MeshGradient` from `@paper-design/shaders-react`. It accepts `tint` (`'ledgy' | 'beets'`), `motion` (`'active' | 'frozen'`), `className`, and `children`. It picks a 4-color palette from internal maps based on the resolved theme (via `next-themes`), freezes its motion when `motion="frozen"` OR when the OS reduced-motion preference is set (via `motion/react`'s `useReducedMotion`), and pins the frozen frame to a captured "money frame" so the still image is identical every render. Two new design tokens (`--color-brand-ledgy`, `--color-brand-beets`) are added to `globals.css` for downstream consumers; the shader itself carries its palettes internally.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 (inline `@theme`) · `motion@^12.38.0` (`motion/react`) · `next-themes@^0.4.6` · `@paper-design/shaders-react@0.0.76` (added in Task 1) · Bun.

**Reference spec:** `docs/superpowers/specs/2026-05-02-project-stage-design.md` — all design decisions live there.

---

## File map

**Create:**
- `components/portfolio/project-stage.tsx` — the new component (Tasks 3–7).

**Modify:**
- `package.json` — add `@paper-design/shaders-react@0.0.76` (Task 1).
- `bun.lock` — auto-updated by Bun (Task 1).
- `app/globals.css` — add 2 brand tokens to the `@theme inline` block (Task 2).
- `components/portfolio/timeline.tsx` — render `<ProjectStage>` behind cards (Task 8).

**No test files** — this codebase has no unit-test framework. Verification is `bunx tsc --noEmit` (type contract) + manual visual checks across three modes.

**Existing files referenced (do not modify):**
- `app/providers/theme-provider.tsx` — confirms `next-themes` is configured with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`.
- `lib/utils.ts` — exports `cn(...)` (already used by other portfolio components).
- `DESIGN.md` — flags `--color-accent: #ff9f6a` as provisional. Do NOT remove or migrate it in this plan; spec defers retirement.

---

## Task 1: Install `@paper-design/shaders-react`

**Files:**
- Modify: `package.json` (auto)
- Modify: `bun.lock` (auto)

- [ ] **Step 1: Install the dep at the exact version**

Run:
```bash
bun add @paper-design/shaders-react@0.0.76
```

- [ ] **Step 2: Verify it landed in `package.json`**

Run:
```bash
grep -E "@paper-design/shaders-react" package.json
```

Expected: `"@paper-design/shaders-react": "^0.0.76",` (or `0.0.76` exact). If the line is missing, the install failed — re-run Step 1.

- [ ] **Step 3: Smoke-import in a throwaway script to confirm the package resolves**

Run:
```bash
bun -e "import('@paper-design/shaders-react').then(m => console.log(Object.keys(m).filter(k => k === 'MeshGradient')))"
```

Expected output: `[ 'MeshGradient' ]`. If empty `[]` or an error, the install is broken.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add @paper-design/shaders-react@0.0.76"
```

---

## Task 2: Add brand tokens to `globals.css`

**Files:**
- Modify: `app/globals.css` (inside the `@theme inline { }` block, alongside existing `--color-*` tokens)

- [ ] **Step 1: Locate the `@theme inline` block**

Run:
```bash
grep -n "@theme inline" app/globals.css
```

Expected: a line number (call it L). The block starts at line L with `@theme inline {` and closes some lines later with `}`.

- [ ] **Step 2: Locate a stable insertion point inside the block**

Run:
```bash
grep -n "color-accent" app/globals.css | head -5
```

Pick the FIRST `--color-accent: #ff9f6a;` line inside the `@theme inline` block (light-mode block, NOT inside `.dark { ... }`). Call its line number A. We'll insert immediately AFTER line A.

- [ ] **Step 3: Insert the two brand tokens**

Use the Edit tool to insert the following two lines RIGHT AFTER the `--color-accent: #ff9f6a;` line in the light-mode `@theme inline` block. Match the indentation of surrounding tokens exactly (typically 2 spaces).

```css
  --color-brand-ledgy: #5A1EFF;
  --color-brand-beets: #C5475F;
```

- [ ] **Step 4: Verify the tokens are present and well-formed**

Run:
```bash
grep -nE "color-brand-(ledgy|beets)" app/globals.css
```

Expected output: exactly **two** lines, both with the correct hex values. If you see them inside `.dark { ... }` or anywhere outside `@theme inline`, you inserted in the wrong place — undo and redo at the right spot.

- [ ] **Step 5: Type-check the project to make sure nothing broke**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors. (Tailwind v4 inline-theme tokens don't need TS validation, but this confirms nothing else regressed.)

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat: add Ledgy + Beets brand tokens"
```

---

## Task 3: Scaffold `ProjectStage` component (skeleton, no shader yet)

**Files:**
- Create: `components/portfolio/project-stage.tsx`

This task creates the file with the public types and a returning-null body. We add the shader render in Task 4. This separation lets us catch any TypeScript / import / "use client" issues before WebGL enters the picture.

- [ ] **Step 1: Write the file**

Create `components/portfolio/project-stage.tsx` with this exact content:

```tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

export interface ProjectStageProps {
  /** Palette family. Defaults to 'ledgy'. */
  tint?: ProjectStageTint;
  /** Motion mode. 'active' = animated drift; 'frozen' = locked still frame. Defaults to 'active'. */
  motion?: ProjectStageMotion;
  /** Optional className for sizing/radius/etc. */
  className?: string;
  /** Optional content layered on top of the shader. */
  children?: ReactNode;
}

export function ProjectStage({
  className,
  children,
}: ProjectStageProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify the component imports cleanly from another file (smoke test)**

Run:
```bash
bun -e "import('./components/portfolio/project-stage.tsx').then(m => console.log(typeof m.ProjectStage))"
```

Expected: `function`. If you get `undefined` or an error, the export is wrong.

- [ ] **Step 4: Commit**

```bash
git add components/portfolio/project-stage.tsx
git commit -m "feat: scaffold ProjectStage component"
```

---

## Task 4: Add `MeshGradient` render with `tint`-driven light palette

**Files:**
- Modify: `components/portfolio/project-stage.tsx`

- [ ] **Step 1: Replace the file with this content**

```tsx
"use client";

import type { ReactNode } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

type Palette = readonly [string, string, string, string];

const PALETTES_LIGHT: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
  beets: ["#C5475F", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

const ACTIVE_PARAMS = {
  speed: 0.02,
  scale: 0.75,
  distortion: 0.65,
  swirl: 0.05,
} as const;

export interface ProjectStageProps {
  tint?: ProjectStageTint;
  motion?: ProjectStageMotion;
  className?: string;
  children?: ReactNode;
}

export function ProjectStage({
  tint = "ledgy",
  className,
  children,
}: ProjectStageProps) {
  const colors = PALETTES_LIGHT[tint];

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MeshGradient
        speed={ACTIVE_PARAMS.speed}
        scale={ACTIVE_PARAMS.scale}
        distortion={ACTIVE_PARAMS.distortion}
        swirl={ACTIVE_PARAMS.swirl}
        colors={colors as unknown as string[]}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
```

The `as unknown as string[]` cast is a small bridge because `MeshGradient`'s typed `colors` prop is `string[]` but our internal palette is a fixed-length tuple. The cast preserves our internal type-safety while satisfying the library's looser type.

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual smoke check — drop into a throwaway page**

Create a temporary scratch route to verify the component renders. Create file `app/_scratch/page.tsx`:

```tsx
import { ProjectStage } from "@/components/portfolio/project-stage";

export default function ScratchPage() {
  return (
    <div className="grid grid-cols-2 gap-4 p-8 bg-bg-surface min-h-screen">
      <ProjectStage tint="ledgy" className="aspect-video rounded-2xl border" />
      <ProjectStage tint="beets" className="aspect-video rounded-2xl border" />
    </div>
  );
}
```

- [ ] **Step 4: Run dev and look**

Run (in a separate terminal):
```bash
bun dev
```

Open `http://localhost:3000/_scratch` and verify:
- Two side-by-side cards.
- Left: violet (#5A1EFF) blob in a white field, slowly drifting.
- Right: oxblood (#C5475F) blob in a white field, slowly drifting.
- No console errors.

If either card is fully white (no shader): WebGL probably failed. Check browser devtools console.

If colors are off: re-check the palette tuples in the file.

- [ ] **Step 5: Delete the scratch page**

Run:
```bash
rm -rf app/_scratch
```

- [ ] **Step 6: Commit**

```bash
git add components/portfolio/project-stage.tsx
git commit -m "feat: render MeshGradient with light tint palettes"
```

---

## Task 5: Add dark palette + theme-aware selection

**Files:**
- Modify: `components/portfolio/project-stage.tsx`

- [ ] **Step 1: Replace the file with this content** (adds `PALETTES_DARK`, `useTheme`)

```tsx
"use client";

import type { ReactNode } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

type Palette = readonly [string, string, string, string];

// Light: brand-color focal blob in a white field.
const PALETTES_LIGHT: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
  beets: ["#C5475F", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

// Dark: same focal brand color, field swapped to a deep-tinted near-black.
const PALETTES_DARK: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#1A0B5E", "#1A0B5E", "#1A0B5E"],
  beets: ["#C5475F", "#2C0815", "#2C0815", "#2C0815"],
};

const ACTIVE_PARAMS = {
  speed: 0.02,
  scale: 0.75,
  distortion: 0.65,
  swirl: 0.05,
} as const;

export interface ProjectStageProps {
  tint?: ProjectStageTint;
  motion?: ProjectStageMotion;
  className?: string;
  children?: ReactNode;
}

export function ProjectStage({
  tint = "ledgy",
  className,
  children,
}: ProjectStageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = (isDark ? PALETTES_DARK : PALETTES_LIGHT)[tint];

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MeshGradient
        speed={ACTIVE_PARAMS.speed}
        scale={ACTIVE_PARAMS.scale}
        distortion={ACTIVE_PARAMS.distortion}
        swirl={ACTIVE_PARAMS.swirl}
        colors={colors as unknown as string[]}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual smoke check — recreate scratch and toggle dark class manually**

Create `app/_scratch/page.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { ProjectStage } from "@/components/portfolio/project-stage";

export default function ScratchPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-2 gap-4 p-8 bg-bg-surface min-h-screen">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="col-span-2 rounded-md bg-text-primary px-3 py-2 text-sm text-bg-base"
      >
        Toggle theme — current: {theme}
      </button>
      <ProjectStage tint="ledgy" className="aspect-video rounded-2xl border" />
      <ProjectStage tint="beets" className="aspect-video rounded-2xl border" />
    </div>
  );
}
```

- [ ] **Step 4: Run dev and verify**

Run `bun dev`. Open `http://localhost:3000/_scratch`. Click the toggle.

Expected:
- **Light mode:** white field with violet/oxblood focal blobs (same as Task 4).
- **Dark mode:** field swaps to deep indigo for Ledgy / deep burgundy for Beets, with the same focal brand-color blobs.
- The focal color stays the same hex in both modes; only the field color changes.

- [ ] **Step 5: Delete the scratch page**

```bash
rm -rf app/_scratch
```

- [ ] **Step 6: Commit**

```bash
git add components/portfolio/project-stage.tsx
git commit -m "feat: theme-aware palettes for ProjectStage (light + dark)"
```

---

## Task 6: Add `motion` modes (`active` vs `frozen`) with money-frame lock

**Files:**
- Modify: `components/portfolio/project-stage.tsx`

- [ ] **Step 1: Replace the file with this content** (adds `FROZEN_FRAME` map and frozen logic)

```tsx
"use client";

import type { ReactNode } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

type Palette = readonly [string, string, string, string];

const PALETTES_LIGHT: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
  beets: ["#C5475F", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

const PALETTES_DARK: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#1A0B5E", "#1A0B5E", "#1A0B5E"],
  beets: ["#C5475F", "#2C0815", "#2C0815", "#2C0815"],
};

// "Money frame" captured from Paper for each tint. Frame is theme-agnostic:
// it controls the noise phase, not colors.
const FROZEN_FRAME: Record<ProjectStageTint, number> = {
  ledgy: 114899.41599999536,
  beets: 0, // TODO: capture in Paper, paste exact value before Beets ships frozen
};

const ACTIVE_PARAMS = {
  speed: 0.02,
  scale: 0.75,
  distortion: 0.65,
  swirl: 0.05,
} as const;

export interface ProjectStageProps {
  tint?: ProjectStageTint;
  motion?: ProjectStageMotion;
  className?: string;
  children?: ReactNode;
}

export function ProjectStage({
  tint = "ledgy",
  motion = "active",
  className,
  children,
}: ProjectStageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isFrozen = motion === "frozen";
  const colors = (isDark ? PALETTES_DARK : PALETTES_LIGHT)[tint];

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MeshGradient
        speed={isFrozen ? 0 : ACTIVE_PARAMS.speed}
        scale={ACTIVE_PARAMS.scale}
        distortion={ACTIVE_PARAMS.distortion}
        swirl={ACTIVE_PARAMS.swirl}
        frame={isFrozen ? FROZEN_FRAME[tint] : undefined}
        colors={colors as unknown as string[]}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual smoke check — show frozen vs active**

Create `app/_scratch/page.tsx`:

```tsx
import { ProjectStage } from "@/components/portfolio/project-stage";

export default function ScratchPage() {
  return (
    <div className="grid grid-cols-2 gap-4 p-8 bg-bg-surface min-h-screen">
      <div className="space-y-2">
        <p className="text-sm text-text-label">Ledgy · active (drifts)</p>
        <ProjectStage tint="ledgy" motion="active" className="aspect-video rounded-2xl border" />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-text-label">Ledgy · frozen (still)</p>
        <ProjectStage tint="ledgy" motion="frozen" className="aspect-video rounded-2xl border" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run dev and verify**

Run `bun dev`. Open `http://localhost:3000/_scratch`. Watch both cards for ~10 seconds.

Expected:
- Left card slowly drifts (the violet blob moves position over time).
- Right card is **completely still** — pixel-identical from one second to the next.
- Both show the same overall composition: violet focal in white field.

- [ ] **Step 5: Delete the scratch page**

```bash
rm -rf app/_scratch
```

- [ ] **Step 6: Commit**

```bash
git add components/portfolio/project-stage.tsx
git commit -m "feat: motion modes for ProjectStage (active drift vs frozen frame)"
```

---

## Task 7: Add reduced-motion handling

**Files:**
- Modify: `components/portfolio/project-stage.tsx`

- [ ] **Step 1: Replace the file with this content** (adds `useReducedMotion`)

```tsx
"use client";

import type { ReactNode } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type ProjectStageTint = "ledgy" | "beets";
export type ProjectStageMotion = "active" | "frozen";

type Palette = readonly [string, string, string, string];

const PALETTES_LIGHT: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
  beets: ["#C5475F", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

const PALETTES_DARK: Record<ProjectStageTint, Palette> = {
  ledgy: ["#5A1EFF", "#1A0B5E", "#1A0B5E", "#1A0B5E"],
  beets: ["#C5475F", "#2C0815", "#2C0815", "#2C0815"],
};

const FROZEN_FRAME: Record<ProjectStageTint, number> = {
  ledgy: 114899.41599999536,
  beets: 0, // TODO: capture in Paper, paste exact value before Beets ships frozen
};

const ACTIVE_PARAMS = {
  speed: 0.02,
  scale: 0.75,
  distortion: 0.65,
  swirl: 0.05,
} as const;

export interface ProjectStageProps {
  tint?: ProjectStageTint;
  motion?: ProjectStageMotion;
  className?: string;
  children?: ReactNode;
}

export function ProjectStage({
  tint = "ledgy",
  motion = "active",
  className,
  children,
}: ProjectStageProps) {
  const prefersReduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isFrozen = motion === "frozen" || prefersReduced === true;
  const colors = (isDark ? PALETTES_DARK : PALETTES_LIGHT)[tint];

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MeshGradient
        speed={isFrozen ? 0 : ACTIVE_PARAMS.speed}
        scale={ACTIVE_PARAMS.scale}
        distortion={ACTIVE_PARAMS.distortion}
        swirl={ACTIVE_PARAMS.swirl}
        frame={isFrozen ? FROZEN_FRAME[tint] : undefined}
        colors={colors as unknown as string[]}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
```

The `=== true` comparison on `prefersReduced` is intentional: `useReducedMotion()` from `motion/react` can return `null` during SSR before the matchMedia query resolves. Treating `null` as "not reduced" (default to motion) is the correct fallback.

- [ ] **Step 2: Type-check**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual reduced-motion check**

Enable reduced motion at the OS level:
- **macOS:** System Settings → Accessibility → Display → "Reduce motion" → on.
- **Windows:** Settings → Accessibility → Visual effects → Animation effects → off.
- **Linux/GNOME:** `gsettings set org.gnome.desktop.interface enable-animations false`.

Create `app/_scratch/page.tsx`:

```tsx
import { ProjectStage } from "@/components/portfolio/project-stage";

export default function ScratchPage() {
  return (
    <div className="p-8 bg-bg-surface min-h-screen">
      <p className="text-sm text-text-label mb-2">
        motion=&quot;active&quot; — should be FROZEN if OS reduce-motion is on.
      </p>
      <ProjectStage tint="ledgy" motion="active" className="aspect-video rounded-2xl border" />
    </div>
  );
}
```

Run `bun dev`. Open `http://localhost:3000/_scratch`. Watch for 10 seconds.

Expected: shader is completely still — even though `motion="active"` is set, the OS preference forces it to freeze.

Toggle the OS setting OFF, refresh the page. Expected: shader now drifts.

- [ ] **Step 4: Delete the scratch page**

```bash
rm -rf app/_scratch
```

- [ ] **Step 5: Commit**

```bash
git add components/portfolio/project-stage.tsx
git commit -m "feat: respect prefers-reduced-motion in ProjectStage"
```

---

## Task 8: Wire `<ProjectStage>` into `Timeline` behind the cards

**Files:**
- Modify: `components/portfolio/timeline.tsx`

The Timeline currently renders the cards in a `<motion.main>` inside a positioned wrapper. We add `<ProjectStage>` as an absolutely-positioned sibling **before** the main, so it sits behind every card while letting click events pass through (the shader has `pointer-events: none` internally).

- [ ] **Step 1: Add the import**

Find the existing imports at the top of `components/portfolio/timeline.tsx`. Add this line alongside the other portfolio imports (around the imports for `InlineProjectDetail`, `InlineProjectGallery`, `ResizableRail`):

```tsx
import { ProjectStage } from "./project-stage";
```

- [ ] **Step 2: Locate the main-area wrapper**

In `components/portfolio/timeline.tsx`, find the JSX block that looks like this (currently around line 211):

```tsx
<div className="flex-1 relative overflow-hidden">
  <motion.main
    ref={!isExpanded ? containerRef : undefined}
    animate={{
      opacity: isExpanded ? 0 : 1,
      filter: isExpanded ? "blur(6px)" : "blur(0px)",
      scale: isExpanded ? 0.995 : 1,
    }}
    transition={{
      duration: isExpanded ? 0.24 : DURATION,
      ease: EASE_OUT,
    }}
    className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4"
    style={{ pointerEvents: isExpanded ? "none" : "auto" }}
  >
    {cards}
  </motion.main>
```

- [ ] **Step 3: Insert `<ProjectStage>` as the first child of that wrapper**

Insert this block on the line **immediately after** `<div className="flex-1 relative overflow-hidden">` and **before** `<motion.main`:

```tsx
      <ProjectStage
        tint="ledgy"
        motion="active"
        className="absolute inset-0"
      />
```

(Use the indentation that matches surrounding JSX — typically 6 spaces given the nesting level.)

- [ ] **Step 4: Type-check**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Visual check — landing page in context**

Run `bun dev`. Open `http://localhost:3000`.

Expected:
- Sidebar with "Lead Product Designer at Ledgy" and 5 project rows (unchanged).
- Right preview area now shows the chapel-violet shader drifting slowly behind whatever HeroCard is visible.
- Hovering over a HeroCard still triggers the existing hover overlay.
- Clicking a project still expands the inline detail view (scroll-spy + expand behavior unchanged).
- No console errors.

If the shader is on TOP of the cards (covering them): you put it AFTER the `<motion.main>` instead of before. The render-order rule is: later siblings stack on top. Move it before.

- [ ] **Step 6: Commit**

```bash
git add components/portfolio/timeline.tsx
git commit -m "feat: render ProjectStage behind landing preview cards"
```

---

## Task 9: Final cross-mode verification

This task is **all manual visual / regression checks**. No code changes. The goal is to sign off the Definition of Done from the spec.

**Files:** none (verification only).

- [ ] **Step 1: Light-mode visual sign-off**

Run `bun dev`. Open `http://localhost:3000`. Theme should be light by default.

Verify:
- Shader visible behind all HeroCards.
- Brand violet reads as a focal blob in a white field, not a dominant fog.
- Drift is slow — the eye doesn't track it from second to second.
- HeroCards remain clickable (no shader blocking).
- Identity panel (top-left) still opens / closes / accepts focus.

- [ ] **Step 2: Dark-mode visual sign-off**

Toggle the site to dark mode via `next-themes`'s storage key. Since `enableSystem` is `false`, the canonical way is to set the storage value directly. Open browser devtools console on `http://localhost:3000` and run:

```js
localStorage.setItem("theme", "dark"); location.reload();
```

The page reloads in dark mode (the `dark` class is now on `<html>`).

Verify:
- Shader field is now deep indigo (the `#1A0B5E` tint), NOT pure black.
- Focal violet blob still visible and recognizable as the same brand color.
- No harsh banding between the violet and the indigo field.
- Existing dark-mode tokens (text colors, surfaces) on the rest of the page look correct — the shader should harmonize, not clash.

Switch back to light:

```js
localStorage.setItem("theme", "light"); location.reload();
```

- [ ] **Step 3: Reduced-motion sign-off**

Enable OS reduce-motion (see Task 7, Step 3 for per-OS instructions). Refresh `http://localhost:3000`.

Verify:
- Shader is completely still — no drift over 10+ seconds of observation.
- All other UI motion (e.g., the identity panel expansion blur, the scroll-spy active state, the inline detail expand) still works at its normal speed (these aren't gated by reduce-motion in the existing code, and shouldn't be regressed by this change).

Disable OS reduce-motion. Refresh. Confirm the shader resumes drifting.

- [ ] **Step 4: Regression smoke**

With light mode + motion enabled (the default):

- [ ] Click each project in the sidebar. Each one expands its inline detail without flicker.
- [ ] Click "back" / press Escape on the detail. It collapses.
- [ ] Scroll the main area. The scroll-spy correctly highlights the active project in the sidebar.
- [ ] Resize the sidebar rail. The shader resizes with the main area.
- [ ] Open the identity panel (click avatar). It animates open with blur. The shader behind doesn't twitch.
- [ ] Browser console is clean — no warnings, no errors, no React hydration mismatches.

- [ ] **Step 5: Production build smoke**

Run:
```bash
bun run build
```

Expected: build succeeds with no type errors and no missing modules. (If this is too slow during iteration, `bunx tsc --noEmit` is a faster proxy — but a full build is the canonical "ship-ready" check.)

- [ ] **Step 6: Final commit (if anything trivial got fixed during sign-off)**

If Steps 1–5 all passed cleanly, no commit is needed. If any tiny fix landed (a typo, a missing space), commit it:

```bash
git add -A
git commit -m "chore: post-verification cleanup for ProjectStage"
```

- [ ] **Step 7: Mark Definition of Done complete**

In `docs/superpowers/specs/2026-05-02-project-stage-design.md`, Appendix C — flip every `- [ ]` to `- [x]`. Commit:

```bash
git add docs/superpowers/specs/2026-05-02-project-stage-design.md
git commit -m "docs: ProjectStage Phase 1 — Definition of Done complete"
```

---

## Done

Phase 1 is shipped:
- `<ProjectStage>` exists at `components/portfolio/project-stage.tsx`.
- Two brand tokens added to `globals.css`.
- Wired into `Timeline` with `tint="ledgy"` hardcoded.
- Light + dark + reduced-motion all verified.

**Next phases** (separate plans, not this one):
- Phase 2: active-project-driven tint switching (Beets ↔ Ledgy crossfade).
- Phase 3: ProjectStage on inline detail surfaces and About page.
- Accent retirement: migrate `--color-accent` consumers to `--color-brand-ledgy`.
