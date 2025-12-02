/**
 * Product Detail Page - API Response Interface Design
 * 
 * Endpoint: GET /products/:slug-:id
 * Example: GET /products/vintage-leica-m6-camera-with-50mm-f2-lens-123
 * 
 * Response sẽ chứa tất cả data cần thiết để render Initial Load
 * Các phần Lazy Load sẽ có endpoint riêng
 */

// ============================================================================
// INITIAL LOAD - PRIMARY DATA (Single API Call)
// ============================================================================

/**
 * Main Product Detail Response
 * Chứa tất cả data mà user thấy ngay khi vào trang
 */
export interface ProductDetailResponse {
  // Product Basic Info
  product: ProductInfo;

  // Breadcrumb data
  breadcrumb: BreadcrumbItem[];

  // Seller information
  seller: SellerInfo;

  // Current auction status
  auction: AuctionInfo;

  // Product description & details
  description: ProductDescription;

  // Related/Similar products
  relatedProducts: RelatedProduct[];

  // User-specific data (nếu đã login)
  userStatus?: UserProductStatus;
}

// ----------------------------------------------------------------------------
// Product Information
// ----------------------------------------------------------------------------

export interface ProductInfo {
  id: string; // Used in: API calls for lazy loading (bid history, Q&A, etc.)
  slug: string; // Used in: URL generation for product links
  title: string; // Used in: Line 250 - <h1 className="text-3xl"> + Line 229 - Breadcrumb last item

  // Images
  images: string[]; // Used in: Line 237 - <ImageGallery images={productImages} />

  // Category
  category: {
    id: string; // Used in: Category filtering/navigation
    name: string; // Used in: Line 263 - <Badge variant="secondary">Cameras & Photography</Badge>
    slug: string; // Used in: Breadcrumb links for category navigation
  };

  // Trust badges
  badges: {
    isVerifiedSeller: boolean; // Used in: Line 462-467 - "Verified Seller" badge display condition
    hasBuyerProtection: boolean; // Used in: Line 468-473 - "Buyer Protection" badge display condition
    isTrending: boolean; // Used in: Line 474-477 - "Trending Auction" badge display condition
  };
}

// ----------------------------------------------------------------------------
// Breadcrumb Navigation
// ----------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string; // Used in: Lines 203-229 - Breadcrumb text display (Home, Electronics, Cameras, Vintage Leica M6)
  path?: string; // Used in: Lines 206, 213, 220 - <a href="#"> for navigation links (undefined cho item cuối - Line 229)
  slug?: string; // Used in: Category link generation
}

// Example:
// [
//   { label: "Home", path: "/" },
//   { label: "Electronics", path: "/categories/electronics", slug: "electronics" },
//   { label: "Cameras", path: "/categories/cameras", slug: "cameras" },
//   { label: "Vintage Leica M6" } // Current page, no path
// ]

// ----------------------------------------------------------------------------
// Seller Information
// ----------------------------------------------------------------------------

export interface SellerInfo {
  id: string; // Used in: Seller profile links/navigation
  displayName: string; // Used in: Line 286 - <span className="text-accent">****Smith</span>
  avatar: string; // Used in: Line 282 - <AvatarImage src="..."> or dicebear seed generation

  rating: {
    average: number; // Used in: Lines 289-295 - Star rating display (render 5 stars, fill based on average)
    totalReviews: number; // Used in: Line 297 - <span className="text-xs">(248 reviews)</span>
    positivePercentage: number; // Used in: Line 302 - <Badge>98% Positive</Badge>
  };
}

// ----------------------------------------------------------------------------
// Auction Information
// ----------------------------------------------------------------------------

export interface AuctionInfo {
  // Current bid status
  currentPrice: number; // Used in: Line 352 - <CardTitle>${currentPrice.toLocaleString()}</CardTitle> + Line 400 - bid validation
  startingPrice: number; // Used in: Line 432 - Quick Stats "Starting Price" display
  bidIncrement: number; // Used in: Line 439 - Quick Stats "Bid Increment" display
  minimumNextBid: number; // Used in: Line 414 - "Minimum bid: $..." text + bid input validation

  // Bid statistics
  totalBids: number; // Used in: Line 425 - Quick Stats "Total Bids" display {bidHistoryData.length}
  totalWatchers: number; // Used in: Line 365 - Watchers count display <span>47</span>

  // Top bidder (masked)
  topBidder: string; // Used in: Not displayed in current UI (only in bid history)

  // Time information
  endTime: string; // Used in: Countdown timer calculation, convert to Date object
  timeLeftFormatted: string; // Used in: Line 267 - <span className="text-accent">{timeLeft}</span> "2h 15m"

