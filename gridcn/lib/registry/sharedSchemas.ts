import { z } from "zod";

export const hexColorZ = z
  .string({ required_error: "Color is required", invalid_type_error: "Color must be a string" })
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: "Color must be a valid hex like #abc or #a1b2c3",
  });


