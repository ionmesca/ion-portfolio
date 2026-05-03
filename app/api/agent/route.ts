import type { UIMessage } from "ai";
import { createAgentUIStreamResponse } from "ai";
import { api } from "@/convex/_generated/api";
import { getOrCreateAgentCookies } from "@/lib/agent/cookies";
import { getAgentConvexClient } from "@/lib/agent/convex";
import { createPortfolioAgent } from "@/lib/agent/portfolio-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const { threadId, visitorId } = await getOrCreateAgentCookies();
  const convex = getAgentConvexClient();

  await convex.mutation(api.agent.ensureThread, { threadId, visitorId });

  return await createAgentUIStreamResponse({
    agent: createPortfolioAgent(),
    uiMessages: messages,
    sendReasoning: false,
    sendSources: true,
    onFinish: async ({ messages: finishedMessages }) => {
      await convex.mutation(api.agent.saveMessages, {
        threadId,
        visitorId,
        messages: finishedMessages.map((message) => ({
          id: message.id,
          role: message.role,
          parts: message.parts,
        })),
      });
    },
  });
}
