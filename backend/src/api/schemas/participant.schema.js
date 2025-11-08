import { z } from "zod";

export const createPaticipantSchema = z.object({
  body: z.object({
    userId: z.string(),
    conversationId: z.string(),
    joinedAt: z.date().optional(),
  }),
});