  // Status
  status: "active" | "ended" | "cancelled"; // Used in: Conditional rendering (disable bid button if ended/cancelled)

  // Proxy bidding info
  proxyBiddingEnabled: boolean; // Used in: Lines 370-381 - Conditional display of "Proxy Bidding Active" info box
}

// ----------------------------------------------------------------------------
// Product Description
// ----------------------------------------------------------------------------

export interface ProductDescription {
  // Main description
  overview: string; // Used in: Lines 495-501 - Main description paragraph text

  // Condition details
  condition: {
    title: string; // Used in: Line 503 - <h3 className="text-lg">Condition</h3>
    items: string[]; // Used in: Lines 504-514 - Map to <li> items in condition list
  };

  // What's included
  included: {
    title: string; // Used in: Line 516 - <h3 className="text-lg">What's Included</h3>
    items: string[]; // Used in: Lines 517-524 - Map to <li> items in included list
  };

  // Seller updates
  updates: SellerUpdate[]; // Used in: Lines 533-567 - Map to update cards in "Seller Updates" section
}

export interface SellerUpdate {
  id: string; // Used in: React key prop for mapping
  type: "info" | "success" | "warning"; // Used in: Lines 538-540 + 555-557 - Conditional icon/color (Info icon vs CheckCircle2 icon, bg-accent/20 vs bg-success/20)
  title: string; // Used in: Lines 543 + 560 - <div className="text-sm mb-1">{title}</div>
  message: string; // Used in: Lines 545-547 + 562-565 - Message text after timestamp
  timestamp: string; // Used in: ISO format for sorting or other operations
  timestampFormatted: string; // Used in: Lines 545-547 + 562-565 - Display format "Nov 25, 2025 10:30 AM - {message}"
}

// Example:
// updates: [
//   {
//     id: "1",
//     type: "info",
//     title: "Additional photos added",
//     message: "Added close-up shots of the lens elements and shutter mechanism",
//     timestamp: "2025-11-25T10:30:00Z",
//     timestampFormatted: "Nov 25, 2025 10:30 AM"
//   }
// ]

// ----------------------------------------------------------------------------
// Related Products
// ----------------------------------------------------------------------------

export interface RelatedProduct {
  id: string; // Used in: Line 661 - React key prop {product.id}
  slug: string; // Used in: Navigation link generation to /products/{slug}-{id}
  title: string; // Used in: ProductListCard component - product title display
  image: string; // Used in: ProductListCard component - product image display

  currentBid: number; // Used in: ProductListCard component - current bid price display
  topBidder: string; // Used in: ProductListCard component - top bidder display (Masked: "****Chen")
  bidCount: number; // Used in: ProductListCard component - number of bids display

  endTime: string; // Used in: ProductListCard component - countdown timer (ISO 8601, converted to Date)
  timeLeft: string; // Used in: ProductListCard component - formatted time remaining "1d 3h"
}
// Full RelatedProduct object spread to ProductListCard: Line 661 - <ProductListCard key={product.id} {...product} />

// ----------------------------------------------------------------------------
// User-Specific Status (if logged in)
// ----------------------------------------------------------------------------

export interface UserProductStatus {
  isWatchlisted: boolean; // Used in: Line 195 - useState initial value + Line 256 - Heart icon fill condition + Line 448 - Button text condition
  hasPlacedBid: boolean; // Used in: Additional UI logic (not currently displayed but useful for business logic)
  isOutbid: boolean; // Used in: Lines 313-323 - Conditional rendering of "You have been outbid!" Alert (if userOutbid && ...)
  currentUserMaxBid?: number; // Used in: Display user's current max bid in bid form or history
  isTopBidder: boolean; // Used in: Conditional styling or badge to show user is currently winning
}

// ============================================================================
// LAZY LOAD - SECONDARY DATA (Separate API Calls)
// ============================================================================

// ----------------------------------------------------------------------------
// Bid History (Load when user clicks "Bid History" tab)
// ----------------------------------------------------------------------------

/**
 * Endpoint: GET /products/:id/bid-history
 * hoặc: GET /auctions/:id/bids
 */
