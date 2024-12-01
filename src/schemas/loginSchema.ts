import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .nonempty("Username or Email is required")
    .refine(
      (value) =>
        /^[a-zA-Z0-9]+$/.test(value) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      {
        message: "Must be a valid username or email address",
      }
    ),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});
