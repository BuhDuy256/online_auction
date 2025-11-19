import * as bidRepository from "../repositories/bid.repository";
import * as userRepository from "../repositories/user.repository";
import * as productRepository from "../repositories/product.repository";
import { ForbiddenError, NotFoundError } from "../errors";

export const getHighestBidById = async (
    productId: number
) => {
    const highestBidder = await bidRepository.findHighestBidById(productId);
    return highestBidder;
};

export const placeBid = async (
    productId: number, 
    bidderId: number, 
    placedMaxPrice: number
): Promise<void> => {

    const reviews = await userRepository.getPositiveNegativeReviewsById(bidderId);
    if (!reviews) throw new NotFoundError("User not found");

    const positive = reviews.positive_reviews;
    const negative = reviews.negative_reviews;
    const totalReviews = positive + negative;

    if (totalReviews > 0) {
        const ratingPercent = positive / totalReviews;
        if (ratingPercent < 0.8) {
            throw new ForbiddenError("Rating percentage is too low to place a bid");
        }
    }

    const stepPrice = await productRepository.getStepPriceById(productId);
    const startPrice = await productRepository.getStartPriceById(productId);
    const currentPrice = await bidRepository.getCurrentPriceById(productId);

    const minBidAmount = Math.max(startPrice, currentPrice + stepPrice);
    if (placedMaxPrice < minBidAmount) {
        throw new ForbiddenError(
            `Placed Max Bid Price must be at least ${minBidAmount}`
        );
    }

    const highestBidderId = await productRepository.getHighestBidderId(productId);

    if (highestBidderId === null) {
        await bidRepository.createOrUpdateAutoBid(productId, bidderId, placedMaxPrice);
        await bidRepository.updateCurrentPrice(productId, bidderId, startPrice);
        await productRepository.updateHighestBidderId(productId, bidderId);
        return;
    }

    const highestBidderMaxPrice =
        await bidRepository.getMaxPriceByBidderId(productId, highestBidderId);

    const existingBidderMaxPrice =
        await bidRepository.getMaxPriceByBidderId(productId, bidderId);

    if (bidderId === highestBidderId) {
        if (placedMaxPrice > highestBidderMaxPrice) {
            await bidRepository.updateMaxPrice(productId, bidderId, placedMaxPrice);
        }
        return;
    }

    if (placedMaxPrice >= highestBidderMaxPrice + stepPrice) {
        const newCurrentPrice = highestBidderMaxPrice + stepPrice;
        await bidRepository.updateCurrentPrice(productId, bidderId, newCurrentPrice);
        await bidRepository.createOrUpdateAutoBid(productId, bidderId, placedMaxPrice);
        await productRepository.updateHighestBidderId(productId, bidderId);
        return;
    }

    const newCurrentPrice = Math.max(placedMaxPrice, currentPrice);

    await bidRepository.updateCurrentPrice(
        productId,
        highestBidderId,
        newCurrentPrice
    );

    const newStoredMax = Math.max(existingBidderMaxPrice ?? 0, placedMaxPrice);

    await bidRepository.createOrUpdateAutoBid(
        productId, 
        bidderId, 
        newStoredMax
    );

    return;
};

