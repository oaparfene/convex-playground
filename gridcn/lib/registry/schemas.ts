import { z } from "zod";
import { callsignsZ } from "./tables/callsigns";
import { sensorsZ } from "./tables/sensors";
import { aircraftsZ } from "./tables/aircrafts";
import { scheduledFlightsZ } from "./tables/scheduledFlights";

export const tableSchemas = {
  callsigns: callsignsZ,
  sensors: sensorsZ,
  aircrafts: aircraftsZ,
  scheduledFlights: scheduledFlightsZ,
} as const;

export type TableName = keyof typeof tableSchemas;
export type ZodSchemaFor<Table extends TableName> = typeof tableSchemas[Table];

