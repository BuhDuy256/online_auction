import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3, "Username must be at least 3 characters long"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters long")
      .max(30, "Password cannot exceed 30 characters"),
    fullName: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});
