---
name: Ion Portfolio
description: Handoff design system guidance for Ion Mesca's portfolio landing experience.
colors:
  app-surface: "#f5f5f5"
  panel-base: "#ffffff"
  panel-surface: "#f5f5f5"
  panel-elevated: "#f5f5f5"
  text-primary: "#171717"
  text-secondary: "#525252"
  text-tertiary: "#a3a3a3"
  text-muted: "#d4d4d4"
  border-default: "#e5e5e5"
  border-subtle: "#f0f0f0"
  border-strong: "#d4d4d4"
  accent-provisional: "#ff9f6a"
  dark-bg-base: "#000000"
  dark-bg-surface: "#0a0a0a"
  dark-bg-elevated: "#141414"
typography:
  display:
    fontFamily: "Aeonik Pro, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Aeonik Pro, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Aeonik Pro, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Aeonik Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Aeonik Pro, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  rail-padding-x: "16px"
  rail-padding-top: "24px"
  content-gap: "16px"
  project-row-padding: "8px"
components:
  landing-shell:
    backgroundColor: "{colors.panel-base}"
    rounded: "{rounded.3xl}"
  project-row-active:
    backgroundColor: "{colors.panel-elevated}"
    rounded: "{rounded.xl}"
  shadcn-button-default:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.panel-base}"
    rounded: "{rounded.md}"
    height: "36px"
  card-default:
    backgroundColor: "{colors.panel-base}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: "24px"
---

# Design System: Ion Portfolio

## 1. Overview

**Creative North Star: "Quiet Proof of Work"**

This design system documents how to apply the current portfolio landing experience consistently. It is a handoff and decision guide, not the source of exact token values. The source of truth for token values is `app/globals.css`, especially the Tailwind v4 `@theme inline` block and the `.dark` override. This document explains what those tokens mean, when to use them, and what patterns future agents should preserve.

The current source-of-truth surface is the landing page: `app/page.tsx`, `components/portfolio/*`, `app/layout.tsx`, and `app/globals.css`. Legacy routes, older docs, playground screens, and unused component experiments may be useful context, but they are not design authority unless this file explicitly promotes them.

The landing experience is light-first: the browser page is a soft gray app surface, and the primary framed portfolio shell is white. This creates a product-like workspace: calm background, clear work area, subtle dividers, and highly legible project evidence. Dark mode is structurally supported through semantic tokens, but light landing behavior is the validated baseline today.

Mobile is under development. Preserve mobile functionality and accessibility, but do not infer final mobile visual rules from the current implementation. New mobile design decisions should be documented here after the mobile system is intentionally finalized.

**Source Of Truth Rules:**
- Exact color, radius, shadow, typography, and motion token values live in `app/globals.css`.
- `DESIGN.md` defines semantics, intent, constraints, and usage rules.
- shadcn components should consume semantic Tailwind token classes such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, and project tokens such as `bg-bg-base`, `bg-bg-surface`, `text-text-secondary`.
- When retheming shadcn, use shadcn-compatible semantic CSS variables plus Tailwind neutral scales. Do not hard-code one-off colors inside components when a token can express the role.

## 2. Colors

The palette is neutral and architectural: gray page chrome, white content panels, restrained borders, and one accent lane that is currently provisional.

### Primary

- **Panel Base** (`--color-bg-base`, currently `#ffffff` in light mode): the primary content shell and identity panel surface. Use for the landing card/panel itself, not for the outer page.
- **Text Primary** (`--color-text-primary`, currently `#171717` in light mode): headings, project names, selected labels, and high-emphasis interface text.

### Secondary

- **App Surface** (`--color-bg-surface`, currently `#f5f5f5` in light mode): the page background behind the landing shell. This is the gray visible outside the white card in the landing screenshot. It is correct and should remain a neutral surface role, not an error.
- **Elevated Neutral** (`--color-bg-elevated`, currently `#f5f5f5` in light mode): active rows, hover zones, and quiet grouped affordances inside the white shell.
- **Border Subtle / Default / Strong** (`--color-border-subtle`, `--color-border-default`, `--color-border-strong`): dividers, shell rings, field borders, resize rails, and focus-adjacent structure.

### Tertiary

