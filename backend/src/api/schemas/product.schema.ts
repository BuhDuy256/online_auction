import { z } from "zod";
import { allowedSortFields } from "../../utils/constant.util";

export const sortOptionSchema = z.string().transform((val) => {
    return val.
        split(",").
        map((pair) => {
            const [field, direction] = pair.split(":");

            if (!allowedSortFields.includes(field as typeof allowedSortFields[number])) {
                throw new Error(`Invalid sort field: ${field}`);
            }

            const dir = direction.toLowerCase();
            if (dir !== "asc" && dir !== "desc") {
                throw new Error(`Invalid sort direction: ${direction}`);
            }

            return { field, direction: dir as "asc" | "desc" };
        });
}).optional();

export const searchProductSchema = z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    sort: sortOptionSchema,
    exclude: z.coerce.number().int().positive().optional(),
}).refine((data) => data.q || data.category, {
    message: "At least one of 'q' or 'category' must be provided",
    path: ["q", "category"],
}).refine((data) => !(data.q && data.category), {
    message: "Cannot search by both 'q' and 'category' at the same time",
    path: ["q", "category"],
});

export const createProductSchema = z.object({
    name: z.string().min(1).max(500),
    // parent_category_id: z.number().int().positive(),
    category_id: z.number().int().positive(),
    seller_id: z.number().int().positive(),
    thumbnail: z.string().min(1),
    images: z.array(z.string()).min(2),
    start_price: z.number().positive(),
    step_price: z.number().positive(),
    buy_now_price: z.number().positive().optional(),
    description: z.string().min(1),
    end_time: z.coerce.date(),
    auto_extend: z.enum(["yes", "no"])
});

export const getProductCommentsSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const appendProductDescriptionSchema = z.object({
    seller_id: z.number().int().positive(),
    content: z.string().min(1),
});

export type ProductSearchQuery = z.infer<typeof searchProductSchema>;
export type SortOption = z.infer<typeof sortOptionSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type GetProductCommentsQuery = z.infer<typeof getProductCommentsSchema>;
export type AppendProductDescription = z.infer<typeof appendProductDescriptionSchema>;