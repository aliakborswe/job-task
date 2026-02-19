import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string({ error: "User Name is required" })
        .min(3, "User Name must be at least 3 characters")
        .max(50, "User Name must be at most 50 characters"),
      email: z
        .string({ error: "Email is required" })
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
      password: z
        .string({ error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters")
        .regex(/^(?=.*[A-Z])/, {
          message: "Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
          message: "Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
          message: "Password must contain at least 1 number.",
        }),
      confirmPassword: z.string({ error: "Confirm password is required" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});
