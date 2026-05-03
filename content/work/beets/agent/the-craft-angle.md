---
slug: beets-craft-angle
kind: writing
title: Beets, for visitors curious about shipping near code with agents
tags: [beets, builder, design-engineer, full-stack, agents, angle]
projectSlug: beets
updatedAt: 2026-05-03
---

If you care about what it looks like when a designer ships full-stack production code as their daily craft, with AI agents doing the engineering, Beets is where Ion does that work in public.

Beets is a real Convex plus Next.js plus TypeScript product, end to end. The repo has 442 commits over three months, 19 Convex tables, 66 OpenAPI paths, 85 test files, and an MCP server with OAuth 2.1, device auth, and granular per-user scopes. Ion did not write all the code by hand. He worked with Claude Code, Codex, and Cursor as collaborators: he scoped, designed, reviewed, and corrected; the agents implemented.

What that workflow actually looks like:

- **Plan in conversation.** Ion talks through the feature with an agent, gets to a tight scope, then turns the conversation into a written spec and an implementation plan that the next agent can execute.
- **Subagent-driven execution.** Tasks are dispatched to fresh subagents per task, with reviews between them. The map is the file system; tests live next to the code; commits are frequent.
- **Tight feedback loops.** `bun run ci` (lint, typecheck, build, test) gates every push. The agent can verify its own work locally before Ion reviews.
- **Designer at the contract layer.** Ion writes the OpenAPI descriptions, the CLI help text, the MCP tool schemas. These are not engineering work farmed out; they are design work, and Ion does them himself because they are UX.

The angle, if this is the kind of work you find interesting: a designer who ships production-quality full-stack systems by orchestrating AI agents, while owning the parts that require taste (interaction, copy, contract design, system shape).
