# AGENTS

## Design System

Read `DESIGN.md` before visual, motion, responsive, or shadcn component work.

Source-of-truth hierarchy:
1) `app/globals.css` owns exact token values.
2) `DESIGN.md` owns semantics, usage rules, and handoff guidance.
3) `app/page.tsx` and `components/portfolio/*` are the current landing-page visual source of truth.

Notes:
- The gray page background behind the white landing shell is intentional.
- The current accent token is provisional. Preserve existing uses, but do not expand it into new accent-heavy UI.
- Mobile design is under development. Keep it functional and accessible, but do not treat the current mobile UI as final guidance.
- Older docs, playground routes, and non-landing routes are reference only unless `DESIGN.md` says otherwise.
- shadcn work should use semantic CSS variables and Tailwind token roles rather than raw hard-coded colors.

## Browser Automation
Use `agent-browser` for web automation (scraping, navigation, form fills, screenshots).

Core workflow:
1) `agent-browser open <url>`
2) `agent-browser snapshot -i --json`
3) Interact with elements, e.g. `agent-browser click @e1` or `agent-browser fill @e2 "text"`
4) Re-run `agent-browser snapshot -i --json` after each page change

Notes:
- Prefer element IDs from the latest snapshot.
- Capture screenshots only when needed to verify visual state.
