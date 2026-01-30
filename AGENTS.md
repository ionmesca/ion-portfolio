# AGENTS

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
