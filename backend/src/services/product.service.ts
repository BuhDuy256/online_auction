import * as productRepository from "../repositories/product.repository";
import {
  ProductsSearchQuery,
  CreateProduct,
  GetProductCommentsQuery,
  AppendProductDescription,
} from "../api/schemas/product.schema";
import { toNum } from "../utils/number.util";
import { PaginatedResult, ProductListCardProps } from "../types/product.types";

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

  const singleCategorySlug = categorySlug && categorySlug.length > 0 ? categorySlug[0] : undefined;

  const result = await productRepository.searchProducts(
    q,
    singleCategorySlug,
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
