import * as productRepository from "../repositories/product.repository";
import {
  ProductSearchQuery,
  CreateProduct,
  GetProductCommentsQuery,
  AppendProductDescription,
} from "../api/schemas/product.schema";
import { toNum } from "../utils/number.util";

const mapProductToResponse = (product: any) => {
  if (!product) return null;
  return {
    productId: product.product_id,
    thumbnailUrl: product.thumbnail_url,
    name: product.name,
    currentPrice: toNum(product.current_price),
    status: product.status,
    createdAt: product.created_at,
    endTime: product.end_time,
    bidCount: product.bid_count,
    highestBidder: product.highest_bidder
      ? {
        id: product.highest_bidder.id,
        fullName: product.highest_bidder.full_name,
      }
      : null,
    category: product.category
      ? {
        categoryId: product.category.category_id,
        name: product.category.name,
        slug: product.category.slug,
      }
      : undefined,
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

export const searchProducts = async (query: ProductSearchQuery) => {
  const { q, category, page, limit, sort, exclude } = query;

  let result;
  if (category) {
    result = await productRepository.findByCategory(
      category,
      page,
      limit,
      sort,
      exclude
    );
  } else {
    result = await productRepository.fullTextSearch(
      q,
      page,
      limit,
      sort,
      exclude
    );
  }

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
