---
slug: beets-agent-contracts
kind: tool
title: Beets, agent-first architecture and contract design
tags: [beets, mcp, openapi, agents, architecture, oauth]
projectSlug: beets
updatedAt: 2026-05-03
---

In Beets, agents are first-class operators. The product is built around the idea that the API, the OpenAPI document, the CLI, and the MCP server are all design surfaces with the same rigor as the UI.

What that looks like concretely:

- **Capabilities discovery.** Every agent first hits `GET /api/v1/capabilities` and `GET /api/v1/openapi?version=latest` to learn what the system can do. No hardcoded knowledge needed.
- **MCP transport.** Streamable HTTP with OAuth 2.1 + PKCE, dynamic client registration, device auth, and granular scopes (readonly, write, admin). Per-user bearer tokens. The current Beets MCP exposes 34 tools across orientation, planning, cooking, shopping, recipes, pantry, household, and feedback.
- **Tool descriptions are documentation.** Every endpoint's OpenAPI description explains merge or create semantics, default behaviors, and side effects. The model reads these at call time; that is the contract.
- **Idempotent writes.** Stable keys (e.g., `${householdId}::${date}::${mealType}` for calendar slots), soft deletes, every batch operation matches against existing data. An agent can call "plan these meals" twice and get the same result.
- **Structured failure responses.** Partial success returns `success: false` and `outcome: "partial"` with per-item details. Frozen-blocked writes return `outcome: "frozen_blocked"` and HTTP 409. The agent never has to guess what went wrong.
- **Compound commands.** `replace-slot` is one atomic mutation that checks frozen status and writes; not a client-side read-then-write loop. Fewer round trips, no race conditions.

The thesis: the surface where an agent calls into the product is itself a UX surface, and it deserves design attention.
