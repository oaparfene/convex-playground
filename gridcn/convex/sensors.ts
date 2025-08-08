import { query } from "./_generated/server";

export const getSensors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sensors").collect();
  },
});
