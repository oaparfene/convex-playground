import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { callsignsConvexFields } from "./callsigns";

export default defineSchema({
  callsigns: defineTable(callsignsConvexFields),
  sensors: defineTable({
    name: v.string(),
    type: v.string(),
    color: v.string(),
    min_range: v.number(),
    max_range: v.number(),
    resolution: v.number(),
    circular_error_probable: v.number(),
    min_detectable_velocity: v.string(),
  }),
  aircrafts: defineTable({
    name: v.string(),
    op_altitude: v.number(),
    cruising_speed: v.number(),
    endurance: v.number(),
    sensors: v.array(v.id("sensors")),
  }),
  scheduledFlights: defineTable({
    callsign: v.id("callsigns"),
    aircraft: v.id("aircrafts"),
    start_time: v.string(),
    end_time: v.string(),
  }),
  rendererSamples: defineTable({
    text: v.string(),
    textarea: v.string(),
    number: v.number(),
    boolean: v.boolean(),
    date: v.string(),
    datetime: v.string(),
    select: v.string(),
    id_select: v.string(),
    id_multi_select: v.array(v.string()),
    json: v.any(),
    color: v.string(),
    obj: v.any(),
    arr: v.any(),
  }),
});