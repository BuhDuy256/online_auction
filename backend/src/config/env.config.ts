import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().min(1, "NODE_ENV is required"),
  PORT: z.string().default("3000").transform(Number),

  // Database
  SUPABASE_HOST: z.string().min(1, "SUPABASE_HOST is required"),
  SUPABASE_PORT: z.string().default("5432").transform(Number),
  SUPABASE_USER: z.string().min(1, "SUPABASE_USER is required"),
  SUPABASE_PASSWORD: z.string().min(1, "SUPABASE_PASSWORD is required"),
  SUPABASE_DB: z.string().min(1, "SUPABASE_DB is required"),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  // Email
  EMAIL_HOST: z.string().min(1, "EMAIL_HOST is required"),
  EMAIL_PORT: z.string().default("587").transform(Number),
  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  EMAIL_PASSWORD: z.string().min(1, "EMAIL_PASSWORD is required"),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),

  // OTP
  OTP_EXPIRY_MINUTES: z.string().default("10").transform(Number),

  // RECAPTCHA
  RECAPTCHA_SECRET_KEY: z.string().min(1, "RECAPTCHA_SECRET_KEY is required"),
  RECAPTCHA_SITE_KEY: z.string().min(1, "RECAPTCHA_SITE_KEY is required"),

  // GOOGLE
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.issues.map((issue) => `${issue.path.join(".")} - ${issue.message}`).join("\n")
  );
  process.exit(1);
}

export const envConfig = parsedEnv.data;
