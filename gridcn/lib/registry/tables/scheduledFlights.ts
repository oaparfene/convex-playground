import { z } from "zod";
import { buildTableMeta } from "../adapters/zod";
import { datetimeStringZ, convexIdZ } from "../sharedSchemas";

export const scheduledFlightsZ = z.object({
  callsign: convexIdZ.describe("Relation to callsigns id"),
  aircraft: convexIdZ.describe("Relation to aircrafts id"),
  start_time: datetimeStringZ.describe("Start time"),
  end_time: datetimeStringZ.describe("End time"),
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

