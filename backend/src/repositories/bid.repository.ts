import db from "../database/db";
import { toNum } from "../utils/number.util";

export const findHighestBidById = async (
  productId: number
) => {
  const currentBid = await db("products")
    .leftJoin("users", "products.highest_bidder_id", "users.id")
    .where({ "products.product_id": productId })
    .select(
      "products.current_price",
      "users.id as user_id",
      "users.full_name",
      "users.positive_reviews",
      "users.negative_reviews"
    )
    .first();

  return currentBid || null;
};

export const getMaxPriceByBidderId = async (
  productId: number,
  bidderId: number
): Promise<number> => {
  const autoBid = await db("auto_bids")
    .where({
      product_id: productId,
      bidder_id: bidderId,
    })
    .select("max_amount")
    .first();
  return toNum(autoBid?.max_amount);
};

export const updateMaxPrice = async (
  productId: number,
  bidderId: number,
  newMaxPrice: number
): Promise<void> => {
  await db("auto_bids")
    .where({
      product_id: productId,
      bidder_id: bidderId,
    })
    .update({
      max_amount: newMaxPrice,
    });
};

export const getCurrentPriceById = async (
  productId: number
): Promise<number> => {
  const product = await db("products")
    .where({ product_id: productId })
    .select("current_price")
    .first();
  return toNum(product?.current_price);
};

export const createAutoBid = async (
  productId: number,
  bidderId: number,
  maxPrice: number
): Promise<void> => {
  await db("auto_bids").insert({
    product_id: productId,
    bidder_id: bidderId,
    max_amount: maxPrice,
  });
};

export const updateCurrentPrice = async (
  productId: number,
  bidderId: number,
  newPrice: number
): Promise<void> => {
  await db.transaction(async (trx) => {
    await trx("products")
      .where({ product_id: productId })
      .update({
        current_price: newPrice,
      })
      .increment("bid_count", 1);

    await trx("bids").insert({
      product_id: productId,
      bidder_id: bidderId,
      amount: newPrice,
    });
  });
};

export const createOrUpdateAutoBid = async (
  productId: number,
  bidderId: number,
  maxPrice: number
): Promise<void> => {
  await db("auto_bids")
    .insert({
      product_id: productId,
      bidder_id: bidderId,
      max_amount: maxPrice,
    })
    .onConflict(["product_id", "bidder_id"])
    .merge({
      max_amount: maxPrice,
    });
};

export const findBidHistoryByProductId = async (
  productId: number,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const bids = await db("bids")
    .join("users", "bids.bidder_id", "users.id")
    .where({ "bids.product_id": productId })
    .select("bids.created_at", "bids.amount", "users.full_name")
    .orderBy("bids.created_at", "desc")
    .limit(limit)
    .offset(offset);

  const countResult = await db("bids")
    .where({ product_id: productId })
    .count("bid_id as total")
    .first();

  const total = countResult ? parseInt(countResult.total as string) : 0;

  return {
    data: bids,
    total,
  };
};
