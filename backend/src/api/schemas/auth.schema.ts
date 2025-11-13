import { z } from "zod";

export const signupSchema = z.object({
  full_name: z
    .string("Full name is required")
    .min(1, "Full name cannot be empty")
    .max(100, "Full name must be at most 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name can only contain letters, spaces, apostrophes, and hyphens"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be at most 50 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
      "Password must contain at least one letter and one number"
    ),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string("Password is required"),
});
