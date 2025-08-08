/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aircrafts from "../aircrafts.js";
import type * as callsigns from "../callsigns.js";
import type * as registry from "../registry.js";
import type * as scheduledFlights from "../scheduledFlights.js";
import type * as seed from "../seed.js";
import type * as sensors from "../sensors.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aircrafts: typeof aircrafts;
  callsigns: typeof callsigns;
  registry: typeof registry;
  scheduledFlights: typeof scheduledFlights;
  seed: typeof seed;
  sensors: typeof sensors;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
