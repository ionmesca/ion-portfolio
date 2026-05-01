import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

const uiRole = v.union(v.literal("system"), v.literal("user"), v.literal("assistant"));

const corpusKind = v.union(
  v.literal("writing"),
  v.literal("tweet"),
  v.literal("tool"),
  v.literal("note"),
  v.literal("metric")
);

function extractText(parts: unknown) {
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .flatMap((part) => {
      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        part.type === "text" &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return [part.text];
      }
      return [];
    })
    .join("\n")
    .trim();
}

export const getThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("agentThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();
  },
});

export const getMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const rows = await ctx.db
      .query("agentMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .collect();

    return rows.map((row) => ({
      id: row.messageId,
      role: row.role,
      parts: row.parts,
    }));
  },
});

export const searchCorpus = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    kind: v.optional(corpusKind),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5, 5);
    let search = ctx.db
      .query("agentCorpus")
      .withSearchIndex("body_search", (q) => q.search("body", args.query));

    const kind = args.kind;
    if (kind) {
      search = ctx.db
        .query("agentCorpus")
        .withSearchIndex("body_search", (q) =>
          q.search("body", args.query).eq("kind", kind)
        );
    }

    const rows = await search.take(limit);

    return rows.map((row) => ({
      slug: row.slug,
      kind: row.kind,
      title: row.title,
      body: row.body,
      tags: row.tags,
      sourceUrl: row.sourceUrl,
      projectSlug: row.projectSlug,
      updatedAt: row.updatedAt,
    }));
  },
});

export const ensureThread = mutation({
  args: {
    threadId: v.string(),
    visitorId: v.string(),
  },
  handler: async (ctx, { threadId, visitorId }) => {
    const existing = await ctx.db
      .query("agentThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("agentThreads", {
      threadId,
      visitorId,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      userMessageCount: 0,
      notifyEmailSent: false,
    });
  },
});

export const saveMessages = mutation({
  args: {
    threadId: v.string(),
    visitorId: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: uiRole,
        parts: v.any(),
      })
    ),
  },
  handler: async (ctx, { threadId, visitorId, messages }) => {
    const now = Date.now();
    let thread = await ctx.db
      .query("agentThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    if (!thread) {
      const threadDocId = await ctx.db.insert("agentThreads", {
        threadId,
        visitorId,
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        userMessageCount: 0,
        notifyEmailSent: false,
      });
      thread = await ctx.db.get(threadDocId);
    }

    const existingMessages = await ctx.db
      .query("agentMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .collect();

    for (const message of existingMessages) {
      await ctx.db.delete(message._id);
    }

    for (const [index, message] of messages.entries()) {
      await ctx.db.insert("agentMessages", {
        threadId,
        messageId: message.id,
        role: message.role,
        parts: message.parts,
        createdAt: now + index,
      });
    }

    const userMessages = messages.filter((message) => message.role === "user");
    const lastUserMessage = userMessages.at(-1);

    if (thread) {
      await ctx.db.patch(thread._id, {
        visitorId,
        updatedAt: now,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        lastUserMessage: lastUserMessage
          ? extractText(lastUserMessage.parts).slice(0, 1000)
          : undefined,
      });
    }
  },
});

export const upsertCorpus = mutation({
  args: {
    chunks: v.array(
      v.object({
        slug: v.string(),
        kind: corpusKind,
        title: v.string(),
        body: v.string(),
        tags: v.array(v.string()),
        sourceUrl: v.optional(v.string()),
        projectSlug: v.optional(v.string()),
        updatedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, { chunks }) => {
    for (const chunk of chunks) {
      const existing = await ctx.db
        .query("agentCorpus")
        .withIndex("by_slug", (q) => q.eq("slug", chunk.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, chunk);
      } else {
        await ctx.db.insert("agentCorpus", chunk);
      }
    }

    return { upserted: chunks.length };
  },
});

export const recordNotificationSent = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const thread = await ctx.db
      .query("agentThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    if (thread) {
      await ctx.db.patch(thread._id, { notifyEmailSent: true });
    }
  },
});

export const sendIonNote = action({
  args: {
    threadId: v.string(),
    subject: v.string(),
    summary: v.string(),
    replyTo: v.optional(v.string()),
  },
  handler: async (_, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.RESEND_TO_EMAIL;

    if (!apiKey || !to) {
      return {
        sent: false,
        reason: "Resend is not configured yet.",
      };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Ion Portfolio <agent@ionmesca.com>",
      to,
      replyTo: args.replyTo,
      subject: args.subject,
      text: [
        args.summary,
        "",
        `Thread: ${args.threadId}`,
        args.replyTo ? `Reply to: ${args.replyTo}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return { sent: true };
  },
});
