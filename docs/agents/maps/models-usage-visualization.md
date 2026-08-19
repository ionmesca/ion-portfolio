# Models usage visualization

Paperclip was not reachable on this machine (`localhost:42862` refused,
`ing.paperclip.server` is not in launchd, `~/.paperclip` is absent). This is
the wayfinder map ready to file in company **Portfolio**, project **Site**
(`9a9f8371-2985-4564-aaa1-50e1a1d8c770`) when the instance is up.

Do not implement the visualization until the map's tickets have answers.

## Map body (`wayfinder:map`)

Title: **Models usage visualization**

```markdown
## Destination

A creative, token-native visualization of which models Ion actually uses, living
on `/stack` (or a linked surface from it). The numbers are honest enough to
stand behind, the picture is quieter than a SaaS billing chart, and it is not a
rewrite of the collection morph onto Three.js unless a ticket rules that in.

## Notes

- Domain: ion-portfolio Site. Tokens in `app/globals.css` are locked.
- CLAUDE.md: the big systems stay vanilla CSS + requestAnimationFrame. Three.js
  would be a new system and needs an explicit ruling.
- `motion` is sanctioned for micro-interactions only.
- Stack list shipped 2026-08-19 without this visualization on purpose.

## Decisions so far

## Not yet specified

- Whether the viz is a section on `/stack` or its own route.
- Whether model characters are generated assets or simple marks.
- How often the numbers refresh (build-time snapshot vs live).

## Out of scope

- Shipping any chart, forest, or Three.js scene before the tickets below resolve.
- Faking a precise spend history and presenting it as measured.
```

## Child tickets

File as children of the map. Suggested blocking: usage-numbers (research)
blocks metaphor (grilling); metaphor blocks threejs-ruling (grilling) if the
chosen metaphor is spatial.

### Where the usage numbers come from (`wayfinder:research`)

```markdown
## Question

What measured sources exist for Ion's model usage (Cursor export, Anthropic
usage, OpenAI, xAI, local Ollama logs), what they actually contain, and how
close an honest estimate can get without inventing a ledger?
```

### Metaphor (`wayfinder:grilling`)

```markdown
## Question

What picture should the usage take: a quiet stacked race, an isometric forest,
model-as-character sprites, or something smaller that still feels like this
site? The Cursor billing chart is the floor, not the look.
```

### Whether Three.js is allowed here (`wayfinder:grilling`)

```markdown
## Question

CLAUDE.md keeps the big systems on CSS + rAF. Is a models visualization a new
big system that stays in that rule, or a sanctioned exception for a contained
WebGL scene? If Three.js is in, what is the first-load JS budget?
```

## File when Paperclip is up

```bash
API=http://localhost:42862/api
COMPANY=cdbb0c38-6166-40e2-a67a-b7978aa32f4e
SITE=9a9f8371-2985-4564-aaa1-50e1a1d8c770
MAP_LABEL=8b0100a0-389f-4c07-9e97-41737396e9e2
RESEARCH=a2abbfb9-845d-4251-a91b-24f14df9302e
GRILLING=8053e3a3-4606-443f-83cd-ca74d282fc66
```

Paste the map body and ticket bodies into POST `/companies/$COMPANY/issues`
with `projectId`, `labelIds`, then `parentId` on the children and
`blockedByIssueIds` on the blocked ones.
