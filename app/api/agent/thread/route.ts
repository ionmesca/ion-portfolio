import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { startNewAgentThread } from "@/lib/agent/cookies";
import { getAgentConvexClient } from "@/lib/agent/convex";

export const runtime = "nodejs";

export async function POST() {
  const { threadId, visitorId } = await startNewAgentThread();
  const convex = getAgentConvexClient();
  await convex.mutation(api.agent.ensureThread, { threadId, visitorId });

  return NextResponse.json({ threadId });
}
