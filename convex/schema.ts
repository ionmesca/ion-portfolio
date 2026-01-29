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
});
