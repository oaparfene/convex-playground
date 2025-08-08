import { z } from "zod";
import { buildTableMeta } from "../adapters/zod";

export const callsignsZ = z.object({
  name: z.string().describe("Callsign name"),
  country: z.string().describe("Country code or name"),
});

export const callsignsTableMeta = buildTableMeta("callsigns", callsignsZ, {
  tableLabel: "Callsigns",
});

