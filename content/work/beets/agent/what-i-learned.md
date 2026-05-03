---
slug: beets-what-i-learned
kind: writing
title: Beets, generalizable lessons for designing AI-native software
tags: [beets, lessons, ai, agents, design, transferable]
projectSlug: beets
updatedAt: 2026-05-03
---

Things Beets has taught Ion that transfer to any AI-native product:

**Disjoint ownership beats CRDTs.** The hardest part of AI plus human shared state is conflict resolution. The trick: don't share state. Carve fields into AI-owned (content, structure, metadata) and human-owned (checked state, ratings, approval). Mutations enforce the boundary. No conflicts because there's nothing to conflict on.

**Tool descriptions are the documentation.** The model reads OpenAPI descriptions and CLI help at call time. If the behavior is not documented in the tool surface, the agent will discover it through errors and workarounds. Treat every description as copy that has to teach the agent how to behave.

**Screaming errors over silent defaults.** When a write partially succeeds, returning `success: true` with the bad news in a count buried at the bottom is worse than failing. The agent will say "done" to the user while the work is incomplete. Always return `outcome: "partial"` with per-item detail.

**Compound commands matter.** Watching agent logs taught Ion that 3 to 4 client-side tool calls for one user intent is a red flag. Fold them into one server-side atomic operation. Fewer round trips, no race conditions, lower token cost, fewer failure points.

**Deep modules.** Organize features so the public interface is small (one barrel export) and the implementation lives behind it. AI is a new starter every time; the file system is its only map. Make the map match the architecture.

**Voice rules survive model changes.** Beets has principles like "the agent never overwrites a human decision" that work whether the underlying model is Claude, GPT, or something newer. Hardcode the rules into the API; do not rely on prompt engineering alone.

These are not Beets-specific. They are how Ion thinks about agent-operated software in general.
