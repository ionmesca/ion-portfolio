import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { getAgentCookieValues } from "@/lib/agent/cookies";
import { getAgentConvexClient } from "@/lib/agent/convex";

export const runtime = "nodejs";

const noteSchema = z.object({
  subject: z.string().min(3),
  summary: z.string().min(10),
  replyTo: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const { threadId } = await getAgentCookieValues();
  if (!threadId) {
    return NextResponse.json(
      { sent: false, reason: "No active thread." },
      { status: 400 }
    );
  }

  const parsed = noteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { sent: false, reason: "Invalid note payload." },
      { status: 400 }
    );
  }

  const convex = getAgentConvexClient();
  const result = await convex.action(api.agent.sendIonNote, {
    threadId,
    subject: parsed.data.subject,
    summary: parsed.data.summary,
    replyTo: parsed.data.replyTo || undefined,
  });

  return NextResponse.json(result);
}
