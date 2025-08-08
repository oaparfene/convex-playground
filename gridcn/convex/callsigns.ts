import { query } from "./_generated/server";
import { zodOutputToConvex } from "convex-helpers/server/zod";
import { z } from "zod";

export const callsignsZodSchema = z.object({
  name: z.string(),
  country: z.string(),
});

export const callsignsConvexFields = zodOutputToConvex(callsignsZodSchema);

export const getCallsigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("callsigns").collect();
  },
});