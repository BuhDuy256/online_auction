import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    userIds: z
      .array(z.number().positive("User ID must be positive"))
      .min(1, "At least one user ID is required"),

    // Tên của nhóm chat, không bắt buộc (nếu là chat 1-1)
    name: z.string().max(100, "Group name is too long").optional(),
  }),
});
