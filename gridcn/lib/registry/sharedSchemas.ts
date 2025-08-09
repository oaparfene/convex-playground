import { z } from "zod";

export const hexColorZ = z
  .string({ required_error: "Color is required", invalid_type_error: "Color must be a string" })
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: "Color must be a valid hex like #abc or #a1b2c3",
  });

export const dateStringZ = z
  .string({ required_error: "Date is required", invalid_type_error: "Date must be a string" })
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  });

export const datetimeStringZ = z
  .string({ required_error: "Datetime is required", invalid_type_error: "Datetime must be a string" })
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime format",
  });

export const convexIdZ = z
  .string({ required_error: "ID is required", invalid_type_error: "ID must be a string" })
  .regex(/^[a-z0-9]{32}$/, {
    message: "Invalid Convex ID format",
  });


