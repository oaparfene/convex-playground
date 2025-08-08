import { query } from "./_generated/server";

export const getAircrafts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aircrafts").collect();
  },
});
