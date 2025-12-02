import apiClient from "./apiClient";
import type { Product, SearchProductsParams, PaginatedResponse } from "../types/product";
import type {
  ProductDetailResponse,
  BidHistoryResponse,
  QuestionsResponse,
} from "../types/product-detail";

export const searchProducts = async (
  params: SearchProductsParams
): Promise<PaginatedResponse<Product>> => {
  const queryParams = new URLSearchParams();

  if (params.q) {
    queryParams.append("q", params.q);
  }

  if (params.categorySlug) {
    if (Array.isArray(params.categorySlug)) {
      params.categorySlug.forEach(slug => queryParams.append("categorySlug", slug));
    } else {
      queryParams.append("categorySlug", params.categorySlug);
    }
  }

  if (params.page) {
    queryParams.append("page", params.page.toString());
  }

  if (params.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  if (params.sort) {
    queryParams.append("sort", params.sort);
  }

  const queryString = queryParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

  return apiClient.get(endpoint);
};

// Product Detail Page
export const getProductDetail = async (
  productId: number,
  userId?: number
): Promise<ProductDetailResponse> => {
  const endpoint = userId
    ? `/products/${productId}?userId=${userId}`
    : `/products/${productId}`;

  const response = await apiClient.get(endpoint);
  return response.data; // Unwrap { success: true, data: ... }
};

// Lazy Load: Bid History
export const getProductBidHistory = async (
  productId: number,
  page: number = 1,
  limit: number = 20
): Promise<BidHistoryResponse> => {
  const response = await apiClient.get(`/products/${productId}/bids?page=${page}&limit=${limit}`);
  return {
    bids: response.data,
    pagination: response.pagination
  };
};

// Lazy Load: Q&A
export const getProductQuestions = async (
  productId: number,
  page: number = 1,
  limit: number = 10
): Promise<QuestionsResponse> => {
  const response = await apiClient.get(`/products/${productId}/questions?page=${page}&limit=${limit}`);
  return {
    questions: response.data,
    pagination: response.pagination
  };
};
