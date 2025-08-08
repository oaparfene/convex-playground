import { z } from "zod";
import { buildTableMeta } from "../adapters/zod";

export const scheduledFlightsZ = z.object({
  callsign: z.string().uuid().describe("Relation to callsigns id"),
  aircraft: z.string().uuid().describe("Relation to aircrafts id"),
  start_time: z.coerce.date().describe("Start time"),
  end_time: z.coerce.date().describe("End time"),
});

export const scheduledFlightsTableMeta = buildTableMeta("scheduledFlights", scheduledFlightsZ, {
  tableLabel: "Scheduled Flights",
  fieldOverrides: {
    callsign: {
      relation: { kind: "relation", table: "callsigns", cardinality: "one", displayField: "name" },
      render: { component: "id-select" },
    },
    aircraft: {
      relation: { kind: "relation", table: "aircrafts", cardinality: "one", displayField: "name" },
      render: { component: "id-select" },
    },
    start_time: {
      render: { component: "datetime" },
    },
    end_time: {
      render: { component: "datetime" },
    },
  },
});

