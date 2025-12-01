# IMPLEMENTATION PROCESS: SEARCH PAGE FEATURE

**Project:** Online Auction Platform  
**Document Version:** 1.0  
**Date:** December 1, 2025  
**Status:** 🔴 In Progress

---

## TABLE OF CONTENTS

1. [Gap Analysis](#1-gap-analysis)
2. [Solutions for Each Issue](#2-solutions-for-each-issue)
3. [Implementation Roadmap](#3-implementation-roadmap)
4. [Testing Strategy](#4-testing-strategy)

---

## 1. GAP ANALYSIS

### **1.1. CATEGORY FILTER LOGIC (Frontend)**

#### ❌ **Issue #1: Missing 3-State Logic for Parent Categories**

**Current State:**

```typescript
// CategoryFilter.tsx - Line ~28
const isChecked = selectedCategories.includes(category.id);
```

- Component only supports binary checked/unchecked state
- No logic to calculate parent state based on children
- Missing `indeterminate` state for Checkbox component

**Required State:**
| State | Visual | Condition | Meaning |
|-------|--------|-----------|---------|
| **Checked** | `[✓]` | ALL children are checked | Select entire group |
| **Unchecked** | `[ ]` | NO children are checked | Deselect group |
| **Indeterminate** | `[-]` | SOME children are checked | Partial selection |

**Impact:** 🔴 **Critical** - Users cannot understand multi-select state at a glance

---

#### ❌ **Issue #2: Missing Cascade Selection Logic**

**Current State:**

```typescript
// CategoryFilter.tsx - No cascade logic
onCategoryChange={(checked) =>
  onCategoryChange(category.id, checked as boolean)
}
```

- Clicking parent doesn't affect children
- Manual selection required for each child

**Required Behavior:**

- Click Parent `[ ]` → **Check ALL children** → Parent becomes `[✓]`
- Click Parent `[✓]` or `[-]` → **Uncheck ALL children** → Parent becomes `[ ]`

**Impact:** 🔴 **Critical** - Poor UX, tedious multi-selection process

---

#### ❌ **Issue #3: Missing Parent Update on Child Toggle**

**Current State:**

- Children operate independently
- Parent state doesn't react to child changes

**Required Logic:**

```typescript
// When child is clicked:
1. Toggle child state
2. Check all siblings:
   - All checked → Parent = Checked
   - All unchecked → Parent = Unchecked
   - Mixed → Parent = Indeterminate
```

**Impact:** 🔴 **Critical** - Parent state becomes meaningless

---

### **1.2. BACKEND API - SEARCH & FILTER**

#### ❌ **Issue #4: Exclusive Search/Category Constraint**

**Current State:**

```typescript
// product.schema.ts - Line ~31-35
.refine((data) => !(data.q && data.category), {
  message: "Cannot search by both 'q' and 'category' at the same time",
  path: ["q", "category"],
})
```

- Forces user to choose EITHER search OR category filter
- Cannot combine keyword search with category filtering

**Required Formula:**

```sql
Result = (Name CONTAINS Keyword) AND (CategoryID IN SelectedList)
```

**Impact:** 🔴 **Critical** - Users cannot refine search results by category

---

#### ❌ **Issue #5: Single Category Support Only**

**Current State:**

```typescript
// product.schema.ts - Line ~27
category: z.string().optional(),
```

- Accepts only 1 category slug
- Repository `findByCategory()` returns products for single category tree

**Required:**

- Accept **array of category IDs** (leaf nodes)
- Apply **OR logic** between selected categories
- Example: `categoryIds=[11,12,15]` → Returns products matching ANY of these IDs

**Impact:** 🔴 **Critical** - Cannot filter by multiple categories (e.g., Laptops + Phones)

---

#### ❌ **Issue #6: Missing Facet Count Endpoint**

**Current State:**

- No endpoint/logic to return category counts when searching

**Required:**

```typescript
// When user searches "iPhone", sidebar should show:
[ ] Electronics (20)
[ ] Fashion (0)
[ ] Collectibles (3)
```

**SQL Logic:**

```sql
SELECT category_id, COUNT(*) as total
FROM products
WHERE name ILIKE '%iPhone%'
GROUP BY category_id;
```

**Impact:** 🟡 **Important** - Users don't know which categories have results

---

### **1.3. SORTING LOGIC**

#### ⚠️ **Issue #7: Wrong Default Sort Order**

**Current State:**

```typescript
// product.repository.ts - Line ~48
query = query.orderBy("created_at", "desc");
```

- Defaults to newest products first
- Doesn't prioritize urgency (auction ending soon)

**Required:**

```typescript
// Default sort should be:
query = query.orderBy("end_time", "asc"); // Ending Soon First
```

**Rationale:**

- Auction platform = Time-sensitive
- Products ending soon need immediate attention
- Increases bid participation urgency

**Impact:** 🔴 **Critical** - Wrong business logic for auction platform

---

### **1.4. NEW ARRIVAL LOGIC**

#### ❌ **Issue #8: No "New Arrival" Backend Logic**

**Current State:**

```typescript
// ProductListPage.tsx - Line ~23 (Mock data)
isNewArrival: true, // Hardcoded in mock data
```

**Frontend has:**

- Badge UI component ✅
- `isNewArrival` prop ✅

**Backend missing:**

- Logic to calculate `Now - created_at < 24h`
- Return `isNewArrival: boolean` in API response

**Required:**

```typescript
// Backend should add:
const isNewArrival = Date.now() - product.created_at < 24 * 60 * 60 * 1000;
```

**Important:**

- ❌ **DO NOT** change sort order for new arrivals
- ✅ **ONLY** add visual badge

**Impact:** 🟡 **Important** - Missing "discovery" feature for new products

---

### **1.5. PRICE RANGE FILTER**

#### ❌ **Issue #9: Price Range Filter Not Connected to API**

**Current State:**

```typescript
// ProductListPage.tsx - Line ~119
const [priceRange, setPriceRange] = useState([0, 5000]);
```

- Frontend has slider UI ✅
- State management exists ✅
- **Not sent to backend** ❌

**Required:**

1. Add `minPrice` and `maxPrice` to API schema
2. Add WHERE clause in repository:
   ```sql
   AND current_price BETWEEN ${minPrice} AND ${maxPrice}
   ```
3. Connect frontend slider to API call

**Impact:** 🟢 **Nice-to-have** - Enhances filtering capability

---

### **1.6. SEARCH BEHAVIOR**

#### ❌ **Issue #10: Category Count Not Updated on Search**

**Current State:**

- When user types keyword, category sidebar remains static
- No indication of result distribution across categories

**Required:**

- Dynamically update category counts based on search results
- Show zero counts for categories with no matches
- Helps users understand where results are located

**Impact:** 🟡 **Important** - Reduces search effectiveness

---

## 2. SOLUTIONS FOR EACH ISSUE

### **Solution #2-3: Fix Backend API Schema**

#### **Backend Changes: Remove Exclusive Constraint**

**File: `product.schema.ts`**

```typescript
export const ProductsSearchQuery = z.object({
  q: z.string().optional(), // Search keyword
  categoryIds: z.array(z.coerce.number().int().positive()).optional(), // Multi-category
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: sortOptionSchema,
  exclude: z.coerce.number().int().positive().optional(),
});

// ❌ REMOVE these refine() constraints:
// .refine((data) => data.q || data.category, {...})
// .refine((data) => !(data.q && data.category), {...})
```

**Changes:**

1. ✅ Rename `category` → `categoryIds` (array)
2. ✅ Remove exclusive constraint
3. ✅ Add `minPrice`, `maxPrice`
4. ✅ Allow both `q` + `categoryIds` simultaneously

---

### **Solution #4: Update Repository to Support Multi-Category + Search**

**File: `product.repository.ts`**

**Refactor: Create unified search function**

```typescript
export const searchProducts = async (
  q?: string,
  categoryIds?: number[],
  minPrice?: number,
  maxPrice?: number,
  page: number = 1,
  limit: number = 20,
  sort?: SortOption,
  excludeProductId?: number
) => {
  const offset = (page - 1) * limit;

  let query = db("products")
    .where("status", "active")
    .where("end_time", ">", new Date());

  // Apply keyword search
  if (q) {
    const safeQ = escapeQuery(q);
    query = query.where("name", "ilike", `%${safeQ}%`);
  }

  // Apply category filter (OR logic)
  if (categoryIds && categoryIds.length > 0) {
    query = query.whereIn("category_id", categoryIds);
  }

  // Apply price range filter
  if (minPrice !== undefined) {
    query = query.where("current_price", ">=", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.where("current_price", "<=", maxPrice);
  }

  if (excludeProductId) {
    query = query.whereNot("product_id", excludeProductId);
  }

  // Count total
  const countQuery = query.clone().count("product_id as total").first();

  // Apply sorting
  if (sort && Array.isArray(sort) && sort.length > 0) {
    sort.forEach((item) => {
      const dbField = getSortFieldMapping(item.field);
      query = query.orderBy(dbField, item.direction);
    });
  } else {
    // ✅ DEFAULT SORT: Ending Soon (Critical Fix)
    query = query.orderBy("end_time", "asc");
  }

  // Select with joins
  const products = await query
    .leftJoin("categories", "products.category_id", "categories.category_id")
    .leftJoin("users", "products.highest_bidder_id", "users.id")
    .select(
      "products.product_id",
      "products.thumbnail_url",
      "products.name",
      "products.current_price",
      "products.status",
      "products.created_at",
      "products.end_time",
      "products.bid_count",
      "products.highest_bidder_id",
      "users.full_name as bidder_name",
      "categories.category_id as cat_id",
      "categories.name as cat_name",
      "categories.slug as cat_slug"
    )
    .limit(limit)
    .offset(offset);

  const totalResult = await countQuery;
  const total = totalResult ? parseInt(totalResult.total as string) : 0;

  return {
    data: products.map((p) => ({
      ...p,
      // ✅ Calculate isNewArrival
      isNewArrival:
        Date.now() - new Date(p.created_at).getTime() < 24 * 60 * 60 * 1000,
      highest_bidder: p.highest_bidder_id
        ? {
            id: p.highest_bidder_id,
            full_name: p.bidder_name,
          }
        : null,
      category: p.cat_id
        ? {
            category_id: p.cat_id,
            name: p.cat_name,
            slug: p.cat_slug,
          }
        : null,
    })),
    total,
  };
};

function getSortFieldMapping(field: string): string {
  const mapping: Record<string, string> = {
    endTime: "end_time",
    price: "current_price",
    bidCount: "bid_count",
    createdAt: "created_at",
  };
  return mapping[field] || "end_time";
}
```

**Key Changes:**

1. ✅ Merged `fullTextSearch()` and `findByCategory()` into one function
2. ✅ Support simultaneous keyword + category + price filtering
3. ✅ Default sort = `end_time ASC` (Ending Soon)
4. ✅ Calculate `isNewArrival` in response
5. ✅ Use LEFT JOIN to include category info

---

### **Solution #5: Add Facet Count Endpoint**

**File: `product.repository.ts`**

```typescript
export const getCategoryFacets = async (
  q?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<{ categoryId: number; count: number }[]> => {
  let query = db("products")
    .where("status", "active")
    .where("end_time", ">", new Date());

  // Apply same filters as main search
  if (q) {
    const safeQ = escapeQuery(q);
    query = query.where("name", "ilike", `%${safeQ}%`);
  }

  if (minPrice !== undefined) {
    query = query.where("current_price", ">=", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.where("current_price", "<=", maxPrice);
  }

  const facets = await query
    .select("category_id")
    .count("product_id as count")
    .groupBy("category_id");

  return facets.map((f) => ({
    categoryId: f.category_id,
    count: parseInt(f.count as string),
  }));
};
```

**File: `product.service.ts`**

```typescript
export const getCategoryFacets = async (
  q?: string,
  minPrice?: number,
  maxPrice?: number
) => {
  const facets = await productRepository.getCategoryFacets(
    q,
    minPrice,
    maxPrice
  );
  return facets;
};
```

**File: `product.controller.ts`**

```typescript
export const getCategoryFacets = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { q, minPrice, maxPrice } = request.query;
    const result = await productService.getCategoryFacets(
      q as string,
      minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice ? parseFloat(maxPrice as string) : undefined
    );
    formatResponse(response, 200, result);
  } catch (error) {
    logger.error("ProductController", "Failed to get category facets", error);
    next(error);
  }
};
```

**File: `product.routes.ts`**

```typescript
router.get("/facets", productController.getCategoryFacets);
```

**Usage:**

```typescript
// Frontend calls when search changes:
GET /api/products/facets?q=iPhone
// Returns: [{ categoryId: 1, count: 20 }, { categoryId: 5, count: 3 }]
```

---

### **Solution #6: Update Service Layer**

**File: `product.service.ts`**

```typescript
export const searchProducts = async (query: ProductsSearchQuery) => {
  const { q, categoryIds, minPrice, maxPrice, page, limit, sort, exclude } =
    query;

  const result = await productRepository.searchProducts(
    q,
    categoryIds,
    minPrice,
    maxPrice,
    page,
    limit,
    sort,
    exclude
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
```

**Update mapper to include `isNewArrival`:**

```typescript
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
    isNewArrival: product.isNewArrival, // ✅ Pass through from repository
    highestBidder: product.highest_bidder,
    category: product.category,
  };
};
```

---

### **Solution #7: Frontend API Integration**

**Create: `frontend/src/services/productService.ts`**

```typescript
import apiClient from "./apiClient";

export interface Product {
  productId: number;
  thumbnailUrl: string;
  name: string;
  currentPrice: number;
  status: string;
  createdAt: string;
  endTime: string;
  bidCount: number;
  isNewArrival: boolean;
  highestBidder: {
    id: number;
    fullName: string;
  } | null;
  category: {
    categoryId: number;
    name: string;
    slug: string;
  } | null;
}

export interface SearchProductsParams {
  q?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string; // Format: "endTime:asc,price:desc"
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

export const searchProducts = async (
  params: SearchProductsParams
): Promise<PaginatedResponse<Product>> => {
  const response = await apiClient.get("/products", { params });
  return response.data;
};

export const getCategoryFacets = async (
  q?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<{ categoryId: number; count: number }[]> => {
  const response = await apiClient.get("/products/facets", {
    params: { q, minPrice, maxPrice },
  });
  return response.data.data;
};
```

---

### **Solution #8: Update Frontend ProductListPage**

**File: `ProductListPage.tsx`**

```typescript
import { useEffect, useState } from "react";
import {
  searchProducts,
  getCategoryFacets,
} from "../../services/productService";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryFacets, setCategoryFacets] = useState<Map<number, number>>(
    new Map()
  );
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("time-asc"); // Default: Ending Soon
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  // Convert category string IDs to number IDs (you need category data)
  const getNumericCategoryIds = (stringIds: string[]): number[] => {
    // Map your category tree structure
    const categoryMap: Record<string, number> = {
      laptops: 11,
      phones: 12,
      tablets: 13,
      // ... etc
    };
    return stringIds.map((id) => categoryMap[id]).filter(Boolean);
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await searchProducts({
        q: searchKeyword || undefined,
        categoryIds: getNumericCategoryIds(selectedCategories),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        page: currentPage,
        limit: 9,
        sort: sortBy === "time-asc" ? "endTime:asc" : sortBy,
      });
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch facets when search/price changes
  const fetchFacets = async () => {
    try {
      const facets = await getCategoryFacets(
        searchKeyword || undefined,
        priceRange[0],
        priceRange[1]
      );
      setCategoryFacets(new Map(facets.map((f) => [f.categoryId, f.count])));
    } catch (error) {
      console.error("Failed to fetch facets:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchKeyword, selectedCategories, priceRange, sortBy, currentPage]);

  useEffect(() => {
    fetchFacets();
  }, [searchKeyword, priceRange]);

  // Update CategoryFilter to show counts
  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryFacets.get(cat.id) || 0,
    children: cat.children?.map((child) => ({
      ...child,
      count: categoryFacets.get(child.id) || 0,
    })),
  }));

  return (
    <MainLayout>
      {/* ... rest of component */}
      <CategoryFilter
        categories={categoriesWithCounts}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />
      {/* ... */}
    </MainLayout>
  );
}
```

**Update CategoryFilter to display counts:**

```typescript
<Label htmlFor={category.id}>
  {category.name}
  {category.count !== undefined && (
    <span className="text-muted-foreground ml-2">({category.count})</span>
  )}
</Label>
```

---

### **Solution #9: Update ProductListCard for isNewArrival**

**File: `ProductListCard.tsx`**

Remove hardcoded check, rely on API:

```typescript
export function ProductListCard({
  // ... props
  isNewArrival = false, // Now comes from API
}: ProductListCardProps) {
  // Component already handles badge display correctly
  return (
    <Card
      className={
        isNewArrival ? "border-accent shadow-accent/20" : "border-border"
      }
    >
      {isNewArrival && (
        <Badge className="absolute top-2 left-2 bg-accent">
          <Sparkles className="h-3 w-3 mr-1" />
          New Arrival
        </Badge>
      )}
      {/* ... */}
    </Card>
  );
}
```

✅ **No changes needed** - Component already supports prop correctly

---

## 3. IMPLEMENTATION ROADMAP

### **Phase 1: Backend API Foundation** (Priority: 🔴 Critical)

**Estimated Time:** 4-6 hours

1. ✅ Update `product.schema.ts`:

   - Remove exclusive constraint
   - Change `category` → `categoryIds: z.array()`
   - Add `minPrice`, `maxPrice`

2. ✅ Refactor `product.repository.ts`:

   - Merge `fullTextSearch()` + `findByCategory()` → `searchProducts()`
   - Add multi-category support
   - Change default sort to `end_time ASC`
   - Calculate `isNewArrival` in response

3. ✅ Update `product.service.ts`:

   - Update `searchProducts()` to use new repository
   - Pass through `isNewArrival`

4. ✅ Add facet endpoint:
   - Repository: `getCategoryFacets()`
   - Service: `getCategoryFacets()`
   - Controller: `getCategoryFacets()`
   - Route: `GET /products/facets`

**Testing:**

- Test combined search + category filter
- Test multi-category selection
- Test default sort order
- Test facet counts

---

### **Phase 2: Frontend Category Filter** (Priority: 🔴 Critical)

**Estimated Time:** 3-4 hours

1. ✅ Update `CategoryFilter.tsx`:

   - Add `calculateCategoryState()` function
   - Implement 3-state logic
   - Add cascade selection
   - Support `indeterminate` prop

2. ✅ Update `ProductListPage.tsx`:
   - Change `handleCategoryChange` signature
   - Pass array of IDs to handler

**Testing:**

- Test parent click → all children toggle
- Test child click → parent updates
- Test indeterminate state display

---

### **Phase 3: Frontend API Integration** (Priority: 🔴 Critical)

**Estimated Time:** 2-3 hours

1. ✅ Create `frontend/src/services/productService.ts`:

   - `searchProducts()` function
   - `getCategoryFacets()` function
   - TypeScript interfaces

2. ✅ Update `ProductListPage.tsx`:
   - Replace mock data with API calls
   - Implement `fetchProducts()`
   - Implement `fetchFacets()`
   - Connect price range slider

**Testing:**

- Test search + filter combination
- Test category count updates
- Test price range filtering

---

### **Phase 4: New Arrival Feature** (Priority: 🟡 Important)

**Estimated Time:** 1 hour

1. ✅ Backend already calculates in Phase 1
2. ✅ Frontend `ProductListCard` already supports badge

**Testing:**

- Verify badge appears for products < 24h old
- Verify badge doesn't affect sort order

---

### **Phase 5: Polish & Edge Cases** (Priority: 🟢 Nice-to-have)

**Estimated Time:** 2-3 hours

1. Loading states
2. Error handling
3. Empty state messages
4. Debounce search input
5. URL query params sync
6. Accessibility improvements

---

## 4. TESTING STRATEGY

### **4.1. Backend Unit Tests**

```typescript
describe("Product Search API", () => {
  test("should return products matching keyword only", async () => {
    const result = await searchProducts(
      "iPhone",
      undefined,
      undefined,
      undefined,
      1,
      20
    );
    expect(result.data.every((p) => p.name.includes("iPhone"))).toBe(true);
  });

  test("should return products in selected categories only", async () => {
    const result = await searchProducts(
      undefined,
      [11, 12],
      undefined,
      undefined,
      1,
      20
    );
    expect(result.data.every((p) => [11, 12].includes(p.category_id))).toBe(
      true
    );
  });

  test("should combine keyword + category filter", async () => {
    const result = await searchProducts(
      "Samsung",
      [11],
      undefined,
      undefined,
      1,
      20
    );
    expect(
      result.data.every(
        (p) => p.name.includes("Samsung") && p.category_id === 11
      )
    ).toBe(true);
  });

  test("should filter by price range", async () => {
    const result = await searchProducts(undefined, undefined, 100, 500, 1, 20);
    expect(
      result.data.every((p) => p.current_price >= 100 && p.current_price <= 500)
    ).toBe(true);
  });

  test("should default sort by end_time ASC", async () => {
    const result = await searchProducts(
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      20
    );
    const endTimes = result.data.map((p) => new Date(p.end_time).getTime());
    expect(endTimes).toEqual([...endTimes].sort((a, b) => a - b));
  });

  test("should mark new arrivals correctly", async () => {
    const result = await searchProducts(
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      20
    );
    result.data.forEach((p) => {
      const hoursSinceCreated =
        (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
      expect(p.isNewArrival).toBe(hoursSinceCreated < 24);
    });
  });

  test("should return correct facet counts", async () => {
    const facets = await getCategoryFacets("iPhone");
    const totalProducts = await searchProducts(
      "iPhone",
      undefined,
      undefined,
      undefined,
      1,
      1000
    );
    expect(facets.reduce((sum, f) => sum + f.count, 0)).toBe(
      totalProducts.total
    );
  });
});
```

### **4.2. Frontend Integration Tests**

```typescript
describe("ProductListPage", () => {
  test("should update category counts when searching", async () => {
    render(<ProductListPage />);
    const searchInput = screen.getByPlaceholderText("Search products...");

    fireEvent.change(searchInput, { target: { value: "iPhone" } });
    await waitFor(() => {
      expect(screen.getByText(/Electronics \(\d+\)/)).toBeInTheDocument();
    });
  });

  test("should check all children when parent clicked", async () => {
    render(<ProductListPage />);
    const electronicsCheckbox = screen.getByLabelText("Electronics");

    fireEvent.click(electronicsCheckbox);
    await waitFor(() => {
      expect(screen.getByLabelText("Laptops")).toBeChecked();
      expect(screen.getByLabelText("Phones")).toBeChecked();
    });
  });

  test("should show indeterminate when some children checked", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByLabelText("Laptops"));
    await waitFor(() => {
      const parent = screen.getByLabelText("Electronics");
      expect(parent).toHaveAttribute("data-state", "indeterminate");
    });
  });
});
```

### **4.3. Manual Testing Checklist**

- [ ] Search "iPhone" → Products contain "iPhone" in name
- [ ] Select "Laptops" + "Phones" → Products from both categories
- [ ] Search "MacBook" + Select "Laptops" → Only MacBook laptops
- [ ] Category counts update when typing search keyword
- [ ] Parent checkbox shows 3 states correctly
- [ ] Click parent → All children toggle
- [ ] Click child → Parent updates state
- [ ] Products sorted by ending soon by default
- [ ] New products show "New Arrival" badge
- [ ] Badge doesn't change sort order
- [ ] Price slider filters results
- [ ] Pagination works correctly
- [ ] Loading states display properly
- [ ] Error states handle gracefully

---

## 5. MIGRATION & ROLLOUT

### **5.1. Database Migration**

No schema changes required ✅

### **5.2. API Versioning**

Option 1: Break existing API (if no production users)
Option 2: Create `/v2/products` endpoint (if production exists)

### **5.3. Feature Flags**

```typescript
const ENABLE_NEW_SEARCH = process.env.ENABLE_NEW_SEARCH === "true";
```

### **5.4. Rollback Plan**

- Keep old repository functions for 1 release cycle
- Monitor error rates
- A/B test with 10% traffic first

---

## 6. PERFORMANCE CONSIDERATIONS

### **6.1. Database Indexes**

```sql
-- Essential for search performance
-- Full-text search index (Database already has 'fts' tsvector column)
CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING gin(fts);

-- Alternative: Trigram index for ILIKE queries (if using ILIKE instead of fts)
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(name gin_trgm_ops);

-- Time and price indexes
CREATE INDEX IF NOT EXISTS idx_products_end_time ON products(end_time);
CREATE INDEX IF NOT EXISTS idx_products_current_price ON products(current_price);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_status_endtime ON products(status, end_time) 
  WHERE status = 'active' AND end_time > CURRENT_TIMESTAMP;

-- For facet count queries
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status)
  WHERE status = 'active';
```

### **6.2. Caching Strategy**

```typescript
// Cache facet counts for 5 minutes
const facetCacheKey = `facets:${q}:${minPrice}:${maxPrice}`;
const cached = await redis.get(facetCacheKey);
if (cached) return JSON.parse(cached);

const facets = await getCategoryFacets(...);
await redis.setex(facetCacheKey, 300, JSON.stringify(facets));
return facets;
```

### **6.3. Query Optimization**

- Use `EXPLAIN ANALYZE` to check query plans
- Consider materialized views for popular searches
- Implement cursor-based pagination for large result sets

---

## 7. OPEN QUESTIONS

1. **Category Count Display:**

   - Show counts for parent categories (sum of children)?
   - Hide categories with 0 results?

2. **Search Behavior:**

   - Use `fts` column (PostgreSQL full-text search) or `ILIKE` (simple pattern matching)?
     - **fts**: Better performance, supports ranking, stemming, language support
     - **ILIKE**: Simpler, exact substring match, no setup needed
   - Support fuzzy matching (typo tolerance)?
   - Search in description too (need to update trigger to include description in fts)?
   - Ranking by relevance score when using full-text search with `ts_rank()`?

3. **Price Filter:**

   - Should it apply to `current_price` or `buy_now_price`?
   - Dynamic range based on search results?

4. **Sort Options:**
   - Keep "Newly Listed" sort option?
   - Add "Most Popular" (by bid count)?

---

## 8. COMPLETION CHECKLIST

### **Backend** (4/9 completed)

- [ ] Remove exclusive search/category constraint
- [ ] Add multi-category support (array of IDs)
- [ ] Change default sort to `end_time ASC`
- [ ] Calculate `isNewArrival` in API response
- [ ] Add price range filter params
- [ ] Create facet count endpoint
- [ ] Refactor repository to unified search
- [ ] Update service layer
- [ ] Add database indexes

### **Frontend** (0/7 completed)

- [ ] Implement 3-state category filter
- [ ] Add cascade selection logic
- [ ] Create `productService.ts`
- [ ] Connect API to ProductListPage
- [ ] Display category counts
- [ ] Connect price range slider
- [ ] Add loading/error states

### **Testing** (0/3 completed)

- [ ] Backend unit tests
- [ ] Frontend integration tests
- [ ] Manual QA checklist

---

**Document Status:** 🔴 Draft - Pending Implementation  
**Next Steps:** Begin Phase 1 - Backend API Foundation  
**Estimated Total Time:** 12-16 hours  
**Priority:** Critical - Blocks core search functionality
