import { z } from "zod";

export const placeBidSchema = z.object({
    product_id: z.number().int().positive(),
    bidder_id: z.number().int().positive(),
    max_amount: z.number().positive(),
});

export const getBidHistorySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type PlaceBidDto = z.infer<typeof placeBidSchema>;
export type GetBidHistoryQuery = z.infer<typeof getBidHistorySchema>;