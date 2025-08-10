import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { tableSchemas } from "../lib/registry/schemas";
import { Registry } from "../lib/registry";

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
    const mainData = all.slice(start, end);

    // Get table metadata to find relations
    const registry = Registry.describe();
    const tableMeta = registry.tables[args.table];
    
    if (!tableMeta) {
      return { data: mainData, relations: {} };
    }

    // Find all relation tables that need to be fetched
    const relationTables = new Set<string>();
    Object.values(tableMeta.fields).forEach((field) => {
      if (field.relation?.table) {
        relationTables.add(field.relation.table);
      }
    });

    // Fetch all relation data
    const relations: Record<string, any[]> = {};
    for (const relationTable of relationTables) {
      try {
        const relationData = await ctx.db.query(relationTable as any).collect();
        relations[relationTable] = relationData;
      } catch (error) {
        console.warn(`Failed to fetch relation data for table: ${relationTable}`, error);
        relations[relationTable] = [];
      }
    }

    return {
      data: mainData,
      relations,
    };
  },
});

export const insert = mutation({
  args: {
    table: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const schema = (tableSchemas as any)[args.table];
    if (!schema) throw new Error(`Unknown table: ${args.table}`);
    const parsed = schema.parse(args.value);
    const id = await ctx.db.insert(args.table as any, parsed);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    table: v.string(),
    id: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const schema = (tableSchemas as any)[args.table];
    if (!schema) throw new Error(`Unknown table: ${args.table}`);
    const existing = await ctx.db.get(args.id as any);
    if (!existing) throw new Error("Document not found");
    const validatedPatch = schema.partial().parse(args.patch);
    await ctx.db.patch(args.id as any, validatedPatch);
    return await ctx.db.get(args.id as any);
  },
});

export const remove = mutation({
  args: {
    table: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id as any);
    return true;
  },
});