- **Accent Provisional** (`--color-accent`, currently `#ff9f6a`): this token exists in code but is not accepted as the final brand accent. Until corrected, do not expand its use, build new accent-heavy patterns, or document it as the finished brand color. Use it only where the current code already requires an accent role, such as focus rings or legacy accent badges.
- **Status Colors** (`--color-success`, `--color-warning`, `--color-destructive`): semantic status only. Avoid raw `emerald-*`, `amber-*`, or `red-*` classes in new handoff-quality components.

### Neutral

- **Text Secondary** (`--color-text-secondary`): body copy and explanatory text.
- **Text Label** (`--color-text-label`): sidebar subtitles, lower-emphasis headings, and section labels.
- **Text Tertiary** (`--color-text-tertiary`): metadata, placeholder-adjacent text, and quiet icons.
- **Text Muted** (`--color-text-muted`): disabled, resize affordance, or lowest-emphasis UI only.

### Named Rules

**The Shell Rule.** The full browser canvas may be gray, but the landing portfolio shell should read as a white work surface with subtle borders and rounded corners.

**The Accent Pause Rule.** The current accent token is provisional. Agents should preserve existing uses but avoid inventing new accent-led UI until the accent is corrected in `app/globals.css`.

**The Theme Rule.** Build light and dark from the same semantic classes. Avoid per-component raw `dark:` overrides unless maintaining an upstream shadcn primitive requires it.

## 3. Typography

**Display Font:** Aeonik Pro with `system-ui, sans-serif` fallback  
**Body Font:** Aeonik Pro with `system-ui, sans-serif` fallback  
**Mono Font:** `var(--font-geist-mono)` where available

**Character:** Precise, compact, and product-native. Typography should feel like a high-trust interface, not a marketing poster.

### Hierarchy

- **Display** (`.typo-display`, 300, 48px, 1.1): reserved for true hero or editorial moments. Avoid in dense rails and compact panels.
- **Headline** (`.typo-h1`, 600, 36px, 1.2): page-level titles when a route needs a title hierarchy.
- **Title** (`.typo-h2`, 500, 24px, 1.3): section headings and larger content group labels.
- **Card Title** (`.typo-h3`, 500, 20px, 1.4): project cards, content cards, and medium-density modules.
- **Body** (`.typo-body`, 400, 16px, 1.6): paragraphs and readable explanations. Cap long-form lines around 65 to 75 characters.
- **Body Small** (`.typo-body-sm`, 400, 14px, 1.5): sidebar details, helper text, compact descriptions.
- **Caption** (`.typo-caption`, 400, 12px, 1.4): metadata and low-emphasis notes.
- **Label** (`.typo-label`, 500, 11px, uppercase, 0.08em tracking): sparse structural labels only.

### Named Rules

**The Compact Confidence Rule.** On the landing view, use smaller interface-scale type and weight contrast instead of oversized hero type.

**The One Lead Rule.** Do not let multiple large headings compete in the same viewport. The landing rail currently uses one strong statement and then quiet project structure.

## 4. Elevation

The system is mostly tonal and bordered, with shadow used sparingly to separate floating or framed surfaces. The primary light-mode landing effect is a white shell on a soft gray page, not heavy card depth.

### Shadow Vocabulary

