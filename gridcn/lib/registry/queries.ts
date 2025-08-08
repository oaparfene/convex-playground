import { api } from "@/convex/_generated/api";

// Map table names to their corresponding Convex queries
export const tableQueries = {
    callsigns: api.callsigns.getCallsigns,
    sensors: api.sensors.getSensors,
    aircrafts: api.aircrafts.getAircrafts,
    scheduledFlights: api.scheduledFlights.getScheduledFlights,
  } as const;