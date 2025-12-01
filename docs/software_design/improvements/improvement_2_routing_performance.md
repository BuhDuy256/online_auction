# Improvement 2: Routing & Performance

## 1. Lazy Loading (Code Splitting)

**Problem:** Importing all pages directly in `AppRouter.tsx` causes the browser to download the code for _every_ page on the initial load. This slows down the "Time to Interactive".
**Goal:** Only load the code for the page the user is currently visiting.

### Implementation Steps

1.  **Open `src/routes/AppRouter.tsx`.**
2.  **Import `Suspense` and `lazy` from React.**
3.  **Replace static imports with `lazy` imports.**

```tsx
// BEFORE
import HomePage from "../pages/Home/HomePage";
import TransactionRoomPage from "../pages/Product/TransactionRoomPage";

// AFTER
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner"; // Ensure you have a spinner component

const HomePage = lazy(() => import("../pages/Home/HomePage"));
const TransactionRoomPage = lazy(
  () => import("../pages/Product/TransactionRoomPage")
);
```

4.  **Wrap Routes in `Suspense`.**
    You can wrap the entire `Routes` block or individual routes. Wrapping the whole block is usually easier.

```tsx
const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/transaction-room" element={<TransactionRoomPage />} />
        {/* ... other routes ... */}
      </Routes>
    </Suspense>
  );
};
```

### Best Practices

- **Group Related Routes:** You don't need to lazy load _every_ single component. Sometimes it makes sense to bundle related pages together if they are small.
- **Loading State:** Ensure your `fallback` component (e.g., `<LoadingSpinner />`) looks good and matches your app's theme.

## 2. Route Cleanup

**Problem:** Duplicate routes (e.g., `/admin/dashboard`) can cause confusion about which component is actually being rendered.
**Goal:** Establish a single source of truth for each route.

### Action Plan

1.  **Identify Duplicates:**

    - `/admin/dashboard` is defined in the "Public (Dev)" section AND the "Protected (Admin)" section.

2.  **Decide on Strategy:**

    - **Production:** The protected route is the "real" one.
    - **Development:** If you need to access the page without logging in for testing, create a specific "dev-only" path like `/dev/admin-dashboard`.

3.  **Refactor `AppRouter.tsx`:**

```tsx
// ... imports

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      {/* Dev-Only Routes (Consider wrapping in a check for envConfig.NODE_ENV === 'development') */}
      <Route path="/dev/ui-kit" element={<UIKitPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        {/* ... */}
      </Route>
    </Routes>
  );
};
```
