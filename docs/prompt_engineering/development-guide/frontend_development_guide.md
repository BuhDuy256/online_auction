# Frontend Development Guide

## Step-by-Step Feature Development Process

To develop a new feature in the frontend, follow these steps in order:

1.  **Types (Definition Layer)**

    - Create or update type definitions in `src/types/`.
    - Define interfaces for API responses and data models.
    - **Naming**: Use `PascalCase` for interfaces and types (e.g., `User`, `LoginResponse`).

2.  **Service (Data Layer)**

    - Write functions in **Service** (`src/services/`) to interact with the backend API.
    - Use `apiClient` for HTTP requests.
    - **Input**: Function parameters.
    - **Output**: Return typed promises (e.g., `Promise<MyResponse>`).

3.  **Component/Page (UI Layer)**

    - Create **Pages** in `src/pages/` for full views.
    - Create **Components** in `src/components/` for reusable UI parts.
    - **Logic**: Use hooks (`useEffect`, `useState`) or Context to call Services.
    - **Styling**: Use Tailwind CSS utility classes.

4.  **Route (Navigation Layer)**
    - Register new pages in `src/routes/AppRouter.tsx`.
    - Wrap with appropriate Route Guards (`ProtectedRoute`, `PublicOnlyRoute`).

---

## Detailed Rules

### 1. Project Structure

```
frontend/src/
├── components/         # Reusable UI components
│   ├── ui/             # Base UI elements (Button, Input, etc.)
│   └── common/         # App-specific common components (Header, Footer)
├── constants/          # App constants (roles, themes)
├── contexts/           # React Contexts (Auth, Theme)
├── hooks/              # Custom React Hooks
├── layouts/            # Page layouts
├── pages/              # Full page components
├── routes/             # Routing configuration
├── services/           # API integration
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

### 2. Type Definitions

Define clear interfaces for your data. Avoid `any`.

```typescript
// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductResponse {
  data: Product[];
  message?: string;
}
```

### 3. Service Layer

Encapsulate API calls in service files.

```typescript
// src/services/productService.ts
import apiClient from "./apiClient";
import type { ProductResponse } from "../types/product";

export const getProducts = async (): Promise<ProductResponse> => {
  return apiClient.get("/products");
};

export const createProduct = async (data: { name: string; price: number }) => {
  return apiClient.post("/products", data, true); // true = requires auth
};
```

### 4. Component Implementation

Use functional components with hooks.

```tsx
// src/pages/ProductPage.tsx
import { useEffect, useState } from "react";
import * as productService from "../services/productService";
import type { Product } from "../types/product";
import { Button } from "../components/ui/button";

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{product.name}</h2>
            <p>${product.price}</p>
            <Button variant="default">Buy Now</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
```

### 5. Routing

Register your page in `AppRouter.tsx`.

```tsx
// src/routes/AppRouter.tsx
import ProductPage from "../pages/ProductPage";

// ... inside Routes
<Route path="/products" element={<ProductPage />} />;
```

### 6. Styling

Use **Tailwind CSS** for all styling. Avoid creating new `.css` files unless absolutely necessary (e.g., for complex animations not supported by Tailwind).

- **Colors**: Use theme variables (e.g., `bg-background`, `text-foreground`, `border-border`) to support dark mode.
- **Spacing**: Use standard Tailwind spacing (e.g., `p-4`, `m-2`, `gap-4`).

### 7. UI Components

Use the components in `src/components/ui/` whenever possible. These are styled consistently with the design system.

- `Button`
- `Input`
- `Card`
- `Label`
- ...and more.

### 8. Naming Conventions

- **Files**: `PascalCase.tsx` for components (e.g., `UserProfile.tsx`), `camelCase.ts` for logic/services (e.g., `authService.ts`).
  - _Exception_: Base UI components in `components/ui` use `kebab-case` (e.g., `button.tsx`, `input-otp.tsx`).
- **Components**: `PascalCase` (e.g., `function UserProfile() {}`).
- **Functions/Variables**: `camelCase` (e.g., `const isLoading = true;`).
- **Interfaces**: `PascalCase` (e.g., `interface UserData {}`).

### 9. State Management

- Use **React Context** for global state (Auth, Theme).
- Use **Local State** (`useState`) for component-specific data.
- Use **React Query** (optional, if added) for server state caching.

### 10. Error Handling

- Catch errors in Services or Components.
- Use `toast` from `react-hot-toast` (or `react-toastify`) to show user-friendly error messages.
- Log technical errors to console for debugging.

## 11. Special Workflow: From Mock Data to Real API

When developing UI before the Backend is ready, or when integrating Backend into existing "Mocked" UI:

### Step 1: Define UI with Mock Data

- Create the component using hardcoded variables (e.g., `const mockProducts = [...]`).
- **Constraint:** Do not worry about API logic yet. Focus on UX/UI.

### Step 2: Extract Interface (The Contract)

- Once UI is approved, hover over the mock data variable to inspect its shape.
- Create a strict Interface in `src/types/` that matches this mock data (e.g., `ProductViewModel`).
- **Rule:** This Interface is the "Requirement" for the Backend.

### Step 3: Service Integration

- Create the Service function in `src/services/`.
- **CRITICAL:** The Service must return `Promise<ProductViewModel>`.
- If the Backend API response (DTO) differs from the `ProductViewModel`:
  - **Option A (Preferred):** Ask Backend to update their response (Reference Backend Guide).
  - **Option B (Frontend Adapter):** Create a generic mapping function inside the Service to transform `BackendDTO` -> `ProductViewModel`.

### Step 4: Swap & Cleanup

- In the Component, replace `mockData` with the data from the `useFetch` hook (or `useEffect`).
- **Verification:** The UI must not flicker or break.
- **Cleanup:** Delete the mock data variable/file.