- **Card Shadow** (`--shadow-card`): subtle structural lift for the landing shell and identity panel. Use when a surface floats above page chrome or needs clear separation.
- **Dark Shadows** (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`): legacy or dark-mode-capable shadow tokens. Do not apply these to light landing surfaces without checking the visual result.
- **Glass Shadow** (`--shadow-glass`): reserved for floating UI only. Do not use glass styling on regular content cards.

### Named Rules

**The Tonal First Rule.** Prefer background role, border, and spacing before adding shadow.

**The No Stacked Effects Rule.** Do not combine glass, glow, heavy shadow, and saturated accent on the same element.

## 5. Components

### Landing Shell

- **Shape:** large rounded shell, currently `rounded-3xl`, with clipped overflow.
- **Background:** `bg-bg-base` inside the shell, with `bg-bg-surface` on the body behind it.
- **Border / Ring:** subtle one-pixel framing. Use border/ring values from global tokens.
- **Behavior:** the shell is an app workspace, not a decorative card grid. It frames navigation, project list, and project media.

### Project Rows

- **Shape:** compact rounded rows, usually `rounded-xl`.
- **Default:** transparent on white shell.
- **Active / Hover:** use `bg-bg-elevated` or a low-opacity elevated token, not a colored accent.
- **Typography:** project title uses primary text and medium/semibold weight; subtitle and year use label/secondary text.
- **Icon:** project-specific icon backgrounds can come from project metadata, but they should not redefine the system accent.

### Identity Panel

- **Closed State:** avatar, name, and chevron in a compact pill-like trigger.
- **Open State:** expands into a white panel with subtle border, shadow, form field, and quick links.
- **Motion:** expansion uses width, height, opacity, blur, and translate. The blur is intentional here as a state transition, not as decorative glass.
- **Focus:** use semantic focus rings and keep keyboard escape behavior.

### Buttons

- **shadcn Base:** use `Button` for standard actions and keep shadcn composition patterns.
- **Theme Direction:** variants should move toward semantic token classes. New work should prefer `bg-primary text-primary-foreground`, `border-border`, `bg-secondary text-secondary-foreground`, and `text-muted-foreground`.
- **Do Not:** add new raw `bg-white`, `text-black`, `text-white`, or dark-only glass variants unless the component is explicitly scoped to a dark surface.
- **Icons:** use the project's lucide icon library and let component styles control icon sizing unless the local component already has a documented exception.

### Cards / Containers

- **Default:** white or semantic base on the landing page; subtle borders; moderate radius.
- **Nested Cards:** avoid. Use layout, dividers, or tonal rows instead.
- **Interactive Cards:** use hover through border, background, opacity, or overlay, not large jumps or colored borders.
- **Media Cards:** project hero cards use image surfaces with rounded corners and overlay metadata. The overlay may use black translucency over media only.

### Badges

- **Accent Badge:** allowed only where a semantic accent role already exists. The accent color is provisional.
- **Status Badges:** should map to semantic status tokens rather than raw Tailwind color classes in new work.
- **Shape:** rounded-full, compact, low emphasis.

### Rails And Panels

- **Resizable Rail:** preserve keyboard resizing, visible affordance on hover/focus, and semantic borders.
- **Detail Panel:** should feel like part of the workspace, not a modal. Use inline progressive disclosure before overlays.
- **Mobile:** under development. Do not use current mobile layout as final design authority yet.

### Navigation

- **Desktop:** identity on left, social links on right, quiet top chrome.
- **Sidebar / Rail:** project list and section structure should be scannable, with active state carried by neutral background and type emphasis.
- **Mobile:** considered provisional. Keep touch targets accessible, but final mobile patterns need a future design pass.

### Motion

- **Core Easing:** use the motion tokens from `app/globals.css`. Favor ease-out curves for entering, revealing, and state resolution.
- **Durations:** quick UI feedback around 100 to 200ms, panel transitions around 300ms, entrance/reveal around 400ms.
- **Blur:** allowed for identity panel and tooltip-like state transitions where it clarifies reveal or dismissal. Avoid blurred content cards or default glassmorphism.
- **Motion Library:** `motion/react` is acceptable for state transitions like panel expansion, crossfades, and detail entry.
- **Reduced Motion:** new motion must degrade through `prefers-reduced-motion` and must not hide essential information.

## 6. Do's and Don'ts

### Do:

- **Do** treat `app/globals.css` as the exact token source and `DESIGN.md` as the semantic usage guide.
- **Do** preserve the current background relationship: gray app surface behind a white landing shell.
- **Do** use shadcn-compatible semantic variables and Tailwind neutral scales when correcting component themes.
- **Do** keep components light/dark capable by using semantic classes rather than raw color utilities.
- **Do** mark mobile decisions as provisional until the mobile system is intentionally designed.
- **Do** use blur sparingly for state transitions, especially identity panel and tooltip reveals.
- **Do** keep project rows and rails compact, scannable, and neutral.

### Don't:

- **Don't** treat older docs, playground pages, or non-landing routes as source of truth over the current landing code.
- **Don't** treat the current `--color-accent` value as final brand direction.
- **Don't** create new accent-heavy UI until the accent token is corrected in `app/globals.css`.
- **Don't** hard-code raw whites, blacks, or status colors in new shadcn variants when semantic tokens exist.
- **Don't** use glassmorphism for content cards. Reserve glass-like treatments for floating UI only.
- **Don't** stack glow, blur, heavy shadow, and accent on one element.
- **Don't** infer final mobile design rules from the current mobile implementation.
