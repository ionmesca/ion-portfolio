# AGENTS

## Agent skills

### Issue tracker

Issues, PRDs, and wayfinder maps live in the local Paperclip instance (company
"Portfolio", `http://localhost:42862`). See `docs/agents/issue-tracker.md`.

## Rebuild (rebuild/v2)

This branch is a greenfield rebuild. The old landing UI, the Convex database,
and the AI SDK chat agent were removed; they survive only in git history.
`components/portfolio/` no longer exists.

Source of truth, in order:

1. `app/globals.css` — the ratified token contract. Do not change a value
   without a ruling from Ion.
2. `docs/design/token-contract.md` — what each token means and why.
3. `docs/design/*.html` — the interaction labs (motion, popover, mobile,
   collection, wheel). Behaviour is verified against these.
4. `docs/design/reference/*.png` — Figma exports. Every screen is verified
   against these.

`DESIGN.md` and the older files in `docs/` describe the pre-rebuild system.
They are superseded historical reference and will be replaced.

Notes:
- No animation library. Motion is vanilla CSS transitions plus
  `requestAnimationFrame` where a transition cannot express it.
- shadcn work should use semantic CSS variables and Tailwind token roles rather
  than raw hard-coded colors.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
