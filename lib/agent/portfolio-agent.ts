import { ConvexHttpClient } from "convex/browser";
import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import {
  DEFAULT_AGENT_MODEL,
  PORTFOLIO_AGENT_PROMPT,
} from "@/lib/agent/system-prompt";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required for the portfolio agent.");
  }

  return new ConvexHttpClient(url);
}

export const portfolioAgent = new ToolLoopAgent({
  model: process.env.AGENT_MODEL ?? DEFAULT_AGENT_MODEL,
  instructions: PORTFOLIO_AGENT_PROMPT,
  stopWhen: stepCountIs(5),
  tools: {
    searchPortfolio: tool({
      description:
        "Search Ion's portfolio corpus for grounded evidence, metrics, peer quotes, and project details.",
      inputSchema: z.object({
        query: z.string().min(2),
      }),
      outputSchema: z.array(
        z.object({
          slug: z.string(),
          kind: z.string(),
          title: z.string(),
          body: z.string(),
          tags: z.array(z.string()),
          sourceUrl: z.string().optional(),
          projectSlug: z.string().optional(),
          updatedAt: z.number(),
        })
      ),
      execute: async ({ query }) => {
        const convex = getConvexClient();
        return await convex.query(api.agent.searchCorpus, {
          query,
          limit: 5,
        });
      },
    }),

    openProject: tool({
      description:
        "Render a click-to-confirm chip that opens a portfolio project panel for the visitor.",
      inputSchema: z.object({
        slug: z.string(),
        anchor: z.string().optional(),
        reason: z.string().optional(),
      }),
      outputSchema: z.object({
        slug: z.string(),
        anchor: z.string().optional(),
        label: z.string(),
        reason: z.string().optional(),
      }),
      execute: async ({ slug, anchor, reason }) => ({
        slug,
        anchor,
        label: `Open ${slug.replaceAll("-", " ")}`,
        reason,
      }),
    }),

    sendIonANote: tool({
      description:
        "Draft a note to Ion. The UI must ask for explicit visitor approval before sending.",
      inputSchema: z.object({
        subject: z.string().min(3),
        summary: z.string().min(10),
        replyTo: z.string().email().optional(),
      }),
      outputSchema: z.object({
        state: z.literal("needs_approval"),
        subject: z.string(),
        summary: z.string(),
        replyTo: z.string().optional(),
      }),
      execute: async ({ subject, summary, replyTo }) => ({
        state: "needs_approval" as const,
        subject,
        summary,
        replyTo,
      }),
    }),
  },
});

export type PortfolioAgent = typeof portfolioAgent;
