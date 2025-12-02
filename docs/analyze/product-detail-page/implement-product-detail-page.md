1. Hiện tại thì frontend đang hiển thị URL cho một Product Detail Page là /products/{id}. Ví dụ: http://localhost:5173/products/1

## Expected Output

Thay vì dùng request params là "id" không tốt cho SEO và UX thì URL hiển thị cho users xem Product Detail là /products/{slug}-{id}

## Instructions and Constraints

### Notes

- Đã tạo "slug" trong table products + tạo trigger auto_generate_slug() khi insert/update trên products table + update sinh slug trên các product cũ.

### Instructions and constraints

- Backend cần thêm slug vào response object của search products API (GET /products?q=...categorySlug=....)
- Frontend khi fetch thành công data từ api thì phải dùng thẻ <Link> hoặc useNavigate trỏ tới /products/${slug}-${id} khi click vào card (nhấn mạnh là cả cái card chứ chứ không phải mỗi placeBid).

2. Cần chỉnh các data hiển thị UI thành các data được fetch từ Backend API tương ứng. Nhưng mà cái gì trên màn hình người dùng thấy đầu tiên thì fetch 1 lần, những cái gì người dùng cần nhấn nút để xem tiếp thì fetch sang API khác

## Analyze

### Danh sách các phần mà user sẽ thấy trước (Initial Load - Primary Data)

1. **Breadcrumb Navigation** - Hiển thị đường dẫn: Home > Electronics > Cameras > Vintage Leica M6
2. **Product Images Gallery** - Gallery ảnh sản phẩm (4 ảnh)
3. **Product Title** - Tên sản phẩm: "Vintage Leica M6 Camera with 50mm f/2 Lens"
4. **Category Badge** - Badge danh mục: "Cameras & Photography"
5. **Time Left** - Thời gian còn lại của auction: "2h 15m"
6. **Watchlist Button** - Nút thêm/xóa khỏi watchlist (icon Heart)
7. **Seller Information**
   - Avatar của seller
   - Tên seller (masked): "\*\*\*\*Smith"
   - Rating: Star rating + số reviews (248 reviews)
   - Positive percentage badge: "98% Positive"
8. **Current Bidding Information**
   - Current Price: $1,350
   - Number of Watchers: (có icon Users)
   - Total Bids: 28
   - Starting Price: $1,000
   - Bid Increment: $50
9. **Proxy Bidding Info Box** - Thông tin về cơ chế proxy bidding
10. **Bid Input Form**
    - Input field cho maximum bid
    - "Place Bid" button
    - Minimum bid requirement text
11. **Trust Badges** - Verified Seller, Buyer Protection, Trending Auction
12. **Default Tab Content (Description)**
    - Product description text
    - Condition details (danh sách)
    - What's Included (danh sách)
    - Seller Updates (2 updates with timestamps)
13. **Related Products Section** - 5 sản phẩm tương tự ở cuối trang

### Danh sách các phần mà user cần tương tác (ấn nút, ...) để thấy (Lazy Load - Secondary Data)

1. **Bid History Tab** - Cần click tab "Bid History" để xem
   - Danh sách các bid đã đặt (6 bids)
   - Thông tin: timestamp, bidder (masked), amount, top bid indicator
2. **Q&A Tab** - Cần click tab "Q&A" để xem
   - Danh sách câu hỏi và trả lời (4 Q&As)
   - Accordion items với question, answer, askedBy, timestamp
   - "Ask a Question" button
3. **Additional Product Images** - Các ảnh trong gallery cần click/swipe để xem (nếu không hiển thị hết)
4. **Watchlist Action** - Kết quả khi click Heart button (add/remove watchlist)
5. **Place Bid Action** - Kết quả khi submit bid form
   - Success alert
   - Outbid alert (nếu bị outbid)

### Danh sách các API Backend handle việc call API từ frontend dựa theo danh sách hiển thị trên

#### API return các phần mà user sẽ thấy trước (Initial Load - Primary Data)

**Endpoint:** `GET /products/:id`

**Response Type:** `ProductDetailResponse`

