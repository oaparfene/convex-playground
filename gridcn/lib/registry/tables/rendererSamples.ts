import { z } from "zod";
import { buildTableMeta } from "../adapters/zod";
import { hexColorZ } from "../sharedSchemas";

export const rendererSamplesZ = z.object({
  text: z.string().describe("Sample text"),
  textarea: z.string().describe("Sample textarea"),
  number: z.number().describe("Sample number"),
  boolean: z.boolean().describe("Sample boolean"),
  date: z.coerce.date().describe("Sample date"),
  datetime: z.coerce.date().describe("Sample datetime"),
  select: z.enum(["optA", "optB", "optC"]).describe("Sample select"),
  id_select: z.string().uuid().optional().describe("Sample id select"),
  id_multi_select: z.array(z.string().uuid()).describe("Sample id multi select"),
  json: z.any().describe("Sample JSON"),
  color: hexColorZ.describe("Sample color"),
  obj: z.object({ nested: z.string() }).describe("Sample object"),
  arr: z.array(z.union([z.string(), z.number()])).describe("Sample array"),
});

export const rendererSamplesTableMeta = buildTableMeta("rendererSamples", rendererSamplesZ, {
  tableLabel: "Renderer Samples",
  fieldOverrides: {
    date: { render: { component: "date" } },
    datetime: { render: { component: "datetime" } },
    select: { render: { component: "select", options: { values: ["optA", "optB", "optC"] } } },
    id_select: { render: { component: "id-select" } },
    id_multi_select: { render: { component: "id-multi-select" } },
    json: { render: { component: "json" } },
    color: { render: { component: "color" } },
    obj: { render: { component: "object" } },
    arr: { render: { component: "array" } },
  },
});


