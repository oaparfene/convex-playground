import { buildRegistryMeta } from "./adapters/zod";
import { callsignsTableMeta } from "./tables/callsigns";
import { sensorsTableMeta } from "./tables/sensors";
import { aircraftsTableMeta } from "./tables/aircrafts";
import { scheduledFlightsTableMeta } from "./tables/scheduledFlights";
import { rendererSamplesTableMeta } from "./tables/rendererSamples";

export const Registry = {
  describe() {
    return buildRegistryMeta([
      callsignsTableMeta,
      sensorsTableMeta,
      aircraftsTableMeta,
      scheduledFlightsTableMeta,
      rendererSamplesTableMeta,
    ]);
  },
};

export type RegistryDescribe = ReturnType<typeof Registry.describe>;

