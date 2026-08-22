# Issue tracker: Paperclip (local)

Issues, PRDs, and wayfinder maps for ion-portfolio live in the self-hosted
**Paperclip** instance on the Mesca Family Mac, company **Portfolio** (`POR-`
identifiers). From this Mac, use `http://mesca-family.local:42863`.

- Company id: `cdbb0c38-6166-40e2-a67a-b7978aa32f4e`
- Projects:
  - **Site** `9a9f8371-2985-4564-aaa1-50e1a1d8c770` — landing page, routes,
    design system, visual polish
  - **Content** `62430e8d-f4e5-4f85-a881-5411c6689386` — case studies, writing,
    the MDX corpus under `content/`
  - **Agent & Backend** `edc946f1-2821-41e2-bc23-bc69041012bb` — the `/agent`
    chat, AI SDK wiring, Convex
- Data lives in `~/.paperclip/instances/default/`; Paperclip makes its own
  backups under `data/backups/`.
- The same instance also hosts the **Buna** and **Jennifer** companies. Never
  file portfolio work under those — always company `Portfolio`.

`jq` is available. Paperclip is managed on the Mesca Family Mac. If it is down,
restart it there before retrying `curl http://mesca-family.local:42863/api/health`.

## Conventions

Base URL `http://mesca-family.local:42863/api`. The instance runs in trusted
local mode. No auth header is needed from this machine.

- **Create an issue**:
  `curl -s -X POST $API/companies/<companyId>/issues -H 'Content-Type: application/json' -d '{"title":"...","description":"markdown...","projectId":"..."}'`
- **Read an issue** (relations expanded): `curl -s $API/issues/<id>` — `<id>` is
  the uuid; comments via `curl -s $API/issues/<id>/comments`.
- **List issues**: `curl -s $API/companies/<companyId>/issues` and filter with
  `jq` (`.parentId`, `.status`, `.assigneeAgentId`, `.assigneeUserId`,
  `.labelIds`). Statuses: `backlog`, `todo`, `in_progress`, `done`, `cancelled`.
- **Comment**: `curl -s -X POST $API/issues/<id>/comments -d '{"body":"..."}'`
- **Close**: `curl -s -X PATCH $API/issues/<id> -d '{"status":"done"}'`
- **Labels**: list `GET $API/companies/<companyId>/labels`; create needs
  `{"name":"...","color":"#hex"}`; apply by passing `labelIds` on create/patch.

## When a skill says "publish to the issue tracker"

Create an issue in the Portfolio company, in the project matching the work
area (Site / Content / Agent & Backend).

## When a skill says "fetch the relevant ticket"

`curl -s $API/issues/<id>` plus `/comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as
tickets.

- **Map**: an issue labelled `wayfinder:map`, holding the Destination / Notes /
  Decisions-so-far / Fog body. No parent; lives in the project that owns the
  effort.
- **Child ticket**: create with `parentId: <map issue uuid>` and a
  `wayfinder:<type>` label (`research`/`prototype`/`grilling`/`task`).
- **Blocking**: set on the blocked issue —
  `PATCH $API/issues/<id> -d '{"blockedByIssueIds":["<blocker-uuid>", ...]}'`.
  The live gate is `GET $API/issues/<id>/diagnostics/blockers` →
  `.readiness.isDependencyReady` (true when every blocker is done).
- **Frontier query**: list the map's open children
  (`.parentId == <map>` and `.status` not `done`/`cancelled`, no assignee),
  then keep those whose `diagnostics/blockers` readiness is true; first in
  order wins.
- **Claim** (session driving the map): the session's first write —
  `PATCH $API/issues/<id> -d '{"assigneeUserId":"local-board","status":"in_progress"}'`.
  Release on abandon by reverting to `{"assigneeUserId":null,"status":"todo"}`.
  (Paperclip-launched agents claim differently — atomic checkout — and never
  need this recipe.)
- **Resolve**: post the answer as a comment, `PATCH` status to `done`, then
  append a context pointer (gist + issue identifier) to the map issue's
  Decisions-so-far section via `PATCH {"description": ...}`.

## Label ids (Portfolio company)

| Label | id |
|-------|-----|
| `needs-triage` | `01aee4a4-402a-4abd-91dd-3a12353fa3ac` |
| `ready-for-agent` | `5cf80e87-5581-4d81-9f2e-d5f665dd213f` |
| `ready-for-human` | `77a1cbf2-3f0f-435c-98a1-67d51a23843b` |
| `wayfinder:map` | `8b0100a0-389f-4c07-9e97-41737396e9e2` |
| `wayfinder:grilling` | `8053e3a3-4606-443f-83cd-ca74d282fc66` |
| `wayfinder:prototype` | `0dfd5be9-5924-4886-b094-d7dd9a318cf2` |
| `wayfinder:research` | `a2abbfb9-845d-4251-a91b-24f14df9302e` |
| `wayfinder:task` | `9ffa10dd-b666-4167-ad2f-a2a42deb7ed7` |
