import { z } from "zod";
import { buildTableMeta } from "../adapters/zod";

export const sensorsZ = z.object({
  name: z.string().describe("Sensor name"),
  type: z.string().describe("Sensor type"),
  color: z.string().describe("Sensor display color"),
  min_range: z.number().positive().default(0).describe("Minimum range in meters"),
  max_range: z.number().positive().default(100000).describe("Maximum range in meters"),
  resolution: z.number().positive().default(300).describe("Resolution in pixel per inch"),
  circular_error_probable: z.number().positive().default(0).describe("Circular error probable in meters"),
  min_detectable_velocity: z.number().positive().default(0).describe("Minimum detectable velocity in km/h"),
});

export const sensorsTableMeta = buildTableMeta("sensors", sensorsZ, {
  tableLabel: "Sensors",
});

