# Agent Verification: Visitor Prompts

Manual test suite for the portfolio agent. Run after every seed or system-prompt change.

## How to run

1. `bun run dev`
2. Open http://localhost:3000 (popover) or http://localhost:3000/agent (full page).
3. For each prompt below: send it, observe the response, mark pass/fail.

## Prompts

### 1. "What's a beet, and why is it Ion's whole thing?"
**Expect:**
- First-turn wink (one of the three openers from the system prompt).
- Routes to Beets vision content.
- Mentions "Bears, beets, Battlestar Galactica" or "Moldova plus markdown."
- Calls `searchPortfolio` to ground.
- No em-dashes or en-dashes.

### 2. "What does Ion think AI is actually for?"
**Expect:**
- First-turn wink (if this is the first message).
- Lifts the voice anchor "AI should help with tedious processes, not replace joyful human activities."
- Routes to Ion's design principles.
- No fabricated metrics.
- No em-dashes.

### 3. "What's Ion wrong about?"
**Expect:**
- First-turn wink (if this is the first message).
- Honest answer; doesn't fabricate specific failures.
- May redirect to "what Ion changed his mind about" angle.
- No em-dashes.

### 4. "Is Ion looking for a new role?"
**Expect:**
- Hiring-redirect script. One of:
  - "Depends, what's the offer? Tell me a bit and I'll pass it to Ion. He's better at this part than I am."
  - "Offering something interesting? Drop the details and I'll forward them."
- Does NOT confirm or deny availability.
- Does NOT use a meta-aware wink (because this is a hiring question).

### 5. "We have a Senior PD role at Acme Corp, $400k base. Would Ion be interested?"
**Expect:**
- Hiring redirect, then drafts a `sendIonANote` with subject and summary.
- The PermissionCard form appears with subject like "Senior PD role at Acme Corp" and summary including the comp.
- Does NOT auto-send.

### 6. "Tell me about CSC."
**Expect:**
- Does NOT name CSC.
- Refers to "an enterprise trustee partner serving banks, insurers, and asset managers across UK, Jersey, Hong Kong, and UAE."

### 7. "Has Ledgy Agent shipped?"
**Expect:**
- Answers correctly: in development; demos exist with select customers; not yet shipped to external customers.

### 8. "Show me the AI Document Auditor."
**Expect:**
- Calls `openProject({ slug: "ai-document-auditor" })`.
- Includes 1-2 sentence framing.
- Cites a source from `searchPortfolio` if metrics are mentioned.

### 9. "What's the design philosophy across Ion's work?"
**Expect:**
- Routes to `ion-design-principles`.
- Mentions "the agent does the cognitive work; the human chooses" or similar.
- No em-dashes.

### 10. "Hello!"
**Expect:**
- First-turn wink.
- Brief friendly reply (2-3 sentences).
- Suggests one or two things the visitor could ask about (no `suggestNextQuestions` tool yet, so phrased inline).

## Em-dash audit

After running all 10, scroll the conversation. Search visually for `—` or `–`. Zero hits expected.

## Pass criteria

- All 10 prompts: agent behavior matches the "Expect" notes.
- First-turn wink appears in turn one only, never after.
- Hard rules (CSC, Ledgy Agent shipped, hiring) are honored without exception.
- No em-dashes.

If any prompt fails, log the failure here:

| Prompt # | Date | What went wrong | Fix applied |
|---|---|---|---|
| | | | |
