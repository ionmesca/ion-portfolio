import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stack: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    url: v.optional(v.string()),
    platforms: v.array(v.string()),
    category: v.string(),
    featured: v.optional(v.boolean()),
    order: v.optional(v.number()),
  }).index("by_category", ["category"]),

  agentThreads: defineTable({
    threadId: v.string(),
    visitorId: v.string(),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    messageCount: v.number(),
    userMessageCount: v.number(),
    lastUserMessage: v.optional(v.string()),
    notifyEmailSent: v.optional(v.boolean()),
  })
    .index("by_threadId", ["threadId"])
    .index("by_visitorId", ["visitorId"]),

  agentMessages: defineTable({
    threadId: v.string(),
    messageId: v.string(),
    role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
    parts: v.any(),
    createdAt: v.number(),
  }).index("by_threadId", ["threadId", "createdAt"]),

  agentCorpus: defineTable({
    slug: v.string(),
    kind: v.union(
      v.literal("writing"),
      v.literal("tweet"),
      v.literal("tool"),
      v.literal("note"),
      v.literal("metric")
    ),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_projectSlug", ["projectSlug"])
    .searchIndex("body_search", {
      searchField: "body",
      filterFields: ["kind"],
    }),

  agentRateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