export interface BidHistoryResponse {
  bids: BidHistoryItem[];
  totalBids: number;
  // Pagination nếu có nhiều bids
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface BidHistoryItem {
  id: string; // Used in: React key prop when mapping bid items
  timestamp: string; // Used in: BidHistory component - timestamp display "Nov 26, 2025 14:23:15"
  bidder: string; // Used in: BidHistory component - bidder name display (Masked: "****Chen")
  amount: number; // Used in: BidHistory component - bid amount display
  isTopBid: boolean; // Used in: BidHistory component - conditional styling/badge for top bid (highlight or badge)
}
// Array used in: Line 588 - <BidHistory bids={bidHistoryData} /> - Passed to BidHistory component when "Bid History" tab is clicked

// ----------------------------------------------------------------------------
// Q&A Section (Load when user clicks "Q&A" tab)
// ----------------------------------------------------------------------------

/**
 * Endpoint: GET /products/:id/questions
 */
export interface QuestionsResponse {
  questions: QuestionItem[];
  totalQuestions: number;
  canAskQuestion: boolean; // User có thể hỏi không (phải login)
}

export interface QuestionItem {
  id: string; // Used in: Lines 612 + 619 - React key prop {qa.id} + AccordionItem value
  question: string; // Used in: Line 622 - Question text display <div className="text-sm pr-4">{qa.question}</div>
  answer: string | null; // Used in: Line 635 - Answer text display <p>{qa.answer}</p> (null nếu chưa có answer - conditional rendering)
  askedBy: string; // Used in: Line 624 - "Asked by {qa.askedBy}" display (Masked: "****Park")
  timestamp: string; // Used in: Line 624 - Display relative time "Asked by ... • {qa.timestamp}" ("2 days ago")
  answeredAt?: string; // Used in: Seller response timestamp display (optional, not shown in current UI)
}
// Array used in: Lines 487 - TabsTrigger text "Q&A ({qaData.length})" + Lines 612-637 - Map to Accordion items

// ----------------------------------------------------------------------------
// Ask Question (POST request)
// ----------------------------------------------------------------------------

/**
 * Endpoint: POST /products/:id/questions
 */
export interface AskQuestionRequest {
  question: string;
}

export interface AskQuestionResponse {
  success: boolean;
  question: QuestionItem;
  message: string; // "Your question has been submitted"
}

// ----------------------------------------------------------------------------
// Watchlist Actions
// ----------------------------------------------------------------------------

/**
 * Endpoint: POST /products/:id/watchlist (Add)
 * Endpoint: DELETE /products/:id/watchlist (Remove)
 */
export interface WatchlistActionResponse {
  success: boolean;
  isWatchlisted: boolean; // Current status after action
  totalWatchers: number; // Updated count
  message: string;
}

// ----------------------------------------------------------------------------
// Place Bid Action
// ----------------------------------------------------------------------------

/**
 * Endpoint: POST /products/:id/bids
 * hoặc: POST /auctions/:id/bids
 */
export interface PlaceBidRequest {
  maxBidAmount: number; // User's maximum bid
}

export interface PlaceBidResponse {
  success: boolean;
  bid: {
    id: string;
    amount: number;
    maxBidAmount: number; // User's max bid (hidden from others)
    timestamp: string;
    isTopBid: boolean;
  };
  auction: {
    currentPrice: number; // Updated current price
    minimumNextBid: number; // Updated minimum next bid
    totalBids: number; // Updated total bids
    topBidder: string; // Updated top bidder (masked)
  };
  message: string; // "Bid placed successfully!"
}

// Error response nếu bid không hợp lệ
export interface PlaceBidErrorResponse {
  success: false;
  error: {
    code: string; // "BID_TOO_LOW" | "AUCTION_ENDED" | "INSUFFICIENT_FUNDS"
    message: string;
    minimumRequired?: number;
  };
}

// ============================================================================
// EXAMPLE USAGE IN FRONTEND
// ============================================================================

/**
 * Example: Fetch product detail on page load
 * 
 * const response = await fetch(`/api/products/${slug}-${id}`);
 * const data: ProductDetailResponse = await response.json();
 * 
 * // Render all primary sections with data
 * - Breadcrumb: data.breadcrumb
 * - Images: data.product.images
 * - Title: data.product.title
 * - Category: data.product.category.name
 * - Seller: data.seller
 * - Auction info: data.auction
 * - Description: data.description
 * - Related products: data.relatedProducts
 * - User status: data.userStatus
 */

/**
 * Example: Load bid history when user clicks tab
 * 
 * const handleBidHistoryClick = async () => {
 *   const response = await fetch(`/api/products/${productId}/bid-history`);
 *   const data: BidHistoryResponse = await response.json();
 *   setBidHistory(data.bids);
 * };
 */

/**
 * Example: Load Q&A when user clicks tab
 * 
 * const handleQAClick = async () => {
 *   const response = await fetch(`/api/products/${productId}/questions`);
 *   const data: QuestionsResponse = await response.json();
 *   setQuestions(data.questions);
 * };
 */