```typescript
export interface ProductDetailResponse {
  product: ProductInfo; // Line 237-281: Product images, title, category badge
  breadcrumb: BreadcrumbItem[]; // Lines 203-229: Breadcrumb navigation
  seller: SellerInfo; // Lines 282-310: Seller avatar, name, rating, reviews
  auction: AuctionInfo; // Lines 267, 352-439: Time left, price, bids, watchers, stats
  description: ProductDescription; // Lines 495-567: Description tab content
  relatedProducts: RelatedProduct[]; // Lines 648-663: Related products section at bottom
  userStatus?: UserProductStatus; // Lines 195, 256, 313-323, 448: Watchlist, outbid alert states
}

export interface ProductInfo {
  id: number; // Used in: API calls for lazy loading (bid history, Q&A)
  slug: string; // Used in: URL generation /products/{slug}-{id}
  title: string; // Used in: Line 250 - <h1> + Line 229 - Breadcrumb last item
  images: string[]; // Used in: Line 237 - <ImageGallery images={...} />
  category: {
    id: string; // Used in: Category filtering/navigation
    name: string; // Used in: Line 263 - <Badge>Cameras & Photography</Badge>
    slug: string; // Used in: Breadcrumb category links + Related products API call
    parent?: {
      // Used in: Frontend breadcrumb traversal (child → parent)
      id: string;
      name: string;
      slug: string;
      parent?: any; // Recursive for multi-level categories
    };
  };
  badges: {
    isVerifiedSeller: boolean; // Used in: Lines 462-467 - "Verified Seller" badge (NOT implemented - return false)
    hasBuyerProtection: boolean; // Used in: Lines 468-473 - "Buyer Protection" badge (NOT implemented - return false)
    isTrending: boolean; // Used in: Lines 474-477 - "Trending Auction" badge (NOT implemented - return false)
  };
}

export interface BreadcrumbItem {
  label: string; // Used in: Lines 203-229 - Breadcrumb text (Home, Electronics, Cameras, Product Name)
  path?: string; // Used in: Lines 206, 213, 220 - <a href> navigation (undefined for current page)
  slug?: string; // Used in: Category link generation
}

export interface SellerInfo {
  id: string; // Used in: Seller profile links/navigation
  displayName: string; // Used in: Line 286 - <span>****Smith</span> (masked name)
  avatar: string; // Used in: Line 282 - <AvatarImage src={...} /> or dicebear seed
  rating: {
    average: number; // Used in: Lines 289-295 - Star rating display (0-5 scale, render stars)
    totalReviews: number; // Used in: Line 297 - <span>(248 reviews)</span>
    positivePercentage: number; // Used in: Line 302 - <Badge>98% Positive</Badge>
  };
}

export interface AuctionInfo {
  currentPrice: number; // Used in: Line 352 - <CardTitle>${1,350}</CardTitle> + Line 400 - bid validation
  startingPrice: number; // Used in: Line 432 - Quick Stats "Starting Price: $1,000"
  bidIncrement: number; // Used in: Line 439 - Quick Stats "Bid Increment: $50"
  minimumNextBid: number; // Used in: Line 414 - "Minimum bid: $1,400" + input validation
  totalBids: number; // Used in: Line 425 - Quick Stats "Total Bids: 28"
  totalWatchers: number; // Used in: Line 365 - Watchers count <span>47</span>
  topBidder: string; // Used in: NOT displayed in current UI (only in bid history)
  endTime: string; // Used in: Frontend countdown timer calculation (ISO 8601 format)
  timeLeftFormatted: string; // Used in: NOT USED - Frontend calculates from endTime
  status: "active" | "ended" | "cancelled"; // Used in: Conditional rendering (disable bid if ended/cancelled)
  proxyBiddingEnabled: boolean; // Used in: Lines 370-381 - Display "Proxy Bidding Active" info box (always true)
}

export interface ProductDescription {
  overview: string; // Used in: Lines 495-501 - Main description paragraph <p>{overview}</p>
  condition: {
    // NOT USED - UI design issue, return empty or omit
    title: string;
    items: string[];
  };
  included: {
    // NOT USED - UI design issue, return empty or omit
    title: string;
    items: string[];
  };
  updates: SellerUpdate[]; // NOT implemented - return [] (Lines 533-567 show hardcoded updates)
}

export interface SellerUpdate {
  id: string; // Used in: React key prop
  type: "info" | "success" | "warning"; // Used in: Lines 538, 555 - Icon/color (Info vs CheckCircle2, bg-accent/20 vs bg-success/20)
  title: string; // Used in: Lines 543, 560 - <div>{title}</div>
  message: string; // Used in: Lines 545-547, 562-565 - Message text
  timestamp: string; // Used in: ISO format for backend operations
  timestampFormatted: string; // Used in: Lines 545-547, 562-565 - "Nov 25, 2025 10:30 AM - {message}"
}

export interface RelatedProduct {
  id: string; // Used in: Line 661 - React key prop
  slug: string; // Used in: Navigation link /products/{slug}-{id}
  title: string; // Used in: ProductListCard - product title
  image: string; // Used in: ProductListCard - product image
  currentBid: number; // Used in: ProductListCard - current bid display
  topBidder: string; // Used in: ProductListCard - top bidder display (masked)
  bidCount: number; // Used in: ProductListCard - number of bids
  endTime: string; // Used in: ProductListCard - countdown timer (ISO 8601)
  timeLeft: string; // Used in: ProductListCard - formatted time "1d 3h"
}
// Line 661: <ProductListCard key={product.id} {...product} /> - All fields spread to component

export interface UserProductStatus {
  isWatchlisted: boolean; // Used in: Line 195 - useState initial + Line 256 - Heart icon fill + Line 448 - Button text
  hasPlacedBid: boolean; // Used in: Business logic (not displayed but useful for validation)
  isOutbid: boolean; // Used in: Lines 313-323 - Conditional render "You have been outbid!" Alert
  currentUserMaxBid?: number; // Used in: Display user's max bid in form (optional feature)
  isTopBidder: boolean; // Used in: Conditional styling/badge to highlight user is winning
}
```

