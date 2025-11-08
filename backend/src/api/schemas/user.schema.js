import { z } from "zod";

export const searchUserSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, "Search query is required") // Ít nhất 1 ký tự
      .max(50, "Search query is too long"), // Giới hạn độ dài
  }),
});
