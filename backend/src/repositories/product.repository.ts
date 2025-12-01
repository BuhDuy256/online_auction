import db from "../database/db";
import { toSlug } from "../utils/slug.util";
import { getCategoryIds } from "./category.repository";
import { SortOption } from "../api/schemas/product.schema";
import { toNum } from "../utils/number.util";

function escapeQuery(q: string) {
  return q
    .replace(/[-:!&|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const fullTextSearch = async (
  q: string | undefined,
  page: number,
  limit: number,
  sort?: SortOption,
  excludeProductId?: number
) => {
  const safeQ = escapeQuery(q || "");
  const offset = (page - 1) * limit;

  let query = db("products")
    .where("status", "active")
    .where("end_time", ">", new Date());

  if (safeQ) {
    // Using ILIKE for simple full text search simulation
    query = query.where("name", "ilike", `%${safeQ}%`);
  }

  if (excludeProductId) {
    query = query.whereNot("product_id", excludeProductId);
  }

  const countQuery = query.clone().count("product_id as total").first();

  if (sort && Array.isArray(sort) && sort.length > 0) {
    sort.forEach((item) => {
      const dbField =
        item.field === "endTime"
          ? "end_time"
          : item.field === "price"
            ? "current_price"
            : item.field === "bidCount"
              ? "bid_count"
              : "created_at";
      query = query.orderBy(dbField, item.direction);
    });
  } else {
    query = query.orderBy("created_at", "desc");
  }

  const products = await query
    .select(
      "products.product_id",
      "products.thumbnail_url",
      "products.name",
      "products.current_price",
      "products.status",
      "products.created_at",
      "products.end_time",
      "products.bid_count",
      "products.highest_bidder_id"
    )
    .limit(limit)
    .offset(offset);

  // Fetch highest bidder details for each product
  const highestBidders = await db("users")
    .whereIn(
      "id",
      products.map((p) => p.highest_bidder_id).filter((id) => id !== null)
    )
    .select("id", "full_name");

  const bidderMap = new Map(highestBidders.map((b) => [b.id, b]));

  const totalResult = await countQuery;
  const total = totalResult ? parseInt(totalResult.total as string) : 0;

  return {
    data: products.map((p) => ({
      ...p,
      highest_bidder: p.highest_bidder_id
        ? bidderMap.get(p.highest_bidder_id)
        : null,
    })),
    total,
  };
};

export const findByCategory = async (
  categorySlug: string,
  page: number,
  limit: number,
  sort?: SortOption,
  excludeProductId?: number
) => {
  const slug = toSlug(categorySlug);
  const offset = (page - 1) * limit;

  const categoryIds = await getCategoryIds(slug);

  let query = db("products")
    .whereIn("category_id", categoryIds)
    .where("status", "active")
    .where("end_time", ">", new Date());

  if (excludeProductId) {
    query = query.whereNot("product_id", excludeProductId);
  }

  const countQuery = query.clone().count("product_id as total").first();

  if (sort && Array.isArray(sort) && sort.length > 0) {
    sort.forEach((item) => {
      const dbField =
        item.field === "endTime"
          ? "end_time"
          : item.field === "price"
            ? "current_price"
            : item.field === "bidCount"
              ? "bid_count"
              : "created_at";
      query = query.orderBy(dbField, item.direction);
    });
  } else {
    query = query.orderBy("created_at", "desc");
  }

  const products = await query
    .join("categories", "products.category_id", "categories.category_id")
    .select(
      "products.*",
      "categories.category_id as cat_id",
      "categories.name as cat_name",
      "categories.slug as cat_slug"
    )
    .limit(limit)
    .offset(offset);

  // Fetch highest bidder details
  const highestBidders = await db("users")
    .whereIn(
      "id",
      products.map((p) => p.highest_bidder_id).filter((id) => id !== null)
    )
    .select("id", "full_name");

  const bidderMap = new Map(highestBidders.map((b) => [b.id, b]));

  const totalResult = await countQuery;
  const total = totalResult ? parseInt(totalResult.total as string) : 0;

  return {
    data: products.map((p) => ({
      ...p,
      highest_bidder: p.highest_bidder_id
        ? bidderMap.get(p.highest_bidder_id)
        : null,
      category: {
        category_id: p.cat_id,
        name: p.cat_name,
        slug: p.cat_slug,
      },
    })),
    total,
  };
};

export const createProduct = async (data: {
  name: string;
  category_id: number;
  seller_id: number;
  start_price: number;
  step_price: number;
  buy_now_price?: number;
  end_time: Date;
  auto_extend: boolean;
  description: string;
  thumbnail: string;
  images: string[];
}) => {
  return await db.transaction(async (tx) => {
    const [product] = await tx("products")
      .insert({
        name: data.name,
        category_id: data.category_id,
        seller_id: data.seller_id,
        start_price: data.start_price,
        current_price: data.start_price,
        step_price: data.step_price,
        buy_now_price: data.buy_now_price,
        end_time: data.end_time,
        auto_extend: data.auto_extend,
        thumbnail_url: data.thumbnail,
        status: "active",
      })
      .returning("*");

    await tx("product_descriptions").insert({
      product_id: product.product_id,
      author_id: data.seller_id,
      content: data.description,
      lang: "vi",
      version: 1,
    });

    if (data.images.length > 0) {
      await tx("product_images").insert(
        data.images.map((image_url) => ({
          product_id: product.product_id,
          image_url,
        }))
      );
    }

    return product;
  });
};

export const findDetailById = async (
  productId: number
) => {
  const product = await db("products")
    .where({ product_id: productId })
    .first();

  if (!product) {
    return null;
  }

  const [
    images,
    seller,
    description,
    category
  ] = await Promise.all([
    db("product_images")
      .where({ product_id: productId })
      .orderBy("image_id", "asc")
      .select("image_url"),
    db("users")
      .where({ id: product.seller_id })
      .select("id", "full_name", "positive_reviews", "negative_reviews")
      .first(),
    db("product_descriptions")
      .where({ product_id: productId, lang: "vi" })
      .orderBy("version", "desc")
      .select("content")
      .first(),
    db("categories")
      .where({ category_id: product.category_id })
      .first()
  ]);

  let parentCategory = null;
  if (category && category.parent_id) {
    parentCategory = await db("categories")
      .where({ category_id: category.parent_id })
      .select("category_id", "name", "slug")
      .first();
  }

  return {
    ...product,
    images: images,
    seller: seller,
    description: description,
    category: {
      ...category,
      parent: parentCategory,
    },
  };
};

export const findCommentsById = async (
  productId: number,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const parentComments = await db("product_comments")
    .join("users", "product_comments.user_id", "users.id")
    .where({
      "product_comments.product_id": productId,
      "product_comments.parent_id": null,
    })
    .select(
      "product_comments.*",
      "users.id as user_id",
      "users.full_name"
    )
    .orderBy("product_comments.created_at", "desc")
    .limit(limit)
    .offset(offset);

  const totalResult = await db("product_comments")
    .where({
      product_id: productId,
      parent_id: null,
    })
    .count("comment_id as total")
    .first();

  const total = totalResult ? parseInt(totalResult.total as string) : 0;

  // Fetch replies for these comments
  const commentIds = parentComments.map((c) => c.comment_id);
  const replies = await db("product_comments")
    .join("users", "product_comments.user_id", "users.id")
    .whereIn("product_comments.parent_id", commentIds)
    .select(
      "product_comments.*",
      "users.id as user_id",
      "users.full_name"
    )
    .orderBy("product_comments.created_at", "asc");

  const repliesMap = new Map<number, any[]>();
  replies.forEach((r) => {
    if (!repliesMap.has(r.parent_id)) {
      repliesMap.set(r.parent_id, []);
    }
    repliesMap.get(r.parent_id)?.push(r);
  });

  const data = parentComments.map((comment) => ({
    ...comment,
    replies: (repliesMap.get(comment.comment_id) || []),
  }));

  return {
    data,
    total,
  };
};

export const getStepPriceById = async (productId: number): Promise<number> => {
  const product = await db("products")
    .where({ product_id: productId })
    .select("step_price")
    .first();
  return toNum(product?.step_price);
};

export const getStartPriceById = async (productId: number): Promise<number> => {
  const product = await db("products")
    .where({ product_id: productId })
    .select("start_price")
    .first();
  return toNum(product?.start_price);
};

export const getHighestBidderId = async (
  productId: number
): Promise<number | null> => {
  const product = await db("products")
    .where({ product_id: productId })
    .select("highest_bidder_id")
    .first();
  return product?.highest_bidder_id ?? null;
};

export const updateHighestBidderId = async (
  productId: number,
  newHighestBidderId: number
): Promise<void> => {
  await db("products")
    .where({ product_id: productId })
    .update({ highest_bidder_id: newHighestBidderId });
};

export const appendProductDescription = async (
  productId: number,
  sellerId: number,
  content: string
): Promise<void> => {
  const latestDescription = await db("product_descriptions")
    .where({ product_id: productId })
    .orderBy("version", "desc")
    .select("version")
    .first();

  const newVersion = (latestDescription?.version ?? 0) + 1;

  await db("product_descriptions").insert({
    product_id: productId,
    author_id: sellerId,
    content: content,
    version: newVersion,
    lang: "vi"
  });
};

export const getProductBidInfo = async (
  productId: number
) => {
  const product = await db("products")
    .where({ product_id: productId })
    .select(
      "step_price",
      "start_price",
      "current_price",
      "highest_bidder_id"
    )
    .first();

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
