import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getAgentCookieValues } from "@/lib/agent/cookies";
import { getAgentConvexClient } from "@/lib/agent/convex";

export const runtime = "nodejs";

export async function GET() {
  const { threadId } = await getAgentCookieValues();
  if (!threadId) {
    return NextResponse.json({ threadId: null, messages: [] });
  }

  const convex = getAgentConvexClient();
  const messages = await convex.query(api.agent.getMessages, { threadId });

  return NextResponse.json({ threadId, messages });
}
