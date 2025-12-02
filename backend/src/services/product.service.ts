import * as productRepository from "../repositories/product.repository";
import {
  ProductsSearchQuery,
  CreateProduct,
  GetProductCommentsQuery,
  AppendProductDescription,
} from "../api/schemas/product.schema";
import { toNum } from "../utils/number.util";
import { PaginatedResult, ProductListCardProps } from "../types/product.types";
import {
  ProductDetailResponse,
  BidHistoryResponse,
  QuestionsResponse
} from "../types/product-detail.types";

// Helper: Mask bidder name (last 4-5 chars + "****")
const maskBidderName = (name: string | null): string => {
  if (!name) return "****";
  const visibleChars = Math.min(5, Math.max(4, name.length - 4));
  const lastChars = name.slice(-visibleChars);
  return `****${lastChars}`;
};

// Helper: Calculate seller rating
const calculateSellerRating = (positiveReviews: number, negativeReviews: number) => {
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
    average: Math.round(average * 10) / 10, // Round to 1 decimal
    totalReviews: total,
    positivePercentage: Math.round(positivePercentage),
  };
};

const mapProductToResponse = (product: any): ProductListCardProps => {
  if (!product) return null as any;

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

  return {
    id: product.product_id.toString(),
    slug: product.slug,
    title: product.name,
    image: product.thumbnail_url || "",
    currentBid: toNum(product.current_price),
    buyNowPrice: product.buy_now_price ? toNum(product.buy_now_price) : undefined,
    topBidder: product.highest_bidder?.full_name || "No bids yet",
    timeLeft: timeLeft,
    isNewArrival: product.isNewArrival || false,
    bidCount: product.bid_count || 0,
  };
};

const mapProductDetailToResponse = (product: any) => {
  if (!product) return null;
  return {
    thumbnail: product.thumbnail_url || "",
    name: product.name,
    startPrice: toNum(product.start_price),
    stepPrice: toNum(product.step_price),
    buyNowPrice: product.buy_now_price
      ? toNum(product.buy_now_price)
      : undefined,
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

const mapCommentToResponse = (comment: any) => {
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

export const searchProducts = async (query: ProductsSearchQuery): Promise<PaginatedResult<ProductListCardProps>> => {
  const { q, categorySlug, page, limit, sort, excludeCategorySlug } = query;

  const result = await productRepository.searchProducts(
    q,
    categorySlug,
    page,
    limit,
    sort,
    excludeCategorySlug
  );

  return {
    data: result.data.map(mapProductToResponse),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

export const createProduct = async (data: CreateProduct) => {
  const product = await productRepository.createProduct({
    name: data.name,
    category_id: data.categoryId,
    seller_id: data.sellerId,
    start_price: data.startPrice,
    step_price: data.stepPrice,
    buy_now_price: data.buyNowPrice,
    end_time: data.endTime,
    auto_extend: data.autoExtend === "yes",
    description: data.description,
    thumbnail: data.thumbnail,
    images: data.images,
  });

  return {
    productId: product.product_id,
    name: product.name,
    status: product.status,
  };
};

export const getProductDetailById = async (productId: number) => {
  const product = await productRepository.findDetailById(productId);
  return mapProductDetailToResponse(product);
};

export const getProductCommentsById = async (
  productId: number,
  query: GetProductCommentsQuery
) => {
  const { page, limit } = query;
  const result = await productRepository.findCommentsById(
    productId,
    page,
    limit
  );

  return {
    data: result.data.map(mapCommentToResponse),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

export const appendProductDescription = async (
  productId: number,
  body: AppendProductDescription
) => {
  const { sellerId, content } = body;
  await productRepository.appendProductDescription(
    productId,
    sellerId,
    content
  );
};

// Product Detail Page
export const getProductDetail = async (
  productId: number,
  userId?: number
): Promise<ProductDetailResponse> => {
  // Fetch main product data
  const product = await productRepository.getProductDetailById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  // Fetch related data in parallel
  const [images, description, categoryPath, watchlistCount] = await Promise.all([
    productRepository.getProductImages(productId),
    productRepository.getProductDescription(productId),
    productRepository.getCategoryWithParents(product.category_id),
    productRepository.getWatchlistCount(productId),
  ]);

  // User-specific data
  let userProductStatus = undefined;
  if (userId) {
    const [isWatchlisted, bidStatus] = await Promise.all([
      productRepository.isUserWatchlisted(userId, productId),
      productRepository.getUserBidStatus(userId, productId),
    ]);

    const isTopBidder = product.highest_bidder_id === userId;
    const isOutbid = bidStatus.hasPlacedBid && !isTopBidder;

    userProductStatus = {
      isWatchlisted,
      isOutbid,
      isTopBidder,
      currentUserMaxBid: bidStatus.currentUserMaxBid,
    };
  }

  // Calculate seller rating
  const sellerRating = calculateSellerRating(
    product.positive_reviews || 0,
    product.negative_reviews || 0
  );

  // Build breadcrumb from category path
  const breadcrumb = categoryPath.map((cat: any) => ({
    id: cat.category_id,
    name: cat.name,
    slug: cat.slug,
  }));

  // Get related products (exclude current product)
  const relatedProducts = await productRepository.searchProducts(
    undefined, // no search query
    [product.category_slug], // same category (must be array)
    1, // page
    4, // limit
    undefined, // no sort (use default)
    undefined, // no exclude category
    [productId] // exclude current product
  );

  // Build response
  const response: ProductDetailResponse = {
    product: {
      id: product.product_id,
      name: product.name,
      slug: product.slug || product.category_slug, // Use product slug (fallback to category slug for old products)
      thumbnailUrl: product.thumbnail_url || "",
      images: images.map((img: any) => img.image_url),
      overview: description?.content || "",
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug,
        parent: breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : null,
      },
      breadcrumb,
      relatedProducts: relatedProducts.data.map(mapProductToResponse),
    },
    seller: {
      id: product.seller_id,
      name: product.seller_name,
      rating: sellerRating,
    },
    auction: {
      startPrice: toNum(product.start_price),
      currentPrice: toNum(product.current_price),
      buyNowPrice: product.buy_now_price ? toNum(product.buy_now_price) : undefined,
      stepPrice: toNum(product.step_price),
      bidCount: product.bid_count || 0,
      watchlistCount,
      topBidder: maskBidderName(product.bidder_name),
      startTime: product.created_at,
      endTime: product.end_time,
      autoExtend: product.auto_extend,
      status: product.status,
    },
    userProductStatus,
  };

  return response;
};

// Lazy load: Bid History
export const getProductBidHistory = async (
  productId: number,
  page: number = 1,
  limit: number = 20
): Promise<BidHistoryResponse> => {
  const { bids, total } = await productRepository.getProductBidHistory(
    productId,
    page,
    limit
  );

  return {
    bids: bids.map((bid: any) => ({
      bidId: bid.bid_id,
      amount: toNum(bid.amount),
      bidder: maskBidderName(bid.bidder_name),
      bidTime: bid.created_at,
      isTopBid: bid.isTopBid || false,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lazy load: Q&A
export const getProductQuestions = async (
  productId: number,
  page: number = 1,
  limit: number = 10
): Promise<QuestionsResponse> => {
  const { questions, total } = await productRepository.getProductQuestions(
    productId,
    page,
    limit
  );

  return {
    questions: questions.map((q: any) => ({
      questionId: q.comment_id,
      question: q.question,
      askedBy: q.asker_name,
      askedAt: q.created_at,
      answer: q.answer ? {
        answer: q.answer.answer,
        answeredBy: q.answer.answerer_name,
        answeredAt: q.answer.answered_at,
      } : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
