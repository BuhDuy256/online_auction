export interface Product {
  id: string;
  slug?: string; // Product slug for SEO-friendly URLs
  title: string;
  image: string;
  currentBid: number;
  buyNowPrice?: number;
  topBidder: string;
  timeLeft: string;
  isNewArrival?: boolean;
  bidCount: number;
}

export interface SearchProductsParams {
  q?: string;
  categorySlug?: string | string[];
  page?: number;
  limit?: number;
  sort?: string;
  excludeCategorySlug?: string | string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
