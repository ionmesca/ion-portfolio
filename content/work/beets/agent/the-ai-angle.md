---
slug: beets-ai-angle
kind: writing
title: Beets, for visitors curious about agent-operated software
tags: [beets, ai, agent-architecture, mcp, angle]
projectSlug: beets
updatedAt: 2026-05-03
---

If you care about what designing for AI agents actually looks like at the contract layer, Beets is where Ion does that work in public.

The product is built on the premise that agents are first-class operators, not chat bolted onto a CRUD app. So the design surface includes things you do not usually find in a designer's portfolio: OpenAPI descriptions tuned to be readable by an LLM, CLI help text that doubles as agent documentation, MCP tool schemas with structured error semantics. The Beets repo currently exposes 34 MCP tools across orientation, planning, cooking, shopping, recipes, pantry, household, and feedback, all designed so an agent can use them without tribal knowledge.

The hard part is not connecting an agent to an API. It is making the API safe for an agent to operate. Ion's solution is a set of design principles he wrote into the codebase as enforceable rules:

- **Two-writer disjoint ownership.** AI writes content and structure. Humans write checked state and ratings. Mutations enforce the boundary, so a sync never overwrites a human's check.
- **Idempotency by default.** Every write is safe to retry. Stable keys, soft deletes, "plan these meals twice and get the same result."
- **Decision freeze.** The agent never overwrites a slot a human has accepted, cooked, or skipped. Frozen slots return a structured `outcome: "frozen_blocked"` with the previous status.
- **Screaming errors over silent defaults.** Partial failures return `success: false` and `outcome: "partial"` with per-item details. No hiding bad news in a count buried at the bottom of the response.
- **Compound commands.** When a flow needs read-then-write, it becomes one atomic server mutation, not three client-side tool calls. Fewer round trips, fewer race conditions, lower token cost.

The angle, if you find this interesting: a designer who treats the agent's tool surface as a UX surface, with the same rigor as a button label or an empty state. The OpenAPI description is a copywriting job. The error message is a microcopy job. The tool schema is an information architecture job. Beets is the artifact where Ion shows that whole stack as design work.
