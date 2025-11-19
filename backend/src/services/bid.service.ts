import * as bidRepository from "../repositories/bid.repository";
import * as userRepository from "../repositories/user.repository";
import * as productRepository from "../repositories/product.repository";
import { ForbiddenError, NotFoundError } from "../errors";
import { BID_CONSTANTS } from "../utils/constant.util";
import { BidHistoryItem, HighestBidder } from "../types/bid.types";
import { maskName } from "../utils/mask.util";
import prisma from "../database/prisma";
import { PaginatedResult } from "../types/product.types";

const validateBidderRating = async (bidderId: number): Promise<void> => {
    const reviews = await userRepository.getPositiveNegativeReviewsById(bidderId);
    if (!reviews) {
        throw new NotFoundError("User not found");
    }

    const { positive_reviews, negative_reviews } = reviews;
    const totalReviews = positive_reviews + negative_reviews;

    if (totalReviews > BID_CONSTANTS.MIN_RATING_REVIEWS) {
        const ratingPercent = positive_reviews / totalReviews;
        if (ratingPercent < BID_CONSTANTS.MIN_RATING_PERCENT) {
            throw new ForbiddenError("Rating percentage is too low to place a bid");
        }
    }
};

const calculateMinBidAmount = (startPrice: number, currentPrice: number, stepPrice: number): number => {
    return Math.max(startPrice, currentPrice + stepPrice);
};

const handleFirstBid = async (
    productId: number,
    bidderId: number,
    placedMaxPrice: number,
    startPrice: number
): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        await tx.auto_bids.create({
            data: {
                product_id: productId,
                bidder_id: bidderId,
                max_amount: placedMaxPrice
            }
        });

        await tx.products.update({
            where: { product_id: productId },
            data: {
                current_price: startPrice,
                highest_bidder_id: bidderId,
                bid_count: { increment: 1 }
            }
        });

        await tx.bids.create({
            data: {
                product_id: productId,
                bidder_id: bidderId,
                amount: startPrice
            }
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
    const existingBidderMaxPrice = await bidRepository.getMaxPriceByBidderId(productId, bidderId);

    if (bidderId === highestBidderId) {
        if (placedMaxPrice > highestBidderMaxPrice) {
            await bidRepository.updateMaxPrice(productId, bidderId, placedMaxPrice);
        }
        return;
    }

    await prisma.$transaction(async (tx) => {
        let newCurrentPrice: number;
        let newHighestBidderId: number;

        if (placedMaxPrice >= highestBidderMaxPrice + stepPrice) {
            newCurrentPrice = highestBidderMaxPrice + stepPrice;
            newHighestBidderId = bidderId;
        } else {
            newCurrentPrice = Math.max(placedMaxPrice, currentPrice);
            newHighestBidderId = highestBidderId;
        }

        await tx.products.update({
            where: { product_id: productId },
            data: {
                current_price: newCurrentPrice,
                highest_bidder_id: newHighestBidderId,
                bid_count: { increment: 1 }
            }
        });

        await tx.bids.create({
            data: {
                product_id: productId,
                bidder_id: newHighestBidderId,
                amount: newCurrentPrice
            }
        });

        const newStoredMax = Math.max(existingBidderMaxPrice ?? 0, placedMaxPrice);
        await tx.auto_bids.upsert({
            where: {
                product_id_bidder_id: {
                    product_id: productId,
                    bidder_id: bidderId
                }
            },
            update: {
                max_amount: newStoredMax
            },
            create: {
                product_id: productId,
                bidder_id: bidderId,
                max_amount: newStoredMax
            }
        });
    });
};

export const getHighestBidById = async (productId: number): Promise<HighestBidder | null> => {
    return await bidRepository.findHighestBidById(productId);
};

export const placeBid = async (
    productId: number,
    bidderId: number,
    placedMaxPrice: number
): Promise<void> => {
    await validateBidderRating(bidderId);

    const productBidInfo = await productRepository.getProductBidInfo(productId);
    const { step_price, start_price, current_price, highest_bidder_id } = productBidInfo;

    const minBidAmount = calculateMinBidAmount(start_price, current_price, step_price);
    if (placedMaxPrice < minBidAmount) {
        throw new ForbiddenError(`Placed Max Bid Price must be at least ${minBidAmount}`);
    }

    if (highest_bidder_id === null) {
        await handleFirstBid(productId, bidderId, placedMaxPrice, start_price);
        return;
    }

    const highestBidderMaxPrice = await bidRepository.getMaxPriceByBidderId(productId, highest_bidder_id);
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
    page: number,
    limit: number
): Promise<PaginatedResult<BidHistoryItem>> => {
    const history = await bidRepository.findBidHistoryByProductId(productId, page, limit);
    
    const maskedData = history.data.map(item => ({
        ...item,
        bidder_name: maskName(item.bidder_name)
    }));

    return {
        data: maskedData,
        pagination: history.pagination
    };
};