#### Các APIs return các phần mà user cần tương tác (ấn nút, ...) để thấy (Lazy Load - Secondary Data)

##### 1. Bid History

**Endpoint:** `GET /products/:id/bid-history`

**Response Type:** `BidHistoryResponse`

```typescript
export interface BidHistoryResponse {
  bids: BidHistoryItem[]; // Used in: Line 588 - <BidHistory bids={bidHistoryData} />
  totalBids: number; // Used in: Display total count or validation
  pagination?: {
    // Used in: Pagination controls (optional, not in current UI)
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface BidHistoryItem {
  id: string; // Used in: React key prop when mapping
  timestamp: string; // Used in: BidHistory component - display "Nov 26, 2025 14:23:15"
  bidder: string; // Used in: BidHistory component - bidder name (masked "****Chen")
  amount: number; // Used in: BidHistory component - bid amount display
  isTopBid: boolean; // Used in: BidHistory component - conditional styling/badge for highest bid
}
```

##### 2. Q&A Section

**Endpoint:** `GET /products/:id/questions`

**Response Type:** `QuestionsResponse`

```typescript
export interface QuestionsResponse {
  questions: QuestionItem[]; // Used in: Lines 612-637 - Map to Accordion items
  totalQuestions: number; // Used in: Line 487 - TabsTrigger "Q&A ({totalQuestions})"
  canAskQuestion: boolean; // Used in: Conditional display of "Ask a Question" button (user must be logged in)
}

export interface QuestionItem {
  id: string; // Used in: Lines 612, 619 - React key + AccordionItem value
  question: string; // Used in: Line 622 - Question text <div>{question}</div>
  answer: string | null; // Used in: Line 635 - Answer text <p>{answer}</p> (null = no answer yet)
  askedBy: string; // Used in: Line 624 - "Asked by {askedBy}" (masked name "****Park")
  timestamp: string; // Used in: Line 624 - Relative time "Asked by ... • {timestamp}" ("2 days ago")
  answeredAt?: string; // Used in: Optional seller response timestamp (not shown in current UI)
}
```

##### 3. Ask Question

**Endpoint:** `POST /products/:id/questions`

**Request Type:** `AskQuestionRequest`

**Response Type:** `AskQuestionResponse`

```typescript
export interface AskQuestionRequest {
  question: string; // Used in: Input field value from "Ask a Question" form
}

export interface AskQuestionResponse {
  success: boolean; // Used in: Success/error handling
  question: QuestionItem; // Used in: Add new question to list optimistically
  message: string; // Used in: Toast/alert message display
}
```

**Note:** NOT implemented in this phase

##### 4. Watchlist Actions

**Endpoint:** `POST /products/:id/watchlist` (Add) hoặc `DELETE /products/:id/watchlist` (Remove)

**Response Type:** `WatchlistActionResponse`

```typescript
export interface WatchlistActionResponse {
  success: boolean; // Used in: Success/error handling
  isWatchlisted: boolean; // Used in: Update heart icon state (filled/unfilled)
  totalWatchers: number; // Used in: Line 365 - Update watchers count display
  message: string; // Used in: Toast/alert message
}
```

