import { query } from "./_generated/server";

export const getScheduledFlights = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scheduledFlights").collect();
  },
});
