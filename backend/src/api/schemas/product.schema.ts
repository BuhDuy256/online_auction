import { z } from "zod";
import { allowedSortFields } from "../../utils/constant.util";
import { stringOrArray } from "../../utils/schema.util";

export const sortOptionSchema = z
  .string()
  .transform((val) => {
    return val.split(",").map((pair) => {
      const [field, direction] = pair.split(":");

      if (
        !allowedSortFields.includes(field as (typeof allowedSortFields)[number])
      ) {
        throw new Error(`Invalid sort field: ${field}`);
      }

      const dir = direction.toLowerCase();
      if (dir !== "asc" && dir !== "desc") {
        throw new Error(`Invalid sort direction: ${direction}`);
      }

      return { field, direction: dir as "asc" | "desc" };
    });
  })
  .optional();

export const searchProductsSchema = z
  .object({
    q: z.string().optional(),
    categorySlug: stringOrArray,
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    sort: sortOptionSchema,
    excludeCategorySlug: stringOrArray,
  });

export const createProductSchema = z.object({
  name: z.string().min(1).max(500),
  categoryId: z.number().int().positive(),
  sellerId: z.number().int().positive(),
  thumbnail: z.string().min(1),
  images: z.array(z.string()).min(2),
  startPrice: z.number().positive(),
  stepPrice: z.number().positive(),
  buyNowPrice: z.number().positive().optional(),
  description: z.string().min(1),
  endTime: z.coerce.date(),
  autoExtend: z.enum(["yes", "no"]),
});

export const getProductCommentsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const appendProductDescriptionSchema = z.object({
  sellerId: z.number().int().positive(),
  content: z.string().min(1),
});

export type ProductsSearchQuery = z.infer<typeof searchProductsSchema>;
export type SortOption = z.infer<typeof sortOptionSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type GetProductCommentsQuery = z.infer<typeof getProductCommentsSchema>;
export type AppendProductDescription = z.infer<
  typeof appendProductDescriptionSchema
>;
