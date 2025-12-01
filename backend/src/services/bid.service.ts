import * as bidRepository from "../repositories/bid.repository";
import * as userRepository from "../repositories/user.repository";
import * as productRepository from "../repositories/product.repository";
import { ForbiddenError, NotFoundError } from "../errors";
import { BID_CONSTANTS } from "../utils/constant.util";
import { BidHistoryItem, HighestBidder } from "../types/bid.types";
import { maskName } from "../utils/mask.util";
import db from "../database/db";
import { PaginatedResult } from "../types/product.types";
import { PlaceBidDto, GetBidHistoryQuery } from "../api/schemas/bid.schema";
import { toNum } from "../utils/number.util";

const validateBidderRating = async (bidderId: number): Promise<void> => {
  const reviews = await userRepository.getPositiveNegativeReviewsById(bidderId);
  if (!reviews) {
    throw new NotFoundError("User not found");
  }

  const { positiveReviews, negativeReviews } = reviews;
  const totalReviews = positiveReviews + negativeReviews;

  if (totalReviews > BID_CONSTANTS.MIN_RATING_REVIEWS) {
    const ratingPercent = positiveReviews / totalReviews;
    if (ratingPercent < BID_CONSTANTS.MIN_RATING_PERCENT) {
      throw new ForbiddenError("Rating percentage is too low to place a bid");
    }
  }
};

const calculateMinBidAmount = (
  startPrice: number,
  currentPrice: number,
  stepPrice: number
): number => {
  return Math.max(startPrice, currentPrice + stepPrice);
};

const handleFirstBid = async (
  productId: number,
  bidderId: number,
  placedMaxPrice: number,
  startPrice: number
): Promise<void> => {
  await db.transaction(async (tx) => {
    await tx("auto_bids").insert({
      product_id: productId,
      bidder_id: bidderId,
      max_amount: placedMaxPrice,
    });

    await tx("products")
      .where({ product_id: productId })
      .update({
        current_price: startPrice,
        highest_bidder_id: bidderId,
      })
      .increment("bid_count", 1);

    await tx("bids").insert({
      product_id: productId,
      bidder_id: bidderId,
      amount: startPrice,
    });
  });
};

const handleExistingBid = async (
  productId: number,
  bidderId: number,
  placedMaxPrice: number,
  highestBidderId: number,
  highestBidderMaxPrice: number,
  stepPrice: number,
  currentPrice: number
): Promise<void> => {
  const existingBidderMaxPrice = await bidRepository.getMaxPriceByBidderId(
    productId,
    bidderId
  );

  if (bidderId === highestBidderId) {
    if (placedMaxPrice > highestBidderMaxPrice) {
      await bidRepository.updateMaxPrice(productId, bidderId, placedMaxPrice);
    }
    return;
  }

  await db.transaction(async (tx) => {
    let newCurrentPrice: number;
    let newHighestBidderId: number;

    if (placedMaxPrice >= highestBidderMaxPrice + stepPrice) {
      newCurrentPrice = highestBidderMaxPrice + stepPrice;
      newHighestBidderId = bidderId;
    } else {
      newCurrentPrice = Math.max(placedMaxPrice, currentPrice);
      newHighestBidderId = highestBidderId;
    }

    await tx("products")
      .where({ product_id: productId })
      .update({
        current_price: newCurrentPrice,
        highest_bidder_id: newHighestBidderId,
      })
      .increment("bid_count", 1);

    await tx("bids").insert({
      product_id: productId,
      bidder_id: newHighestBidderId,
      amount: newCurrentPrice,
    });

    const newStoredMax = Math.max(existingBidderMaxPrice ?? 0, placedMaxPrice);

    await tx("auto_bids")
      .insert({
        product_id: productId,
        bidder_id: bidderId,
        max_amount: newStoredMax,
      })
      .onConflict(["product_id", "bidder_id"])
      .merge({
        max_amount: newStoredMax,
      });
  });
};

export const getHighestBidById = async (
  productId: number
): Promise<HighestBidder | null> => {
  const currentBid = await bidRepository.findHighestBidById(productId);

  if (!currentBid) {
    return null;
  }

  return {
    currentPrice: toNum(currentBid.current_price),
    highestBidder: {
      id: currentBid.user_id ?? 0,
      fullName: currentBid.full_name ?? "",
      positiveReviews: currentBid.positive_reviews ?? 0,
      negativeReviews: currentBid.negative_reviews ?? 0,
    },
  };
};

export const placeBid = async (data: PlaceBidDto): Promise<void> => {
  const {
    productId,
    bidderId,
    maxAmount: placedMaxPrice,
  } = data;

  await validateBidderRating(bidderId);

  const productBidInfo = await productRepository.getProductBidInfo(productId);
  const { step_price, start_price, current_price, highest_bidder_id } =
    productBidInfo as any; // Cast to any because it returns raw object now

  const minBidAmount = calculateMinBidAmount(
    start_price,
    current_price,
    step_price
  );
  if (placedMaxPrice < minBidAmount) {
    throw new ForbiddenError(
      `Placed Max Bid Price must be at least ${minBidAmount}`
    );
  }

  if (highest_bidder_id === null) {
    await handleFirstBid(productId, bidderId, placedMaxPrice, start_price);
    return;
  }

  const highestBidderMaxPrice = await bidRepository.getMaxPriceByBidderId(
    productId,
    highest_bidder_id
  );
  await handleExistingBid(
    productId,
    bidderId,
    placedMaxPrice,
    highest_bidder_id,
    highestBidderMaxPrice,
    step_price,
    current_price
  );
};

export const getBidHistory = async (
  productId: number,
  query: GetBidHistoryQuery
): Promise<PaginatedResult<BidHistoryItem>> => {
  const { page, limit } = query;
  const history = await bidRepository.findBidHistoryByProductId(
    productId,
    page,
    limit
  );

  const maskedData = history.data.map((item: any) => ({
    createdAt: item.created_at,
    bidderName: maskName(item.full_name),
    amount: toNum(item.amount),
  }));

  return {
    data: maskedData,
    pagination: {
      page,
      limit,
      total: history.total,
      totalPages: Math.ceil(history.total / limit),
    },
  };
};
