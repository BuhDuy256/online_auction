import { z } from "zod";

export const verifyOTPSchema = z.object({
  user_id: z.number().int().positive(),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resendOTPSchema = z.object({
  user_id: z.number().int().positive(),
});
