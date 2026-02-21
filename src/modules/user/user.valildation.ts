import { z } from "zod";

export const changeUserNameSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "User Name is required" })
      .min(2, "User Name must be at least 2 characters")
      .max(50, "User Name must be at most 50 characters")
      .trim(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string({ error: "Current password is required" }),
      newPassword: z
        .string({ error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one digit",
        ),
      confirmNewPassword: z.string({
        error: "Confirm new password is required",
      }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    }),
});

export const setPinSchema = z.object({
  body: z.object({
    pin: z
      .string({ error: "PIN is required" })
      .regex(/^\d{4,6}$/, "PIN must be a 4 to 6 digit number"),
  }),
});

export const verifyPinSchema = z.object({
  body: z.object({
    pin: z
      .string({ error: "PIN is required" })
      .regex(/^\d{4,6}$/, "PIN must be a 4 to 6 digit number"),
  }),
});
