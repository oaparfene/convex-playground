import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    table: v.string(),
    limit: v.optional(v.number()),
    // Simple pagination placeholder; future: cursor/indexed pagination
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query(args.table as any);
    // naive offset/limit on client side of collected results; for now simple
    const all = await q.collect();
    const start = Math.max(0, args.offset ?? 0);
    const end = args.limit ? start + args.limit : undefined;
    return all.slice(start, end);
  },
});


