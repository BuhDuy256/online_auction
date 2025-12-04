import { ProductListCardProps, ProductDetail, ProductComment } from "../api/dtos/responses/product.type";
import { toNum } from "../utils/number.util";

export const mapToProductListCard = (product: any): ProductListCardProps => {
  if (!product) {
    throw new Error("Product data is required for mapping");
  }

  const now = Date.now();
  const endTime = new Date(product.end_time).getTime();
  const msLeft = endTime - now;

  let timeLeft = "Ended";
  if (msLeft > 0) {
    const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      timeLeft = `${days}d ${hours}h`;
    } else if (hours > 0) {
      timeLeft = `${hours}h ${minutes}m`;
    } else {
      timeLeft = `${minutes}m`;
    }
  }

  const isNewArrival = Date.now() - new Date(product.created_at).getTime() < 24 * 60 * 60 * 1000;

  return {
    id: product.product_id.toString(),
    slug: product.slug,
    title: product.name,
    image: product.thumbnail_url || "",
    currentBid: toNum(product.current_price),
    buyNowPrice: product.buy_now_price ? toNum(product.buy_now_price) : undefined,
    topBidder: product.bidder_name || "No bids yet",
    timeLeft,
    isNewArrival,
    bidCount: product.bid_count || 0,
  };
};

/**
 * Maps raw product detail data to ProductDetail response
 */
export const mapToProductDetail = (product: any): ProductDetail | null => {
  if (!product) return null;

  return {
    thumbnail: product.thumbnail_url || "",
    name: product.name,
    startPrice: toNum(product.start_price),
    stepPrice: toNum(product.step_price),
    buyNowPrice: product.buy_now_price ? toNum(product.buy_now_price) : undefined,
    currentPrice: toNum(product.current_price),
    createdAt: product.created_at,
    endTime: product.end_time,
    bidCount: product.bid_count,
    autoExtend: product.auto_extend,
    status: product.status,
    images: product.images.map((img: any) => img.image_url),
    seller: {
      id: product.seller.id,
      fullName: product.seller.full_name,
      positiveReviews: product.seller.positive_reviews,
      negativeReviews: product.seller.negative_reviews,
    },
    description: product.description?.content || "",
    category: {
      id: product.category.category_id,
      name: product.category.name,
      slug: product.category.slug,
      parent: product.category.parent
        ? {
          id: product.category.parent.category_id,
          name: product.category.parent.name,
          slug: product.category.parent.slug,
        }
        : undefined,
    },
  };
};

/**
 * Maps raw comment data to ProductComment response
 */
export const mapToProductComment = (comment: any): ProductComment => {
  return {
    commentId: comment.comment_id,
    content: comment.content,
    user: {
      userId: comment.user_id,
      fullName: comment.full_name,
    },
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    replies: (comment.replies || []).map((reply: any) => ({
      commentId: reply.comment_id,
      content: reply.content,
      user: {
        userId: reply.user_id,
        fullName: reply.full_name,
      },
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
    })),
  };
};

/**
 * Masks bidder name for privacy (shows last 4-5 chars + "****")
 */
export const maskBidderName = (name: string | null): string => {
  if (!name) return "****";
  const visibleChars = Math.min(5, Math.max(4, name.length - 4));
  const lastChars = name.slice(-visibleChars);
  return `****${lastChars}`;
};

/**
 * Calculates seller rating based on positive and negative reviews
 */
export const calculateSellerRating = (positiveReviews: number, negativeReviews: number) => {
  const total = positiveReviews + negativeReviews;
  if (total === 0) {
    return {
      average: 0,
      totalReviews: 0,
      positivePercentage: 0,
    };
  }

  const average = (positiveReviews / total) * 5;
  const positivePercentage = (positiveReviews / total) * 100;

  return {
    average: Math.round(average * 10) / 10,
    totalReviews: total,
    positivePercentage: Math.round(positivePercentage),
  };
};