**Note:** NOT implemented in this phase

##### 5. Place Bid

**Endpoint:** `POST /products/:id/bids`

**Request Type:** `PlaceBidRequest`

**Response Type:** `PlaceBidResponse` hoặc `PlaceBidErrorResponse`

```typescript
export interface PlaceBidRequest {
  maxBidAmount: number; // Used in: Line 193 - maxBid state value from input field
}

export interface PlaceBidResponse {
  success: boolean; // Used in: Show success alert
  bid: {
    id: string; // Used in: Tracking/logging
    amount: number; // Used in: Display current bid amount
    maxBidAmount: number; // Used in: User's max bid (hidden from others)
    timestamp: string; // Used in: Display when bid was placed
    isTopBid: boolean; // Used in: Show if user is winning
  };
  auction: {
    // Used in: Update auction info after bid
    currentPrice: number; // Used in: Line 352 - Update displayed current price
    minimumNextBid: number; // Used in: Line 414 - Update minimum bid requirement
    totalBids: number; // Used in: Line 425 - Update total bids count
    topBidder: string; // Used in: Update top bidder display (masked)
  };
  message: string; // Used in: Lines 326-333 - Success alert message
}

export interface PlaceBidErrorResponse {
  success: false; // Used in: Error handling
  error: {
    code: string; // Used in: Error type identification (BID_TOO_LOW, AUCTION_ENDED, etc.)
    message: string; // Used in: Display error message to user
    minimumRequired?: number; // Used in: Show required minimum bid amount
  };
}
```

**Note:** NOT implemented in this phase

````

### Instructions

## Backend

### Files to create/modify:

- `/backend/src/types/product-detail.types.ts` - Tạo file mới chứa tất cả interfaces cho Product Detail
- `/backend/src/api/schemas/product.schema.ts` - Update/thêm Zod schemas
- `/backend/src/services/product.service.ts` - Thêm method `getProductDetail(productId, userId?)`
- `/backend/src/repositories/product.repository.ts` - Thêm queries cần thiết
- `/backend/src/api/controllers/product.controller.ts` - Thêm controller cho GET /products/:id
- `/backend/src/api/routes/product.routes.ts` - Đảm bảo route đã có

### Implementation Details:

1. **API Endpoint:**

   - Backend nhận: `GET /products/:id` (chỉ nhận ID, không nhận slug)
   - Frontend gọi: `GET /products/1` (parse từ URL `/products/slug-1`)
   - Slug chỉ dùng cho SEO/UX ở frontend

2. **Database Mapping:**

   - `product_comments` = Q&A feature
   - `watchlist` table đã tồn tại
   - `product_descriptions.content` = `description.overview`
   - `reviews` table dùng cho seller rating (từ `users` table)

3. **Business Logic:**

   **Breadcrumb Generation:**

   - Category tree: Product thuộc 1 category child, traverse lên parent
   - Use recursive query hoặc multiple queries để build breadcrumb
   - Frontend cần `category` có structure với `parent` field
   - Format: Home > Parent Category > Child Category > Product Name

   **Seller Rating Calculation:**

   - `average` (0-5 scale) = `(positive_reviews / (positive_reviews + negative_reviews)) * 5`
   - `totalReviews` = `positive_reviews + negative_reviews`
   - `positivePercentage` = `(positive_reviews / totalReviews) * 100`
   - Source: `users.positive_reviews` và `users.negative_reviews`

   **User Status Logic:**

   - `isWatchlisted`: Check exists in `watchlist` table
   - `isOutbid`: User có bid (trong `auto_bids` hoặc `bids`) NHƯNG `products.highest_bidder_id` != userId
   - `isTopBidder`: `products.highest_bidder_id` == userId
   - `hasPlacedBid`: User có record trong `bids` hoặc `auto_bids`

   **Bidder Name Masking:**

   - Pattern: Lấy 4-5 ký tự cuối của `full_name` + prefix `****`
   - Example: "John Chen" → "\*\*\*\*Chen"

   **Timestamps:**

   - DB format: `2025-12-01 05:29:09.034273`
   - Return ISO 8601: `2025-12-01T05:29:09.034Z`
   - Frontend sẽ format thành "Nov 26, 2025 14:23:15" hoặc "2 days ago"

   **Auction Info:**

   - `proxyBiddingEnabled`: Always `true` (system-wide feature)
   - `minimumNextBid` = `current_price + step_price`
   - `status`: Map từ `products.status` enum

