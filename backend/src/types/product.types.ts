export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductDetail {
  thumbnail: string;
  name: string;
  startPrice: number;
  stepPrice: number;
  buyNowPrice?: number;
  currentPrice: number;
  createdAt: Date;
  endTime: Date;
  bidCount: number;
  autoExtend: boolean;
  status: string;
  images: string[];
  seller: {
    id: number;
    fullName: string;
    positiveReviews: number;
    negativeReviews: number;
  };
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
    parent?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface ProductComment {
  commentId: number;
  content: string;
  user: {
    userId: number;
    fullName: string;
  };
  createdAt: Date;
  updatedAt: Date | null;
  replies: Array<{
    commentId: number;
    content: string;
    user: {
      userId: number;
      fullName: string;
    };
    createdAt: Date;
    updatedAt: Date | null;
  }>;
}

export interface ProductBidInfo {
  stepPrice: number;
  startPrice: number;
  currentPrice: number;
  highestBidderId: number | null;
}

export interface ProductListCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  buyNowPrice?: number;
  topBidder: string;
  timeLeft: string;
  isNewArrival?: boolean;
  bidCount: number;
}