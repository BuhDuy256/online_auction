// Product Detail Page - Type Definitions

export interface ProductDetailResponse {
  product: ProductInfo;
  seller: SellerInfo;
  auction: AuctionInfo;
  userProductStatus?: UserProductStatus;
}

export interface ProductInfo {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  images: string[];
  overview: string;
  category: CategoryWithParent;
  breadcrumb: BreadcrumbItem[];
  relatedProducts: any[]; // ProductListCardProps[]
}

export interface CategoryWithParent {
  id: number;
  name: string;
  slug: string;
  parent: BreadcrumbItem | null;
}

export interface BreadcrumbItem {
  id: number;
  name: string;
  slug: string;
}

export interface SellerInfo {
  id: number;
  name: string;
  rating: SellerRating;
}

export interface SellerRating {
  average: number;
  totalReviews: number;
  positivePercentage: number;
}

export interface AuctionInfo {
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  stepPrice: number;
  bidCount: number;
  watchlistCount: number;
  topBidder: string;
  startTime: string;
  endTime: string;
  autoExtend: boolean;
  status: string;
}

export interface UserProductStatus {
  isWatchlisted: boolean;
  isOutbid: boolean;
  isTopBidder: boolean;
  currentUserMaxBid?: number;
}

// Bid History (Lazy Load)
export interface BidHistoryResponse {
  bids: BidHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BidHistoryItem {
  bidId: number;
  amount: number;
  bidder: string;
  bidTime: string;
  isTopBid: boolean;
}

// Q&A (Lazy Load)
export interface QuestionsResponse {
  questions: QuestionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuestionItem {
  questionId: number;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: AnswerItem | null;
}

export interface AnswerItem {
  answer: string;
  answeredBy: string;
  answeredAt: string;
}
