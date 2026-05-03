---
slug: beets-dev-principles
kind: writing
title: Beets, the development principles Ion writes into the codebase
tags: [beets, principles, design-philosophy, agents, architecture]
projectSlug: beets
updatedAt: 2026-05-03
---

Ion treats the Beets dev principles as enforceable rules, not aspirational notes. They live in `docs/development-principles.md` in the repo and every PR is checked against them. The top six that drive the most architecture:

1. **Agent-first, human-readable.** The database, API, and data model exist primarily for AI agents to read and write. The UI is a window into what the agent built.
2. **Two-writer disjoint ownership.** AI writes content and structure; humans write checked state and ratings. Mutations enforce the boundary, so a sync never overwrites a human's check. This is the architectural leverage that eliminates conflicts without CRDTs or event sourcing.
3. **Idempotency by default.** Every write is safe to retry. Stable keys, soft deletes, batch operations match against existing data.
4. **Decision freeze.** The agent never overwrites a slot a human has accepted, cooked, or skipped. Frozen returns a structured response with the previous status.
5. **Screaming errors over silent defaults.** When a system cannot fully execute an intent, it must fail loudly. `success: true` with the bad news buried is a bug.
6. **Compound commands beat multi-step workflows.** When an agent needs read-then-write, it becomes one atomic server mutation. Fewer round trips, no races, lower token cost.

There are 16 principles total, but those six are the ones that matter most when designing for agents. They are the answer to the question "what changes when you design a product where an LLM is a primary user?"
