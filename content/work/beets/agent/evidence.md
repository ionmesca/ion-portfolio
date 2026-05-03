---
slug: beets-evidence
kind: metric
title: Beets, scope and current state
tags: [beets, metrics, scope, status, stack]
projectSlug: beets
updatedAt: 2026-05-03
---

Beets is a real working product, currently in beta with Ion's family and friends and planning to open-source. The repo evidence as of late April 2026:

- **442 commits** between 2026-01-31 and 2026-04-24
- **34 MCP tools** exposed via streamable HTTP
- **66 OpenAPI paths** with 73 operations across the API
- **19 Convex tables** in the data model
- **85 test files** across logic, contracts, and behavior tiers
- **537 source and doc files** total across app, backend, packages, tests, tools, and docs
- **OpenAPI v1.18.0** with versioned snapshots and a CHANGELOG

**Stack:**
- Convex backend (queries, mutations, actions, scheduled jobs, full-text search)
- Next.js 16 with App Router and Turbopack on Vercel
- TypeScript across the entire codebase
- MCP server with OAuth 2.1 + PKCE, dynamic client registration, device auth, granular scopes
- Vercel AI SDK for built-in agent flows
- Bun as the runtime, biome for lint and format

**Status notes:**
- The product works for Ion's household daily.
- Planned for open-source under MIT or BSL/FSL (not yet decided).
- Phase 0 (MVP) shipped; Phase 1 (rebrand to Beets, open launch) in progress.
- Built solo with Claude Code, Codex, and Cursor as daily collaborators. Ion is the designer and product owner; agents do the engineering.

The point of the numbers is not to brag. It is to make the claim "this is a real product" inspectable: anyone can clone the repo and verify.
