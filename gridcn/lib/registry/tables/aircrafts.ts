import { z } from "zod";
import { buildTableMeta } from "../adapters/zod";
import { convexIdZ } from "../sharedSchemas";

export const aircraftsZ = z.object({
  name: z.string().describe("Aircraft name"),
  op_altitude: z.number().positive().default(10000).describe("Operational altitude in meters"),
  cruising_speed: z.number().positive().default(1000).describe("Cruising speed in km/h"),
  endurance: z.number().positive().default(10).describe("Endurance in hours"),
  sensors: z.array(convexIdZ).describe("Relation to sensors ids"),
});

export const aircraftsTableMeta = buildTableMeta("aircrafts", aircraftsZ, {
  tableLabel: "Aircrafts",
  fieldOverrides: {
    sensors: {
      relation: { kind: "relation", table: "sensors", cardinality: "many", displayField: "name", colorField: "color" },
      render: { component: "id-multi-select" },
      filterOperators: ["in", "notIn", "isNull", "isNotNull"],
    },
  },
});