4. **Product Description:**

   - Chỉ lấy `content` từ `product_descriptions` (version mới nhất)
   - Map vào `description.overview`
   - `condition` và `included`: Return empty objects hoặc bỏ qua (UI design issue)
   - `updates`: Return empty array `[]` (feature chưa implement)

5. **Q&A (Product Comments) Mapping:**

   - Questions: Comments với `parent_id = NULL`
   - Answers: Comments với `parent_id != NULL` (reply to question)
   - Chỉ lấy reply đầu tiên per question
   - `askedBy`: `users.full_name` của comment gốc (masked)
   - `answeredAt`: `created_at` của reply đầu tiên

6. **Related Products:**

   - Dùng existing search API với params:
     - `categorySlugs`: Category của product hiện tại
     - `excludeProductIds`: `[productId]` của product hiện tại
   - Limit: 5 products
   - Sort: Có thể dùng default hoặc ending soon
   - "Ensure modifying Search API does not break existing search functionality on the Home/Product List page."

7. **Repository Query Strategy:**

   - Ưu tiên dùng Knex query builder
   - Chỉ dùng `db.raw()` khi Knex không support (ví dụ: recursive CTE cho breadcrumb)
   - Join strategy cho complex queries với multiple tables

8. **Service Method Signature:**

   ```typescript
   async getProductDetail(
     productId: number,
     userId?: number
   ): Promise<ProductDetailResponse>
````

9. **Authentication:**

   - GET product detail: Optional auth (userStatus chỉ return nếu logged in)
   - Lazy load APIs: Xem requirements riêng từng API
   - If `userId` exists: Calculate `userStatus`.
   - If `userId` is missing (Guest): `userStatus` fields should be false/null.

10. **Features NOT implemented in this phase:**
    - ❌ `product.badges`: Return all `false` hoặc omit
    - ❌ `description.condition` & `included`: Return empty hoặc omit
    - ❌ `description.updates`: Return `[]`
    - ❌ Place Bid action
    - ❌ Watchlist action
    - ❌ Ask Question action

## Frontend

### Files to create/modify:

- `/frontend/src/types/product-detail.ts` - Tạo file mới chứa interfaces (copy từ backend)
- `/frontend/src/services/productService.ts` - Thêm method `getProductDetail(productId)`
- `/frontend/src/pages/Product/ProductDetailPage.tsx` - Update để fetch real data

### Implementation Details:

1. **URL Handling:**

   - Route: `/products/:slugAndId` (ví dụ: `/products/vintage-camera-123`)
   - Parse: Extract ID từ cuối URL sau dấu `-` cuối cùng
   - Call API: `GET /products/123` (chỉ gửi ID)

2. **Data Fetching Strategy:**

   - Initial load: `useEffect` on mount → fetch `ProductDetailResponse`
   - Parse response thành các state objects:
     - `productImages` = `product.images`
     - `bidHistoryData` = Lazy load từ separate API
     - `qaData` = Lazy load từ separate API
     - `relatedProducts` = `relatedProducts` từ response

3. **Category Structure:**

   - `category` có field `parent?: CategoryNode`
   - Frontend traverse từ child lên parent để build breadcrumb
   - Reference: `frontend/src/types/category.ts` cho `CategoryNode` structure

4. **Time Formatting:**

   - Backend trả ISO 8601
   - Frontend format thành:
     - Bid History: "Nov 26, 2025 14:23:15"
     - Q&A: "2 days ago" (relative)
     - Countdown: "2h 15m" (calculated from `endTime`)

5. **Seller Rating Display:**

   - Backend trả `average` (0-5)
   - Render 5 stars, fill dựa trên `average`
   - Display `totalReviews` và `positivePercentage`

6. **Service Pattern:**

   ```typescript
   export const getProductDetail = async (
     productId: string
   ): Promise<ProductDetailResponse> => {
     return apiClient.get(`/products/${productId}`);
   };
   ```

7. **Error Handling:**

   - Giữ nguyên pattern hiện tại
   - No special error handling, no caching

8. **Related Products API Call:**
   - Use existing `searchProducts` service
   - Params:
     - `categorySlugs`: Category slug của product hiện tại
     - `excludeProductIds`: `[productId]` (UPDATE: backend cần support param này)
   - Limit: 5

### Notes for Backend API Update:

- Search Products API cần thêm param: `excludeProductIds?: number[]`
- Current có: `excludeCategorySlugs` nhưng cần `excludeProductIds` cho related products
